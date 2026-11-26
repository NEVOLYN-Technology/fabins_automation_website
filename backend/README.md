# FABINS API

Spring Boot backend for the FABINS product site. It receives deployment
requests from the website's contact form and gives the team a way to work
through them.

---

> ☕ **New Developers & Students**: Read the complete [Spring Boot Architecture & Learning Guide](../docs/BACKEND_LEARNING_GUIDE.md) for a line-by-line explanation of every directory, file, annotation, and how requests flow through the backend.

---

## Quick start

Only a **Java 21 JDK** is required. The Maven Wrapper downloads Maven itself, so
there is nothing else to install and no database to set up — the `dev` profile
runs an in-memory H2 database.

```bash
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

| | |
| --- | --- |
| API | <http://localhost:8080/api/v1/deployment-requests> |
| Interactive docs | <http://localhost:8080/swagger-ui.html> |
| OpenAPI document | <http://localhost:8080/v3/api-docs> |
| Database console | <http://localhost:8080/h2-console> (JDBC `jdbc:h2:mem:fabins`, user `sa`, no password) |
| Health | <http://localhost:8080/actuator/health> |

| Command | What it does |
| --- | --- |
| `./mvnw spring-boot:run` | Run the API with the `dev` profile |
| `./mvnw test` | Run the test suite |
| `./mvnw clean package` | Build `target/fabins-api.jar` |
| `java -jar target/fabins-api.jar` | Run the packaged jar |

The dev database is in memory: **it is wiped every restart.** That is
deliberate — it keeps local runs reproducible.

---

## The API

Base path `/api/v1`. All payloads are JSON.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/deployment-requests` | **Public** | Submit a request (the website form) |
| `GET` | `/deployment-requests` | Admin | List requests, newest first, paginated |
| `GET` | `/deployment-requests/{id}` | Admin | Fetch one request |
| `PATCH` | `/deployment-requests/{id}/status` | Admin | Move a request to a new stage |

`GET` supports `?status=NEW`, `?page=0`, `?size=20`.

Submitting a request (with RMG Industry parameters):

```bash
curl -i -X POST http://localhost:8080/api/v1/deployment-requests \
  -H 'Content-Type: application/json' \
  -d '{
        "millName": "Apex Spinning & Knitting Mills Ltd.",
        "contactName": "Engr. Md. Rahim Ahmed",
        "designation": "General Manager, QA",
        "email": "rahim.qa@apextextiles.com",
        "phone": "+880 1700-000000",
        "location": "Gazipur, Dhaka, Bangladesh",
        "factoryType": "Knit Fabric Mill",
        "inspectionFramesCount": "2 - 5 Frames",
        "fabricTypes": "Single Jersey, Interlock, Rib, Fleece",
        "dailyProductionVolume": "25,000 yards/day",
        "inspectionSpeed": "25 m/min",
        "rollWidth": "72 inches",
        "defectTypes": "Holes, Stains, Yarn breaks",
        "erpIntegrationNeeded": "FastReact / SAP",
        "targetTimeline": "1 - 3 Months",
        "message": "Custom backlit table frame installation."
      }'
```

Listing them (dev credentials `admin` / `change-me-in-production`):

```bash
curl -u admin:change-me-in-production \
  'http://localhost:8080/api/v1/deployment-requests?status=NEW'
```

### Design decisions

- **Versioned path.** Everything is under `/api/v1`. A breaking change ships as
  `/api/v2` while v1 keeps serving, so a deployed frontend never breaks because
  the backend was released.
- **Plural nouns, no verbs.** The HTTP method is the verb, which is why there is
  no `/submitDeploymentRequest`.
- **`201 Created` with a `Location` header** when a request is recorded.
- **`PATCH` on a `/status` sub-resource**, not a general update endpoint — a
  client changing a workflow stage must not be able to rewrite the mill's
  submitted contact details.
- **Errors are RFC 9457 `application/problem+json`**, always. One error shape
  across every endpoint means clients write one error handler:

  ```json
  {
    "type": "https://fabins.dev/problems/validation-failed",
    "title": "Validation failed",
    "status": 400,
    "detail": "One or more fields are invalid. See 'errors' for details.",
    "errors": { "email": "Email must be a valid address" }
  }
  ```

### Access control

`POST` is public because it backs the public contact form. Every other endpoint
returns submitters' names, emails, and phone numbers, so it requires the `ADMIN`
role via HTTP Basic — leaving them open would publish the sales pipeline.

Basic auth is appropriate here: one operator account, no admin UI yet. **It must
run behind HTTPS** — Basic credentials are base64-encoded, not encrypted.
Replacing it with JWT or OAuth2 later means changing only `SecurityConfig`.

---

## Project structure

Standard Spring Boot layered layout: one package per responsibility, under the
base package `com.fabins`. A class placed outside that package is never
picked up by component scanning.

