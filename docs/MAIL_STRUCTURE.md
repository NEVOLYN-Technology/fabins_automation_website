# Transactional Mail Architecture — Reusable Agent Prompt & Architectural Blueprint

> **Role & Purpose:**  
> This document is the master instruction set and architectural standard for any developer or AI agent designing, refactoring, or auditing transactional email pipelines, server-rendered confirmation pages, and PDF generation across **any NEVOLYN product**.  
> It defines **structural contracts, design patterns, security controls, and code conventions**. Use the **FABINS** codebase as the living reference implementation to see these patterns applied. Never hardcode credentials, operational addresses, or secrets.

---

## 0. Project Context & Configuration Contract

Before implementing or refactoring, establish these configuration variables for the target product. Leave unknown values in `[BRACKETS]`—never invent them or embed real secrets:

```text
PRODUCT_NAME     = [PRODUCT_NAME]           # Header lockup: e.g. PRODUCT@NEVOLYN
COMPANY_NAME     = NEVOLYN                  # Umbrella entity: strictly "NEVOLYN" (never "NEVOLYN Technology")
BACKEND_ORIGIN   = [BACKEND_BASE_URL]       # Public backend root for absolute email action links
FRONTEND_ORIGIN  = [FRONTEND_BASE_URL]      # Public web client origin
ADMIN_EMAIL      = [INTERNAL_ADMIN_EMAIL]   # Mailbox where staff notifications/escalations land
FROM_EMAIL       = [ENVELOPE_SENDER_EMAIL]  # Authenticated mailbox sender matching SMTP credentials
MAIL_TRANSPORT   = [SMTP_HOST_AND_PORT]     # Standard SMTPS (465 SSL/TLS) or STARTTLS (587)
DATABASE         = [DATABASE_ENGINE]        # Relational engine managed via migrations (e.g. PostgreSQL)
DOCUMENT_LABEL   = Tracking Reference Code  # Standardized user-facing reference label
```

> **Zero-Credential Mandate:**  
> A prompt, specification, or code commit must never expose passwords, API tokens, production credentials, or real user mailboxes. All credentials must resolve exclusively through runtime environment variables.

---

## 1. Professional Working Protocol

When assigned to build or refactor transactional messaging in any product, follow this 4-step protocol:

1. **Observe & Audit:** Inspect existing routes, controllers, entities, DTOs, and templates without mutating files. Map out current mail dispatches, missing validations, inline markup leaks, and idempotency vulnerabilities.
2. **Plan Structural Refactoring:** Classify proposed changes (`SAFE`, `BREAKING`, `REQUIRES MIGRATION`). Stop for user confirmation on architectural decisions.
3. **Implement with Separation of Concerns:**
   - **Persistence & Domain:** Transactional state changes and entity validation.
   - **Asynchronous Messaging:** Decoupled, non-blocking dispatch with immutable message packaging.
   - **Template & View Layer:** 100% externalized HTML templates with automatic XSS escaping.
   - **Idempotence & Security:** Single-dispatch protection and scanner-safe pre-flight confirmations.
4. **Verify Against Automated Tests:** Run the full integration suite and assert on MIME structure, idempotence, and XSS sanitization before finishing.

---

## 2. End-to-End Architectural Flow

The transactional architecture enforces strict separation of concerns across 5 distinct phases:

