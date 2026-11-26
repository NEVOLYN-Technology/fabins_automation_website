# ☕ Spring Boot Backend Architecture & Educational Learning Guide

Welcome to the **FABINS Spring Boot Backend** codebase! This guide is specifically written for **students and software engineering developers** learning how modern backend architecture, Java 21, Spring Boot 3, REST APIs, and database persistence work together.

---

## 🧠 Part 1: How a Web Backend Works

A backend system is a server application that processes data, enforces business rules, secures sensitive endpoints, and communicates with a database.

In Spring Boot, request processing follows a **Layered Architecture Pattern**:

```text
               CLIENT BROWSER (Frontend React App)
                               │
                               │  HTTP POST /api/v1/deployment-requests
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 1. CONTROLLER LAYER (com.fabins.controller)             │
  │    Receives HTTP Request, validates JSON, returns HTTP   │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 2. SERVICE LAYER (com.fabins.service)                   │
  │    Applies Business Logic, State Transitions, & Rules   │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 3. REPOSITORY LAYER (com.fabins.repository)             │
  │    Executes SQL queries / JPA database persistence      │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 4. DATABASE (H2 / PostgreSQL)                           │
  │    Stores tables & persistent rows                     │
  └─────────────────────────────────────────────────────────┘
```

---

## 📂 Part 2: Folder & File Breakdown (Why Every File Was Created)

Here is a complete breakdown of every directory and file in the backend repository and the specific role it performs:

---

### 1. Root & Build Infrastructure

#### 📄 `pom.xml` (Project Object Model)

* **Why it exists**: The central build configuration file for **Apache Maven**. It defines project dependencies (Spring Web, Spring Data JPA, Spring Security, Validation, Lombok, MapStruct, H2 Database, Swagger/OpenAPI) and Java 21 compiler settings.

#### 🛠️ `mvnw`, `mvnw.cmd`, `.mvn/` (Maven Wrapper)

* **Why it exists**: Allows running Maven commands (`./mvnw spring-boot:run`) on any machine without needing Maven pre-installed. `mvnw` runs on Linux/macOS and `mvnw.cmd` runs on Windows PowerShell/CMD.

#### ⚙️ `src/main/resources/application.yml`

* **Why it exists**: The main configuration file for Spring Boot (server port 8080, database connection string, JPA settings).

---

### 2. Main Entry Point (`src/main/java/com/fabins/`)

#### 🚀 `FabinsApplication.java`

* **Why it exists**: Annotated with `@SpringBootApplication`. Boots up the embedded Tomcat server and initiates Spring Component Scanning.

---

### 3. Controller Layer (`com.fabins.controller`)

#### 🌐 `DeploymentRequestController.java`

* **Why it exists**: Annotated with `@RestController`. Exposes REST API endpoints (`POST`, `GET`, `PATCH`).

---

### 4. DTO Layer — Data Transfer Objects (`com.fabins.dto`)

* `CreateDeploymentRequest.java`: Input validation (`@NotBlank`, `@Email`).
* `ChangeStatusRequest.java`: Status updates.
* `DeploymentRequestResponse.java`: Safe public JSON response output.
* `PageResponse.java`: Generic pagination wrapper.

---

### 5. Service Layer (`com.fabins.service`)

* `DeploymentRequestService.java` & `DeploymentRequestServiceImpl.java`: Enforces core business rules, status transitions, and transaction management (`@Transactional`).

---

### 6. Repository Layer (`com.fabins.repository`)

* `DeploymentRequestRepository.java`: Extends `JpaRepository<DeploymentRequest, Long>`. Handles automatic SQL queries and CRUD operations.

---

### 7. Entity, Enum & Flyway Migration Layer (`com.fabins.entity`, `db/migration`)

* `DeploymentRequest.java`: JPA `@Entity` mapped to database table `deployment_request`. Uses UUID primary keys and auditing listener for UTC timestamps.
* `DeploymentRequestStatus.java`: Enum (`NEW`, `IN_REVIEW`, `CONTACTED`, `CLOSED`).
* `db/migration/V1__create_deployment_request.sql`: Base Flyway migration creating `deployment_request` table.
* `db/migration/V2__add_rmg_industry_fields.sql`: Schema upgrade adding RMG industry columns (`designation`, `location`, `factory_type`, `inspection_frames_count`, `fabric_types`, `daily_production_volume`, `inspection_speed`, `roll_width`, `defect_types`, `erp_integration_needed`, `target_timeline`).

---

### 8. Exception & Security Layer

* `GlobalExceptionHandler.java`: `@RestControllerAdvice` converting validation errors and runtime exceptions to RFC 9457 standard problem+json.
* `SecurityConfig.java`: Spring Security 6 CORS policy control, CSRF protection, and endpoint role isolation.

---

## ⚡ Step-by-Step Flow: What Happens When a Visitor Submits an RMG Request?

1. Visitor opens the RMG Assessment Portal at `http://localhost:3000/deploy` and fills out the mill specifications.
2. React calls `submitDeploymentRequest()` in `frontend/lib/api/contact.ts`.
3. HTTP POST Request arrives at `http://localhost:8080/api/v1/deployment-requests`.
4. `DeploymentRequestController` validates the JSON input via `@Valid CreateDeploymentRequest`.
5. Controller passes DTO to `DeploymentRequestServiceImpl`.
6. Service converts DTO to Entity via `DeploymentRequestMapper`.
7. Service calls `DeploymentRequestRepository.save(entity)`.
8. Spring Data JPA executes SQL `INSERT INTO deployment_request ...` into database (verified by Flyway V1 & V2 migrations).
9. Service triggers asynchronous `@Async` email notification to R&D team and sender confirmation via Brevo REST API / SMTPS.
10. HTTP 201 Created JSON response (carrying tracking reference code `FAB-2026-XXXXXXXX`) is returned to the browser.

Happy Learning & Coding! 🚀