```text
src/main/java/com/fabins/
  FabinsApplication.java          Entry point

  config/                         Spring configuration
    SecurityConfig                  Who can call what, plus CORS
    OpenApiConfig                   Swagger metadata
    ApiProperties                   Type-safe binding for `fabins.*` settings

  controller/                     REST endpoints — HTTP only
    DeploymentRequestController

  service/                        Business logic
    DeploymentRequestService        Interface the controller depends on
    impl/
      DeploymentRequestServiceImpl  Implementation and transaction boundaries

  repository/                     Data access
    DeploymentRequestRepository     Spring Data query methods

  entity/                         JPA models — never returned from a controller
    DeploymentRequest
    enums/
      DeploymentRequestStatus       Workflow stages

  dto/                            API payloads
    request/
      CreateDeploymentRequest       Validated submission body
      ChangeStatusRequest
    response/
      DeploymentRequestResponse
      PageResponse                  Stable pagination envelope

  mapper/                         Entity ↔ DTO conversion
    DeploymentRequestMapper

  exception/                      Error handling
    GlobalExceptionHandler          Exception → RFC 9457 response
    ResourceNotFoundException       Thrown by services, becomes a 404

src/main/resources/
  application.yml                 Shared defaults
  application-dev.yml             H2, verbose logging (default profile)
  application-prod.yml            PostgreSQL, secrets from the environment
  db/migration/                   Flyway migrations

src/test/java/com/fabins/
  controller/
    DeploymentRequestControllerTest
```

Every file opens with a comment explaining what it does and why it is built that
way. Start there rather than here.

### Adding a new resource

Create one class per layer, following the same names. For a `Customer` resource:
a `CustomerController`, a `CustomerService` plus `impl/CustomerServiceImpl`, a
`CustomerRepository`, a `Customer` entity, request/response DTOs, and a
`CustomerMapper`. Nothing else needs to change — Spring discovers them all.

### Layering rules

- **Controllers** translate HTTP and call exactly one service method. They never
  touch a repository.
- **Services** own business logic and transaction boundaries. They throw
  `ResourceNotFoundException`; they never think about status codes. The
  interface names the operation, the `impl` provides it.
- **Repositories** only fetch rows. No business rules.
- **Entities never leave the service layer.** Controllers return DTOs, so adding
  an internal column cannot leak it into the public API.
- **Mapping lives in `mapper/`**, so there is one place to update when a field
  is added — and exposing a field is a deliberate act.
- **DTOs are records** — immutable, and Jackson binds them directly.

Dependencies point one way only:

```text
controller → service → repository → entity
                ↓
             mapper → dto
```

---

## Database

Schema is owned by **Flyway**, never by Hibernate. `spring.jpa.hibernate.ddl-auto`
is `validate`, so a mismatch between the entities and the migrated schema stops
the application at startup instead of surfacing as a runtime failure.

**Never edit an applied migration.** Flyway checksums each file; changing one
that has run makes the app refuse to start. Add `V2__…sql` instead.

Dev and test use H2 in PostgreSQL-compatibility mode so the same migrations run
everywhere. It is a close approximation, not a perfect one — verify a migration
against real PostgreSQL before releasing.

---

## Configuration

Precedence, highest first: **environment variable → profile file →
`application.yml`**.

Secrets are written `${ENV_VAR:fallback}` so local development is frictionless
while production is driven entirely by the environment. The `prod` profile
deliberately has **no fallbacks**: a missing variable fails the boot rather than
silently shipping the password `change-me-in-production`.

Required in production:

```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://host:5432/fabins
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
FABINS_ADMIN_USERNAME=...
FABINS_ADMIN_PASSWORD=...
FABINS_ALLOWED_ORIGIN=https://fabins.yourdomain.com
```

`FABINS_ALLOWED_ORIGIN` is the CORS allow-list. Note that CORS is enforced by
browsers only — it is not a substitute for authentication.

---

## Tests

```bash
./mvnw test
```

`DeploymentRequestControllerTest` runs the full application against an in-memory
database, so the real migrations, validation, and security rules are all
exercised. A mocked-repository test would still pass if the schema and the
entity disagreed; this catches that. Each test is `@Transactional` and rolls
back, so they are order-independent.

---

## Known follow-ups

- **No rate limiting.** The public `POST` endpoint can be submitted in a loop.
  Before launch, put a rate limit in front of it (Bucket4j, or at the reverse
  proxy / API gateway) and consider a CAPTCHA.
- **Nothing notifies the team.** A submitted request is only stored — there is
  no email or Slack alert, so someone has to poll the list endpoint. Wire a
  notification into `DeploymentRequestService.submit`.
- **Single hardcoded admin account.** Fine for one operator; replace the
  `InMemoryUserDetailsManager` in `SecurityConfig` with a database-backed
  `UserDetailsService` when more than one person needs access.
- **Swagger is disabled in prod** (`application-prod.yml`). If you re-enable it,
  note that the Swagger routes are `permitAll` in `SecurityConfig`.
- **Flyway warns about the H2 version** in dev — H2 2.3.232 is newer than the
  release Flyway has certified. Harmless; it does not affect PostgreSQL.