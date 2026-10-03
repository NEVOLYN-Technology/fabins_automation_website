# FABINS — CI/CD & Deployment Guide

Everything needed to deploy, operate and move this stack to a custom domain,
written from what actually broke on the way to production rather than from the
happy path.

Read §2 and §3 before touching the database or email configuration. Both
describe failure modes that look like something else entirely, and both cost
real hours to diagnose the first time.

| | |
| --- | --- |
| **Frontend** | Next.js 16 · React 19 · Tailwind 4 → Vercel |
| **Backend** | Spring Boot 3.4 · Java 21 · Maven → Render (Docker) |
| **Database** | PostgreSQL 18 → Render Managed Postgres |
| **Email** | Brevo — HTTPS REST API v3, SMTPS fallback |
| **CI** | GitHub Actions — [`.github/workflows/deploy-and-test.yml`](../.github/workflows/deploy-and-test.yml) |

## Contents

1. [Architecture & topology](#1-architecture--topology)
2. [PostgreSQL JDBC URL parsing & environment precedence](#2-postgresql-jdbc-url-parsing--environment-precedence)
3. [Cloud PaaS port blocking — SMTP vs REST API](#3-cloud-paas-port-blocking--smtp-vs-rest-api)
4. [Custom domain setup](#4-custom-domain-setup)
5. [The CI/CD pipeline](#5-the-cicd-pipeline)
6. [Environment variable reference](#6-environment-variable-reference)
7. [First deployment, start to finish](#7-first-deployment-start-to-finish)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Architecture & topology

```mermaid
graph TD
    V["Visitor's browser"]

    subgraph Vercel["Vercel — global edge CDN"]
        F["Next.js 16 static site<br/>fabins-portfolio.vercel.app"]
    end

    subgraph Render["Render — Oregon region"]
        B["Spring Boot 3 API<br/>Docker · JDK 21 · port 8080<br/>fabins-api.onrender.com"]
        D[("PostgreSQL 18<br/>private network")]
    end

    subgraph Brevo["Brevo"]
        M["Transactional email"]
    end

    I["Inboxes<br/>R&D team · mill contact"]

    V -->|"HTTPS · page load"| F
    V -->|"HTTPS · POST /api/v1/deployment-requests<br/>CORS-checked against FABINS_ALLOWED_ORIGIN"| B
    B -->|"JDBC over TLS · Hikari pool of 10"| D
    B -->|"HTTPS :443 · REST v3 — primary"| M
    B -.->|"SMTPS :465 — fallback, often blocked"| M
    M -->|"SPF · DKIM · DMARC signed"| I
    I -.->|"one-click acknowledge link<br/>GET FABINS_BACKEND_URL/…/acknowledge"| B
```

### Request path for one enquiry

1. The visitor submits the contact form. `lib/api/contact.ts` POSTs to
   `NEXT_PUBLIC_API_BASE_URL` — the browser calls the API **directly**, so the
   API's origin is public and CORS is what governs access.
2. Spring validates the payload, writes a row, and returns `201 Created` with a
   `Location` header. The response is not held up by email: dispatch is
   `@Async` and returns to the visitor in single-digit milliseconds.
3. On a background thread, two emails go out — an alert to the R&D team
   carrying a one-click acknowledge link, and a receipt to the mill contact.
4. Clicking the acknowledge link moves the request to `IN_REVIEW` and sends a
   third email. That link is why the backend needs to know its own public
   origin (`FABINS_BACKEND_URL`); an email client cannot resolve a relative URL.

### Why the browser calls the API directly

There is no Next.js proxy route in front of the API. That keeps the frontend a
fully static export — no serverless functions, no cold starts on Vercel, no
duplicated request validation — at the cost of making CORS load-bearing. If a
proxy is ever added, `FABINS_ALLOWED_ORIGIN` stops mattering and the API origin
can be made private, which is the main reason you would do it.

### Cold starts

Render's free tier suspends a service after ~15 minutes of inactivity. The next
request pays for a full JVM boot: **30-50 seconds**. This is not a bug, and it
is why the frontend uses a 60-second request timeout instead of the usual 10-15
(see `frontend/lib/api/contact.ts`). A shorter timeout aborts submissions the
backend goes on to accept, showing the visitor a failure for an enquiry that
was in fact recorded.

Options, in order of cost: leave it (the form still works, just slowly); ping
`/actuator/health` on a schedule to keep the instance warm; upgrade to a paid
always-on plan. Only the last one actually removes it.

---

## 2. PostgreSQL JDBC URL parsing & environment precedence

**Symptom.** The application refuses to start on Render with:

```text
java.sql.SQLException: Driver org.postgresql.Driver claims to not accept jdbcUrl,
postgres://fabins_user:s3cret@dpg-abc123.oregon-postgres.render.com/fabins
```

or, having got past that, with `FATAL: password authentication failed for user`
against a URL that visibly contains the correct password.

### Why it happens — two failures, not one

Every PaaS that provisions a database — Render, Heroku, Railway, Fly, Supabase
— publishes it as a **libpq connection URI**:

```text
postgres://user:password@host/database
```

That is the format `psql` and the C client library accept. The **PostgreSQL
JDBC driver accepts neither half of it**:

| | libpq URI | What JDBC requires |
| --- | --- | --- |
| Scheme | `postgres://` or `postgresql://` | `jdbc:postgresql://` |
| Credentials | in the URL's userinfo section | separate `user` / `password` properties |
| Port | often omitted | defaults to 5432, but see below |

Two distinct failures, which is why fixing only the scheme produces the second,
more confusing error. The driver does not merely ignore embedded credentials —
it connects anonymously and lets the server reject the attempt.

### The fix, and why it lives where it does

[`FabinsApplication.java`](../backend/src/main/java/com/fabins/FabinsApplication.java)
registers an `ApplicationListener<ApplicationEnvironmentPreparedEvent>` that
rewrites the URL before anything can read it.

```text
JVM start
  │
  ├─ loadDotEnv()                     local .env → system properties
  │
  ├─ Environment prepared             OS env vars + application*.yml loaded
  │    └─ ▶ OUR LISTENER RUNS HERE ◀  parse DATABASE_URL, addFirst(MapPropertySource)
  │
  ├─ ApplicationContext created
  │    ├─ HikariCP builds the pool    reads spring.datasource.url  ← already clean
  │    └─ Flyway opens a connection   reads the same property      ← already clean
  │
  └─ Application ready
```

`ApplicationEnvironmentPreparedEvent` is the **last point at which the
environment can still be modified and the first at which it is fully
populated**. Everything else is too late:

| Approach | Why it fails |
| --- | --- |
| `@Bean` post-processor | The context is already refreshing; Hikari is among the first beans built. |
| `@PostConstruct` | Runs after the datasource exists. |
| Rewriting in `main()` before `run()` | The `Environment` does not exist yet — there is nothing to read `DATABASE_URL` from except the raw OS, which loses profile and YAML layering. |
| A shell wrapper in the Dockerfile | Works, but moves application logic into an untested `ENTRYPOINT` string. |

The parsed values are installed with **`addFirst`**, not `addLast`:

```java
environment.getPropertySources()
        .addFirst(new MapPropertySource("fabinsCloudDatabaseProperties", properties));
```

Spring resolves a property by walking its sources in order and taking the first
hit. `addLast` would place the clean values *below* the OS environment variables
they were derived from, so the original unusable `DATABASE_URL` would still win
and nothing would appear to have changed.

### Precedence, highest first

```text
1.  command-line arguments               --spring.datasource.url=…
2.  ▶ fabinsCloudDatabaseProperties ◀    injected by our listener
3.  system properties                    -D…, and everything loadDotEnv() sets
4.  OS environment variables             DATABASE_URL as the platform set it
5.  application-{profile}.yml            application-prod.yml
6.  application.yml
```

Two practical consequences:

- The `${SPRING_DATASOURCE_URL:${DATABASE_URL}}` placeholders in
  `application-prod.yml` are **never consulted on Render** — level 2 satisfies
  the property first. They still matter for Docker Compose and any host that
  hands you a proper JDBC URL, which is why they are kept.
- `loadDotEnv()` writes system properties (level 3), deliberately outranking OS
  environment variables (level 4). A stale `SPRING_MAIL_PASSWORD` exported in a
  terminal months ago cannot shadow the `.env` file being edited right now.

### What the listener does, step by step

Given `postgres://fabins_user:s3cret@dpg-abc123.oregon-postgres.render.com/fabins`:

| Step | Action | Result |
| --- | --- | --- |
| 0 | Return immediately if `DATABASE_URL` is absent | dev/test/Compose untouched |
| 1 | Strip `jdbc:`, then `postgres://` / `postgresql://` | `fabins_user:s3cret@dpg-…/fabins` |
| 2 | Split userinfo at `@`, credentials at `:` | user + password become properties |
| 3 | Insert `:5432` if the host carries no port | `dpg-….com:5432/fabins` |
| 4 | Prefix `jdbc:postgresql://` | `jdbc:postgresql://dpg-….com:5432/fabins` |
| 5 | `addFirst` the map; log the credential-free URL | Hikari and Flyway see only this |

The startup log line — `[FABINS] Normalised cloud JDBC URL: …` — is safe to
read in a shared log: credentials were removed at step 2. It is printed with
`System.out` rather than a logger because no logging system is initialised that
early in the lifecycle.

### Flyway on a managed database

Flyway runs migrations from `backend/src/main/resources/db/migration` on every
boot. Point it at an **empty** database or one it created. It will not adopt a
schema it does not have a history table for; against a pre-existing schema it
fails rather than guessing. Restore a dump first, or run
`flyway baseline`, if you are migrating an existing database in.

---

## 3. Cloud PaaS port blocking — SMTP vs REST API

**Symptom.** Email works perfectly on a laptop and silently does nothing in
production. The logs show no error for 30-60 seconds, then:

```text
MailConnectException: Couldn't connect to host, port: smtp-relay.brevo.com, 587;
timeout 60000
```

The request that triggered it had already returned `201` to the visitor, so the
form looks fine and the emails simply never arrive.

### Why it happens — providers drop, they do not reject

Cloud providers block outbound SMTP by default. A compromised container that
can reach port 25 or 587 becomes a spam relay within minutes, and the
provider's whole IP range gets blacklisted. So Render, AWS EC2, Google Cloud,
Azure and Fly all restrict outbound 25, 465 and 587 to some degree.

The damaging detail is **how** they block it: the packets are dropped, not
rejected. A rejected connection fails in milliseconds with `ECONNREFUSED`. A
dropped one hangs until the socket timeout — by default in JavaMail, **infinite**
— occupying a thread the whole time. That is why the failure presents as
"nothing happens" rather than as an error.

### The three ports

| Port | Protocol | On a laptop | On a PaaS |
| --- | --- | --- | --- |
| 25 | SMTP, plaintext | works | blocked everywhere, no exceptions |
| 587 | SMTP + STARTTLS | works | usually blackholed — hangs |
| 465 | SMTPS, implicit SSL | works | sometimes allowed |
| **443** | **HTTPS REST** | **works** | **never blocked — it is the web** |

STARTTLS on 587 opens the connection in **plaintext** and upgrades afterwards;
SMTPS on 465 is encrypted from the first byte. That difference is why 465 is
sometimes permitted where 587 is not — but "sometimes" is not a deployment
strategy, and this is why the primary engine speaks HTTPS.

### The two-engine design

[`EmailServiceImpl`](../backend/src/main/java/com/fabins/service/impl/EmailServiceImpl.java)
picks a transport from the configured credential:

```text
dispatch(to, subject, html, replyTo)
  │
  ├─ fabins.mail.api-key starts with "xsmtpsib-" ?
  │     │
  │     └─ YES → POST https://api.brevo.com/v3/smtp/email      ← port 443
  │               ├─ 2xx  → done, typically <100 ms
  │               └─ else → log the response body, fall through
  │
  └─ JavaMail over SMTPS :465                                   ← may hang
        ├─ no JavaMailSender bean → log the message instead (local dev)
        └─ failure → log.error with the full stack trace
```

Engine selection is entirely a function of the key's `xsmtpsib-` prefix, so
switching a deployment between transports is a matter of which credential is
set — no code change and no profile change.

Notes on the implementation that are worth keeping:

- **The JSON body is built with Jackson**, not string formatting. An email body
  is arbitrary HTML full of quotes and newlines; hand-escaping it works right up
  until a mill's name contains an apostrophe.
- **The API key is `.trim()`ed.** A key pasted into a dashboard field very often
  carries a trailing newline, and Brevo answers a bare `401` with no hint as to
  why.
- **Timeouts are 10 seconds**, on both the HTTP client and (via
  `spring.mail.properties.mail.smtps.*`) the SMTP transport. JavaMail's default
  is unlimited, which means one blocked send occupies an async worker forever.
- **`InterruptedException` re-sets the interrupt flag** before falling back.
  Swallowing it hides shutdown from the thread pool and can leave the JVM
  refusing to stop.

### Brevo setup

1. Create a free account — 300 emails/day, which is ample for a contact form.
2. **Senders, Domains & Dedicated IPs → Senders**: add and verify the sender
   address. An unverified sender is rejected with HTTP 400 by the REST API and
   550 by SMTP, and no amount of correct configuration fixes it.
3. **SMTP & API → SMTP**: copy the key beginning `xsmtpsib-`. This single key
   authenticates both the REST API and SMTP, which is why one environment
   variable (`SPRING_MAIL_PASSWORD`) drives both engines.
4. Note the SMTP **login** shown on the same page — something like
   `b3c905001@smtp-brevo.com`. It is *not* the sender address, and using the
   sender address as the login is a common cause of a persistent 535.

Deliverability without domain authentication is mediocre — expect Gmail's
Promotions tab or spam. §4.4 fixes that properly.

---

## 4. Custom domain setup

Worked example: the site at `fabins.com`, the API at `api.fabins.com`, email
sent from `@fabins.com`. Substitute your own domain throughout.

The order matters. DNS first, then the platforms, then the application
environment variables, then email authentication.

### 4.1 Frontend on Vercel

1. **Vercel → project → Settings → Domains → Add** → `fabins.com`. Add
   `www.fabins.com` too and let Vercel redirect one to the other; pick which is
   canonical and be consistent, because an origin match is exact.
2. Create the records Vercel shows you at your registrar:

   | Record | Name | Value | Notes |
   | --- | --- | --- | --- |
   | `A` | `@` | `76.76.21.21` | Vercel's apex IP — confirm the current value in the dashboard |
   | `CNAME` | `www` | `cname.vercel-dns.com` | never point a CNAME at the apex |

   An apex domain cannot hold a `CNAME` — that is a DNS rule, not a Vercel
   limitation. Use the `A` record, or your registrar's `ALIAS`/`ANAME` type if
   it offers one.
3. Wait for propagation. Vercel issues a Let's Encrypt certificate
   automatically once the records resolve; this usually takes minutes but the
   TTL on any previous record is the real lower bound.
4. Verify: `dig fabins.com +short` and `curl -I https://fabins.com`.

### 4.2 Backend on Render

1. **Render → service → Settings → Custom Domains → Add** → `api.fabins.com`.
2. Create the record Render shows you:

   | Record | Name | Value |
   | --- | --- | --- |
   | `CNAME` | `api` | `fabins-api.onrender.com` |

   A subdomain, so a `CNAME` is fine here.
3. Render provisions TLS automatically. Verify with
   `curl https://api.fabins.com/actuator/health` — expect `{"status":"UP"}`.
4. **Keep the `onrender.com` hostname working.** Acknowledge links already
   delivered to inboxes point at it, and those emails do not get rewritten.

### 4.3 CORS & environment updates

Three variables, and all three must agree. Getting one wrong produces a CORS
error in the browser console that is rarely about CORS.

| Variable | Where | New value | Effect of getting it wrong |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel | `https://api.fabins.com` | The browser calls the old host — which still works, so the bug hides |
| `FABINS_ALLOWED_ORIGIN` | Render | `https://fabins.com` | Browser blocks the response: *"No 'Access-Control-Allow-Origin' header"* |
| `FABINS_BACKEND_URL` | Render | `https://api.fabins.com` | Acknowledge links in new emails point at the old host |

Then **redeploy both**. Neither change takes effect on a restart alone:

- `NEXT_PUBLIC_*` is inlined into the JavaScript bundle **at build time**.
- The CORS bean is built once at **application startup**.

Points worth knowing before you debug this at 2am:

- **An origin is scheme + host + port, matched exactly.**
  `https://fabins.com` does not cover `https://www.fabins.com`, and `http://`
  does not cover `https://`. Serving both apex and www means listing both.
- **Do not comma-separate origins into one variable.** `fabins.cors.allowed-origins`
  is a YAML list; a comma-separated value binds as a single origin string and
  matches nothing. Add list entries in `application-prod.yml` instead — the
  annotated block there shows the shape.
- **Wildcards are legal here.** `SecurityConfig` uses
  `setAllowedOriginPatterns`, not `setAllowedOrigins`, so `https://*.vercel.app`
  works and keeps preview deployments alive. `setAllowedOrigins("*")` would be
  rejected at startup because the CORS spec forbids a wildcard
  `Access-Control-Allow-Origin` on a credentialed request. Drop the preview
  wildcard before launch if previews should not reach production data.

Verify the preflight directly, without a browser in the way:

```bash
curl -i -X OPTIONS https://api.fabins.com/api/v1/deployment-requests \
  -H "Origin: https://fabins.com" \
  -H "Access-Control-Request-Method: POST"
# expect: 200 and Access-Control-Allow-Origin: https://fabins.com
```

### 4.4 Brevo domain authentication — SPF, DKIM, DMARC

Sending as `noreply@fabins.com` without authenticating the domain is how mail
lands in spam. Receiving servers have no way to tell the difference between
your Brevo account and someone else forging your domain, so they assume the
worst.

In **Brevo → Senders, Domains & Dedicated IPs → Domains → Authenticate**, add
`fabins.com` and create the records it generates:

| Purpose | Type | Host | Value |
| --- | --- | --- | --- |
| **SPF** — which servers may send as you | `TXT` | `@` | `v=spf1 include:spf.brevo.com mx ~all` |
| **DKIM** — cryptographic signature | `TXT` | `mail._domainkey` | `k=rsa; p=MIGfMA0…` *(from Brevo)* |
| **Brevo ownership check** | `TXT` | `@` | `brevo-code:…` *(from Brevo)* |
| **DMARC** — policy for failures | `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@fabins.com` |

What each one does:

- **SPF** lists the servers permitted to send for the domain. `~all` is a soft
  fail — mail from elsewhere is accepted but marked suspicious. Use it while
  rolling out; tighten to `-all` once you are certain nothing else sends as
  this domain. **A domain may have exactly one SPF record.** If one exists,
  merge `include:spf.brevo.com` into it rather than adding a second — two SPF
  records is a permanent error, and it fails closed.
- **DKIM** signs each message with a private key Brevo holds; the recipient
  verifies it against the public key in DNS. This is what survives forwarding,
  where SPF does not.
- **DMARC** tells receivers what to do when SPF and DKIM disagree, and where to
  send reports. **Start with `p=none`** — it changes no delivery behaviour and
  only collects data. Read the aggregate reports for a couple of weeks, confirm
  legitimate mail passes, then move to `p=quarantine` and eventually
  `p=reject`. Going straight to `p=reject` is the reliable way to make your own
  invoices vanish.

Then:

1. Click **Verify** in Brevo. Propagation is usually under an hour; a stale TTL
   can make it longer.
2. Set `SPRING_MAIL_FROM=fabins@nevolyn.com` on Render and redeploy.
3. Send a test through the live form and check the received headers for
   `spf=pass`, `dkim=pass`, `dmarc=pass`. In Gmail: **Show original**.
4. Score the setup at [mail-tester.com](https://www.mail-tester.com) — aim for
   9/10 or better.

---

## 5. The CI/CD pipeline

[`.github/workflows/deploy-and-test.yml`](../.github/workflows/deploy-and-test.yml)

```text
push / PR to main
      │
      ├── validate-backend ──┐   JDK 21 Temurin · ~/.m2 cached
      │                      │   mvnw test → mvnw package → upload jar
      │                      │
      ├── validate-frontend ─┤   Node 20 · pnpm store + .next/cache cached
      │                      │   tsc --noEmit → next build
      │                      │
      └──────────────────────┴──▶ deploy   (main only, never from a PR)
                                    ├── POST Render deploy hook
                                    └── POST Vercel deploy hook
```

### What is cached, and why it is fast

| Cache | Handled by | Saves |
| --- | --- | --- |
| `~/.m2/repository` | `setup-java` with `cache: maven` | ~60s of dependency downloads |
| pnpm store | `setup-node` with `cache: pnpm` | ~30s of installs |
| `frontend/.next/cache` | explicit `actions/cache` step | Turns a full rebuild into an incremental one |

The `.next/cache` key includes a hash of every `.ts`/`.tsx` file, with a
`restore-keys` prefix falling back to the previous build's cache. A source
change therefore gets a fresh entry while still starting from warm state.

The two validate jobs run in parallel and neither is on the other's critical
path, so total wall time is roughly the slower of the two plus the deploy.

### Repository secrets

Add these under **Settings → Secrets and variables → Actions**:

| Secret | Where to get it |
| --- | --- |
| `RENDER_DEPLOY_HOOK_URL` | Render → service → Settings → **Deploy Hook** |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel → project → Settings → Git → **Deploy Hooks** → create one for `main` |

Both are **optional by design**: each deploy step is guarded so that a fork or
a fresh clone gets working CI with the deploy steps skipped rather than a red
run.

Both URLs embed their own credential. Treat them as passwords — never `echo`
one into a log, and rotate it in the platform dashboard if it leaks.

#### The `secrets`-in-`if` trap

The obvious way to write that guard does not work:

```yaml
# BROKEN — fails validation before any job starts
- name: Deploy
  if: ${{ secrets.RENDER_DEPLOY_HOOK_URL != '' }}
```

GitHub does not expose the `secrets` context to a step's `if`. The documented
contexts there are `github, needs, strategy, matrix, job, runner, env, vars,
steps, inputs` — no `secrets`. The whole workflow is rejected with
**`Unrecognized named-value: 'secrets'`**, which surfaces as a red squiggle in
the VS Code GitHub Actions extension and as a failed run with no jobs executed.

The asymmetry is the part that catches people out: `run:` **can** read
`secrets` directly. Only `if:` cannot.

The fix is to lift the secrets into **job-level** `env` and test those instead:

```yaml
deploy:
  env:
    RENDER_DEPLOY_HOOK_URL: ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
  steps:
    - name: Deploy
      if: ${{ env.RENDER_DEPLOY_HOOK_URL != '' }}
      run: curl --fail -X POST "$RENDER_DEPLOY_HOOK_URL"
```

`env` **is** available in a step's `if`. One further catch: a step cannot read
env declared in its own `env:` block from its own `if` — the value has to come
from the job or workflow level, which is why it is declared on the job above.

### Design decisions worth not undoing

- **`concurrency` with `cancel-in-progress`.** Two quick pushes would otherwise
  race, and the older commit can win the deploy.
- **`if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'`.**
  `needs` only proves the checks passed, not that anything was reviewed.
  Without this, a PR from a fork could deploy.
- **`permissions: contents: read`.** Nothing in this workflow writes to the
  repository. The default token is far broader than it needs to be.
- **`--frozen-lockfile`.** Fails if `package.json` and `pnpm-lock.yaml` have
  drifted, rather than quietly resolving different versions than a developer
  built against.
- **pnpm, not npm.** `pnpm-lock.yaml` is the committed lockfile; there is no
  `package-lock.json`. `pnpm/action-setup` must run **before** `setup-node`,
  because `cache: pnpm` shells out to `pnpm store path`.

### Deploy hooks vs. native Git integration

Both platforms can also deploy by watching the repository directly, with no
secrets and no `deploy` job. That is simpler, and it is the right default for a
solo project. The trade-off is the reason this pipeline uses hooks:

| | Native Git integration | Deploy hook (used here) |
| --- | --- | --- |
| Setup | Connect the repo, done | One secret per platform |
| Deploys on a red build | **Yes** — it never sees CI | No — gated on `needs` |
| Both platforms in step | Independent, can diverge | Fired together |

If you switch to native integration, disable auto-deploy on at least one side
or you will get duplicate builds for every push.

---

## 6. Environment variable reference

### Render — backend service

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | yes | `prod` | Already set by the Dockerfile |
| `DATABASE_URL` | yes | `postgres://…` | Injected by Render; rewritten at startup — §2 |
| `FABINS_ADMIN_USERNAME` | yes | `admin` | HTTP Basic user for the admin endpoints |
| `FABINS_ADMIN_PASSWORD` | yes | *(strong)* | Never leave the committed fallback in place |
| `FABINS_ALLOWED_ORIGIN` | yes | `https://fabins.com` | Exact site origin — §4.3 |
| `FABINS_BACKEND_URL` | yes | `https://api.fabins.com` | This service's own origin, for email links |
| `SPRING_MAIL_PASSWORD` | yes | `xsmtpsib-…` | Brevo key; drives both engines |
| `SPRING_MAIL_FROM` | no | `fabins@nevolyn.com` | Must be a verified Brevo sender |
| `SPRING_MAIL_USERNAME` | no | `fabins@nevolyn.com` | Webmail username (full email address) |
| `BREVO_API_KEY` | no | `xsmtpsib-…` | Only if the REST key differs from the SMTP password |
| `FABINS_ADMIN_ADDRESS` | no | `fabins@nevolyn.com` | Where new-enquiry alerts land |
| `FABINS_MAIL_SENDER_NAME` | no | `Saturn Textiles R&D` | Display name in the recipient's inbox |

### Vercel — frontend project

| Variable | Required | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | yes | `https://api.fabins.com` |

Origin only — no `/api/v1`, no trailing slash. Both are stripped defensively in
`lib/api/contact.ts`, but the canonical form is the bare origin. Set it for
**Production, Preview and Development** separately in the Vercel UI; a variable
scoped to Production only leaves preview builds pointing at `localhost:8080`.

### Local development

Copy `.env.example` to `.env` in the repository root. It is read by Docker
Compose *and*, via `FabinsApplication#loadDotEnv`, by the backend when started
from source — so one file covers both. Leave `SPRING_MAIL_PASSWORD` blank to
develop without a mail account; messages are logged instead of sent.

---

## 7. First deployment, start to finish

### Prerequisites

GitHub repository · Render account · Vercel account · Brevo account.

### 7.1 Database

1. **Render → New → PostgreSQL.** Name it `fabins-db`, choose a region, create.
2. Choose the **same region** as the web service. Cross-region traffic adds
   latency to every query and leaves the private network.
3. Nothing else to do — Flyway creates the schema on the backend's first boot.

### 7.2 Backend

1. **Render → New → Web Service** → connect the repository.
2. Runtime **Docker**. The root [`Dockerfile`](../Dockerfile) is the one to use:
   it sets its build context at the repository root so `backend/` resolves.
   (`backend/Dockerfile` exists for Docker Compose, where the context is already
   `backend/`.)
3. Health check path: `/actuator/health`.
4. Add the environment variables from §6. Attach the database with **Add from
   database → Internal Database URL**, which sets `DATABASE_URL`.
5. Deploy. Watch the log for:
   - `[FABINS] Normalised cloud JDBC URL: jdbc:postgresql://…` — §2 worked
   - `Successfully applied 1 migration` — Flyway is happy
   - `Started FabinsApplication in …` — up
6. Verify: `curl https://<service>.onrender.com/actuator/health`.

### 7.3 Frontend

1. **Vercel → Add New → Project** → import the repository.
2. **Root Directory: `frontend`.** Vercel detects Next.js and pnpm from there.
3. Add `NEXT_PUBLIC_API_BASE_URL` = the Render URL, for all three environments.
4. Deploy.

### 7.4 Wire them together

1. Set `FABINS_ALLOWED_ORIGIN` on Render to the Vercel URL.
2. Set `FABINS_BACKEND_URL` on Render to its own public URL.
3. Redeploy the backend — the CORS bean is built at startup.
4. Submit the live contact form. Confirm: a `201` in the network tab, a row in
   the database, and two emails. Click the acknowledge link in the admin email
   and confirm the third arrives.

### 7.5 CI/CD

Add the two secrets from §5. Push to `main` and confirm all three jobs pass.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Driver claims to not accept jdbcUrl` | `DATABASE_URL` in libpq form and the listener did not run | §2. Check for `[FABINS] Normalised cloud JDBC URL` in the boot log |
| `password authentication failed` on a URL containing the password | JDBC ignores embedded credentials | §2 — they must be separate properties |
| `No 'Access-Control-Allow-Origin' header` | `FABINS_ALLOWED_ORIGIN` wrong, or backend not redeployed | §4.3. Origin is exact: scheme, host **and** port |
| Form submits fine, no email ever arrives | Outbound SMTP blackholed | §3. Confirm the key starts `xsmtpsib-` so the REST engine is selected |
| `MailConnectException … port 587` | PaaS drops outbound SMTP | §3. Use the REST engine; 465 is only a fallback |
| Brevo returns `401` | Trailing newline on the pasted key | Already `.trim()`ed in code — re-paste the key in the dashboard |
| Brevo returns `400 sender not valid` | Sender address unverified | Verify it in Brevo → Senders |
| Email lands in spam | No domain authentication | §4.4 — SPF, DKIM, DMARC |
| First submission takes ~40s | Free-tier cold start | §1. Expected; the 60s client timeout absorbs it |
| CI: `Dependencies lock file is not found` | Workflow using npm against a pnpm lockfile | §5 — this is what broke the previous `ci-cd.yml` |
| Flyway: `found non-empty schema without history table` | Migrating into an existing database | Restore a dump first, or run `flyway baseline` |
| `WARN … Flyway upgrade recommended: H2 2.3.232 is newer` | Cosmetic; H2 is dev/test only | Ignore — production uses PostgreSQL |

### Useful commands

```bash
# Backend health
curl https://api.fabins.com/actuator/health

# CORS preflight, without a browser in the way
curl -i -X OPTIONS https://api.fabins.com/api/v1/deployment-requests \
  -H "Origin: https://fabins.com" -H "Access-Control-Request-Method: POST"

# End-to-end submission
curl -i -X POST https://api.fabins.com/api/v1/deployment-requests \
  -H "Content-Type: application/json" \
  -d '{"millName":"Test Mill","contactName":"QA","email":"you@example.com"}'

# Admin listing (HTTP Basic)
curl -u admin:PASSWORD https://api.fabins.com/api/v1/deployment-requests

# DNS checks
dig fabins.com +short
dig api.fabins.com CNAME +short
dig TXT fabins.com +short              # SPF
dig TXT mail._domainkey.fabins.com +short   # DKIM
dig TXT _dmarc.fabins.com +short       # DMARC
```

### Reproducing production locally

```bash
cp .env.example .env      # then fill in SPRING_MAIL_PASSWORD
docker compose up --build
```

Runs PostgreSQL, the backend under the `prod` profile, and the frontend
together — the closest local approximation to the deployed topology, and the
right place to reproduce a production-only bug before pushing a fix.
