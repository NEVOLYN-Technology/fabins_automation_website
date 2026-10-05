# Transactional Mail Architecture — Reusable Agent Prompt

Use this file as an instruction set for an AI agent working on **any** NEVOLYN
product. It describes *principles* and points at a **reference implementation**
(FABINS) so the agent can read real code. Do not copy FABINS-specific names,
schema, statuses, addresses or wording.

---

## 0. Project context (fill in; never guess)

```text
PRODUCT       = [product name]          # appears first: PRODUCT@NEVOLYN
COMPANY       = NEVOLYN                 # never "NEVOLYN Technology"
FRONTEND_URL  = [url]
BACKEND_URL   = [url]
ADMIN_EMAIL   = [address]
DATABASE      = [engine]
MAIL_PROVIDER = [SMTP / REST provider]
```

Any value left in `[brackets]` is an **unknown**: report it, do not invent it.
Never print, log, commit or paste passwords, API keys, SMTP credentials or tokens.

## 1. Working protocol

1. **Discover** – read the repo; change nothing; report architecture, security
   findings, unknowns, breaking changes. Stop for approval.
2. **Plan** – classify each change `SAFE | BREAKING | REQUIRES MIGRATION | OPTIONAL`. Stop for approval.
3. **Implement** – security/correctness first, then email/documents/branding/UI.
4. **Verify** – run real tests/builds; report exact results. Never claim a pass you did not execute.

Preserve working behaviour and public API contracts. Prefer the simplest design
that meets the project's real reliability and security needs.

## 2. Target flow

```text
Controller (DTO + validation)
   → Service (persist, state change)          # transactional
        → EmailService (@Async)               # never blocks the request
             → EmailTemplateRenderer          # load, cache, escape, plain-text
             → EmailMessage (immutable)
             → dispatch (JavaMailSender / provider adapter)
```

Rules: controllers hold no business logic; the email layer makes no domain
decisions; PDF/document generation is a separate service returning `byte[]`.
A mail failure must never turn an already-persisted submission into an HTTP 500.

## 3. Reference implementation map (FABINS)

| Concern | File |
|---|---|
| Mail contract | `backend/src/main/java/com/fabins/service/EmailService.java` |
| Orchestration, dispatch, MIME, prod guard | `backend/src/main/java/com/fabins/service/impl/EmailServiceImpl.java` |
| Template loading, cache, escaping, plain text | `backend/src/main/java/com/fabins/service/mail/EmailTemplateRenderer.java` |
| Immutable message value object | `backend/src/main/java/com/fabins/service/mail/EmailMessage.java` |
| Acknowledge GET page + POST action | `controller/ContactInquiryController.java`, `controller/DeploymentRequestController.java` |
| State transition | `service/impl/ContactInquiryServiceImpl.java#acknowledge`, `DeploymentRequestServiceImpl.java#acknowledge` |
| Templates (6) | `backend/src/main/resources/templates/email/*.html` |
| Brand assets (CID) | `backend/src/main/resources/static/` |
| Mail tests | `backend/src/test/java/com/fabins/service/impl/EmailServiceImplTest.java` |

Read these before designing; adapt, do not duplicate.

## 4. Component contracts

### 4.1 `EmailMessage` — immutable record
Fields: `to, subject, htmlBody, plainTextBody, replyTo, attachment`.
Compact constructor enforces non-null `to`, `subject`, `htmlBody`. Builder
pattern; defensive copy of attachment bytes. Avoid methods like
`send(to, subject, html, text, replyTo, file, ...)`.
*Extend* (if needed) with a list of attachments and inline resources; FABINS
currently supports one attachment and wires inline CID images in `dispatch`.

### 4.2 `EmailTemplateRenderer`
- Loads templates from the classpath; caches in a `ConcurrentHashMap`.
- Replaces `{{key}}` with **`HtmlUtils.htmlEscape(value)`**; `null` → `""`.
- Only an explicit allow-list (`DEFAULT_RAW_KEYS`, e.g. `acknowledgeUrl`) bypasses
  escaping, and those values must be server-built, never user input.
- `generatePlainText(html)` strips comments/style/script/tags, converts block
  tags to newlines, decodes entities, normalises whitespace.
- **Gap to close in new projects:** after substitution, fail (or log an error) if
  `{{` or `}}` remain, so an unresolved token can never reach a recipient.

### 4.3 `EmailServiceImpl`
- `@Async` public methods; one private method per email (admin / sender / acknowledgement).
- Build the placeholder map with explicit fallbacks. **`Map.of` throws on any
  null value**, so use `x != null ? x : "<fallback>"` or `Map.ofEntries` with safe values.
- Compose an `EmailMessage`, then call a single `dispatch(...)`.
- `dispatch`: skip when credentials are blank in non-prod; build
  `MimeMessageHelper(msg, true, UTF-8)`, set From (`PRODUCT@NEVOLYN`), To, Subject,
  Reply-To, HTML + plain text; `addInline("brandLogo", classpath png, "image/png")`
  only when the HTML references `cid:brandLogo`; add the PDF attachment if present.
- Catch and log delivery failures with the **reference code**, never with
  credentials or full message bodies.
- `@PostConstruct` production guard: if the `prod` profile is active and mail
  credentials are blank, throw `IllegalStateException` (fail fast). Dev may simulate.