```text
1. Client Request
   └─► HTTP POST (Public Form)
         │
2. Orchestration Controller
   └─► DTO Binding & Bean Validation (@Valid)
   └─► Honeypot Filter (silent discard on automated bots)
   └─► Returns HTTP 201 Created with canonical Location header
         │
3. Domain Service (@Transactional)
   └─► Database Persistence (Flyway-managed entity, server-generated reference code)
   └─► Emits Asynchronous Notification Event: emailService.sendXxxNotifications(entity)
         │
4. Asynchronous Messaging Engine (@Async)
   ├─► PDF Generation (optional document service, returns byte[])
   ├─► Template Rendering (EmailTemplateRenderer: classpath load, in-memory cache, auto-XSS escape)
   ├─► Plain-Text Fallback Generation (HTML tag stripping, spacing normalization)
   ├─► Immutable Message Packaging (EmailMessage record with defensive copies)
   └─► MIME Construction & Dispatch (JavaMailSender, multipart/alternative + inline CID logos + attachment)
         │
5. Administrator Pre-Flight & Single-Acknowledgement Flow
   ├─► GET /{id}/acknowledge   ──► Safe read-only pre-flight page + Live Outgoing Email Preview Card
   └─► POST /{id}/acknowledge  ──► Atomic state transition + Dispatches customer acknowledgement email
                                   (Idempotent: duplicate attempts suppressed, renders "Already Acknowledged")
```

### Core Architecture Axioms:
1. **Controllers hold ZERO HTML markup:** Never concatenate raw HTML strings or templates inside `@RestController` or `@Controller` classes. All user-facing views must reside in standalone template files under `resources/templates/`.
2. **Non-blocking asynchronous dispatch:** All external messaging calls must execute asynchronously (`@Async`) so client response latency remains under `< 100ms`, regardless of SMTP or network delays.
3. **Persistence isolation:** Mail delivery errors must never roll back already-committed database transactions or return HTTP 500 errors to visitors.
4. **Idempotent state transitions:** Automated email security scanners (SafeLinks, Proofpoint, Mimecast) aggressively perform HTTP `GET` requests on links inside emails. `GET` routes must be strictly read-only. State mutation and email triggers must belong exclusively to `POST`.

---

## 3. Reference Implementation Map (FABINS)

The FABINS repository demonstrates this architecture in its most refined, production-proven form:

| Architecture Layer | Reference Implementation |
|---|---|
| **Mail Contract Interface** | `backend/src/main/java/com/fabins/service/EmailService.java` |
| **Mail Engine & Dispatcher** | `backend/src/main/java/com/fabins/service/impl/EmailServiceImpl.java` |
| **Template Cache & Sanitizer** | `backend/src/main/java/com/fabins/service/mail/EmailTemplateRenderer.java` |
| **Immutable Message Value Object** | `backend/src/main/java/com/fabins/service/mail/EmailMessage.java` |
| **PDF Document Generator** | `backend/src/main/java/com/fabins/service/impl/PdfGenerationServiceImpl.java` |
| **Pre-Flight Web Controllers** | `backend/src/main/java/com/fabins/controller/DeploymentRequestController.java`<br/>`backend/src/main/java/com/fabins/controller/ContactInquiryController.java` |
| **Idempotent Service Guards** | `backend/src/main/java/com/fabins/service/impl/DeploymentRequestServiceImpl.java`<br/>`backend/src/main/java/com/fabins/service/impl/ContactInquiryServiceImpl.java` |
| **Email Templates (6)** | `backend/src/main/resources/templates/email/*.html` |
| **Web Pre-Flight Templates (4)** | `backend/src/main/resources/templates/web/*.html` |
| **Inline Brand Assets (CID)** | `backend/src/main/resources/static/` |
| **Integration Test Suite** | `backend/src/test/java/com/fabins/controller/DeploymentRequestControllerTest.java`<br/>`backend/src/test/java/com/fabins/service/impl/EmailServiceImplTest.java` |

---

## 4. Component Design Specifications

### 4.1 Immutable Message Value Object (`EmailMessage`)
- Implemented as a Java `record` with a builder pattern.
- Invariants: `to`, `subject`, and `htmlBody` are strictly required (null checks in compact constructor).
- Binary attachments stored with defensive copies (`byte[].clone()`) to ensure memory safety across asynchronous boundaries.
- Optional fields: `plainTextBody`, `replyTo`, `attachmentFilename`, `attachmentBytes`.