### 4.4 Optional provider abstraction
Introduce `EmailDeliveryProvider` (`Smtp…`, `Transactional…`) **only** if the
project must switch or combine providers. Otherwise keep one `dispatch`.

## 5. Email design rules

- **Structure:** nested `<table>` layout, inline CSS, 600–640px wrapper, solid
  `background-color` (no gradient-only backgrounds). No flexbox/grid/external CSS.
- **Light-mode lock:** `<meta name="color-scheme" content="light">`,
  `<meta name="supported-color-schemes" content="light">`, `:root{color-scheme:light}`,
  plus inline styles on every critical element.
- **Logo:** embed via `cid:` from classpath (never a hosted URL). On a dark header,
  place the logo in a white 44×44 rounded cell so dark artwork stays visible.
- **Preheader:** hidden `<div>` with a one-line, purpose-specific summary.
- **Sender / identity:** `PRODUCT@NEVOLYN`; header lockup product first, NEVOLYN second.
- **Subjects:** `[PRODUCT] <Type> [Ref: <code>]` — e.g. Inquiry Confirmation,
  New Contact Inquiry, Inquiry Acknowledged. Never the word "Alert". Do not put
  user-typed free text in the subject.
- **Echoing user input:** dedicated summary card (Subject, Message, Reference);
  `white-space: pre-wrap; word-break: break-word;` and a brand-colour left border.
  Always escaped by the renderer.
- **Admin mail:** reference, name, email, phone, subject, message, timestamp,
  status, Reply-To = the visitor; plus the acknowledge action.
- Use the **project's own** palette; the FABINS slate/sky palette is an example only.

## 6. MIME checklist

```text
multipart/mixed
├─ multipart/related
│   ├─ multipart/alternative
│   │   ├─ text/plain
│   │   └─ text/html
│   └─ image/png   (Content-ID: brandLogo)
└─ application/pdf (optional)
```

## 7. Acknowledgement / action links (security-critical)

- **GET must be side-effect free.** It renders a read-only confirmation page
  (HTML-escape any data shown). Email scanners and link previewers issue GETs.
- **POST performs the state change**, inside a transaction, then triggers the
  acknowledgement email. Repeated POSTs must be harmless (return an
  "already acknowledged" page, do not resend).
- FABINS already follows GET-page → POST-action (`…/{id}/acknowledge`).
- **Remaining weakness to fix in new projects:** the link is authorised only by an
  entity UUID. Prefer a signed, expiring, single-use token (e.g. HMAC over
  `id|expiry|nonce`, or a random token stored hashed), compared in constant time.
  A UUID is an identifier, not a credential. Also add CSRF protection or
  re-authentication for the POST if the endpoint is publicly reachable.
- State changes go through an explicit domain method (e.g. `markAcknowledged()`),
  not a public `setStatus`; log the transition with the reference code.

## 8. Persistence & audit

- Server-generated, unique, non-updatable `referenceCode`.
- Timestamps via JPA auditing; explicit status enum with allowed transitions.
- Constraints in the migration (`NOT NULL`, `UNIQUE`, `CHECK`, indexes), not only in code.
- Entities created through a static factory that validates required fields; no
  blanket public setters.
- Do not expose entities from controllers; use request/response DTOs.

## 9. Reliability

`@Async` is best-effort. If an email is business-critical, evaluate (and justify
before adding) a transactional outbox, retry with back-off, delivery status and
idempotency keys. For ordinary notifications, `@Async` + logged failure is enough.
Decide explicitly: what is atomic, what is async, what is retried, what happens
if the DB commit succeeds and the mail fails, and what if the HTTP request is retried.

## 10. Security checklist

- All user data entering HTML is escaped; raw keys are an allow-list of server-built values.
- Validate input with DTO + domain + DB constraints; defend against header/CRLF
  injection in `to` / `subject` / `replyTo`.
- CORS: explicit origins per environment; never `*` with credentials.
- Secrets only from environment/secret store; `.env*`, `run.md` and local profiles are gitignored.
- Logs: reference code, operation, outcome; never credentials, tokens or full bodies.
- Production fails fast when mail credentials are missing.

## 11. Tests required

1. Renderer: replacement, escaping (`<script>alert('xss')</script>`,
   `<img src=x onerror=alert(1)>`), `null`/empty, Unicode, long text, **no `{{` left**.
2. Service: admin + sender dispatch, recipient, subject, Reply-To, attachment, failure swallowed.
3. **Inspect the real `MimeMessage`** (parts: plain, html, inline image, attachment) —
   do not only mock `send()`.
4. Acknowledge: GET changes nothing; POST transitions once; second POST is idempotent.
5. Config: prod + blank credentials → startup fails; dev → simulation allowed.
6. Database: migrations apply, constraints and unique `referenceCode` hold.

Commands (adapt to the project):

```powershell
./mvnw test
./mvnw clean verify
npm run lint
npm run build
```

## 12. Final audit

Search the whole repo for: hardcoded credentials, state-changing GET, raw HTML
interpolation, `Map.of` with nullable values, wildcard CORS, legacy brand names /
domains / providers, the word "Alert", `TODO`, `FIXME`, `System.out.println`,
`printStackTrace`. Fix real findings; do not delete valid comments or tests.

## 13. Report format

Architecture · Database · Email · Security · Frontend · Tests (exact command and
counts) · Required environment variable **names** · Genuine remaining issues.