### 4.2 Template Engine & Sanitizer (`EmailTemplateRenderer`)
- **In-Memory Cache:** Loads classpath templates once into a `ConcurrentHashMap<String, String>` to eliminate disk I/O bottlenecks.
- **Variant Resolution:** Gracefully resolves between `-mail.html` and `-email.html` filename conventions.
- **Automatic HTML Escaping:**
  - Dynamic parameters `{{key}}` are automatically escaped via Spring's `HtmlUtils.htmlEscape(value)`.
  - Only server-constructed keys explicitly listed in `DEFAULT_RAW_KEYS` (e.g. `acknowledgeUrl`, `actionUrl`) bypass escaping.
- **Plain-Text Engine (`generatePlainText`):**
  - Strips HTML comments (`<!-- ... -->`).
  - Strips `<style>` and `<script>` blocks entirely.
  - Converts `<br>`, `</p>`, `</div>`, `</tr>`, `</li>`, and heading tags to structured line breaks.
  - Strips residual tags, unescapes entities (`HtmlUtils.htmlUnescape`), and normalizes whitespace.

### 4.3 Mail Engine & Dispatcher (`EmailServiceImpl`)
- **MIME Composition Hierarchy:**
  ```text
  multipart/mixed
  ├── multipart/related
  │   ├── multipart/alternative
  │   │   ├── text/plain (Clean RFC fallback generated by templateRenderer)
  │   │   └── text/html (Responsive HTML with light-mode lock)
  │   ├── image/png (Content-ID: brandLogo)
  │   └── image/png (Content-ID: companyIcon)
  └── application/pdf (Attachment: Optional document report)
  ```
- **CID Embedded Logos:** Logos are packaged as inline MIME parts from the classpath. This eliminates external HTTP dependencies and prevents email clients from blocking images.
- **Direct Reply-To:** Admin notification emails set `Reply-To` to the submitter's email address, allowing team members to hit "Reply" in their email client to engage directly.
- **Fail-Fast Production Validation (`@PostConstruct`):** If the application starts under `prod` or `production` profiles without SMTP credentials, it must throw an `IllegalStateException` immediately. Silent simulation is strictly restricted to local development.
- **Safe Development Simulation:** In non-prod environments with empty credentials, dispatch logs `[WEBMAIL SIMULATED]` with recipient, subject, and attachment info, allowing local development without SMTP dependencies.

---

## 5. Security & Idempotence Standards

### 5.1 Single-Acknowledgement State Machine
To guarantee that an applicant or visitor never receives duplicate acknowledgement emails:

```text
[State: NEW] ──(Admin Confirms via POST)──► [State: IN_REVIEW / REPLIED] ──► Dispatches Email
      │                                                │
      │                                                └──(Repeated Action)──► Suppress Email
      │                                                                         Return "Already Acknowledged"
      └──(Scanner Hits GET)──► Read-Only Pre-flight Form + Outgoing Email Preview
```

1. **Service-Layer Guard:**
   The domain service must verify current status before dispatching emails. If status is already updated, suppress the dispatch, log a warning with the reference code, and return cleanly.
2. **Controller-Layer Guard:**
   - When `GET /{id}/acknowledge` is requested for an already-acknowledged entity, return the `result.html` view with status badge and **no confirmation button**.
   - When `POST /{id}/acknowledge` is called on an already-acknowledged entity, bypass the service transition and return the idempotent result view immediately.

### 5.2 Anti-Scanner Protection
- `GET /{id}/acknowledge` displays:
  - Form/application summary card.
  - Prominent **Tracking Reference Code**.
  - **Live Outgoing Email Preview Card** displaying the exact message the recipient will receive.
  - Single-acknowledgement safety notice.
  - Confirmation button protected by browser confirmation dialog (`onsubmit="return confirm(...)"`).
- Only `POST /{id}/acknowledge` triggers the state change and fires downstream mail events.

### 5.3 PDF Generation Standard
- Generator returns raw `byte[]` via a dedicated document service (e.g. iText 8).
- Standardized attachment naming:  
  `[PRODUCT]_Deployment_Assessment-{{referenceCode}}.pdf`

---

## 6. Template Catalog & Design Rules

### 6.1 Required Template Sets

1. **Email Templates (`resources/templates/email/`):**
   - `<entity>-admin-notification-mail.html`: Comprehensive internal alert for team members with details, direct Reply-To, and 1-click acknowledge button.
   - `<entity>-sender-confirmation-mail.html`: Immediate submission confirmation for the customer with request summary and SLA notice.
   - `<entity>-acknowledgement-email.html`: Follow-up message sent after staff officially acknowledges the request.
2. **Web Pre-Flight Templates (`resources/templates/web/`):**
   - `<entity>-acknowledge-confirm.html`: Pre-flight confirmation view with entity attributes, live email preview card, and POST confirmation form.
   - `<entity>-acknowledge-result.html`: Post-action success receipt and idempotent "Already Acknowledged" screen.

### 6.2 Email HTML/CSS Best Practices
- **Structure:** Nested `<table>` elements with `cellpadding="0" cellspacing="0" border="0"`. No flexbox, CSS grid, or external stylesheets.
- **Width:** Fixed container width between `600px` and `640px`, centered with `margin: 0 auto;`.
- **Light-Mode Lock:**
  ```html
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light; }
  </style>
  ```
- **Branding Separation:**
  - **Internal Admin Emails:** Clean, operational, minimal footer (no external marketing copy).
  - **External Customer Emails:** Professional footer featuring product lockup and company branding.
- **Preheader:** Hidden preview text `<div>` placed immediately after `<body>` to control inbox preview snippets.

---

## 7. Configuration Schema & Environment Contract

All mail configurations must map to standard environment variables:

```yaml
# Spring Framework SMTP Contract
spring:
  mail:
    host: ${SPRING_MAIL_HOST}
    port: ${SPRING_MAIL_PORT:465}
    username: ${SPRING_MAIL_USERNAME}
    password: "${SPRING_MAIL_PASSWORD:}"
    properties:
      mail:
        smtp:
          auth: true
          ssl:
            enable: ${SPRING_MAIL_SSL_ENABLE:true}
          starttls:
            enable: ${SPRING_MAIL_STARTTLS_ENABLE:false}

# Application Mail Routing Contract
app:
  backend-url: ${APP_BACKEND_URL}
  frontend-url: ${APP_FRONTEND_URL}
  mail:
    admin-address: ${APP_MAIL_ADMIN_ADDRESS}
    from-address: ${APP_MAIL_FROM_ADDRESS}
    sender-name: ${APP_MAIL_SENDER_NAME}
    admin-subject: "[PRODUCT] Assessment Request: %s"
    sender-subject: "[PRODUCT] Request Confirmed [Ref: %s]"
    acknowledgement-subject: "[PRODUCT] Request Acknowledged [Ref: %s]"
```

---

## 8. Verification & Test Suite Requirements

Every transactional mail implementation must validate against these test cases:

```powershell
cmd /c "mvnw.cmd test"
```

### Essential Test Assertions:
1. **Renderer Sanitization:** Verify `<script>` and `<img>` tags in user inputs are escaped via `HtmlUtils.htmlEscape`, while raw allow-listed URLs remain unescaped.
2. **Plain-Text Extraction:** Verify HTML comments and styles are stripped, and paragraphs convert to clean line breaks.
3. **MIME Structure:** Verify `MimeMessage` contains `text/plain`, `text/html`, inline CID logos, and attachments with correct filenames.
4. **Scanner Safety:** Verify `GET /{id}/acknowledge` renders the pre-flight confirmation page without altering entity status.
5. **State Transition:** Verify `POST /{id}/acknowledge` transitions entity status and dispatches the acknowledgement email.
6. **Idempotence:** Verify a second `POST` request suppresses duplicate email dispatches and returns the "Already Acknowledged" screen.
7. **Production Guard:** Verify application refuses to boot in `prod` profile when `SPRING_MAIL_PASSWORD` is blank.

---
*NEVOLYN Engineering Standard • Core Architectural Specification*
