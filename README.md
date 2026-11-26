# 🔬 FABINS — AI-Powered Fabric Defect Inspection System

<p align="center">
  <strong>An AI-Powered Optical Inspection System for Textile Manufacturing & Export Mills</strong><br />
  Developed by <strong>Saturn Textiles Limited — Research & Development Department</strong>
</p>

<p align="center">
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js" alt="Next.js 16" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Spring_Boot-3.4.2-brightgreen?style=for-the-badge&logo=spring" alt="Spring Boot 3" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk" alt="Java 21" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="#-technology-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" /></a>
</p>

---

## 📌 About FABINS

**FABINS** (*Fabric Inspection Automation*) is an end-to-end industrial machine-vision system built to replace error-prone manual fabric grading in textile export mills.

Instead of importing expensive foreign inspection machines that require replacing factory infrastructure, FABINS **retrofits onto the inspection frames mills already own**. It captures high-speed moving fabric via line-scan optical sensors, detects sub-millimeter defects in real-time, sizes them in millimeters, and automatically generates ASTM D5430 Four-Point quality inspection reports without human intervention.

---

## 🏬 RMG Industry Assessment Portal (`/deploy`)

To accommodate Ready-Made Garment (RMG) factories, spinning & weaving mills, and denim manufacturing facilities, FABINS provides a dedicated, multi-section assessment portal at **`/deploy`**.

The assessment portal collects critical machine-level parameters required for optical camera sizing and AI model tuning:
- **Factory & Contact Profile**: Mill Name, Representative, Designation, Email, Phone, Location
- **Operational Parameters**: Factory Sector, Inspection Frame Count, Fabric Types (Knits, Denim, Woven), Production Volume, Inspection Speed (m/min), Roll/Table Width (inches)
- **Quality & Integration Needs**: Defect Focus (Holes, Stains, Slubs, Yarn Breaks, Drop Stitches), ERP Software Integration (FastReact, SAP, Oracle), Target Timeline

---

## 🏛️ System Architecture

This repository is structured as a clean **Full-Stack Monorepo** comprising a high-performance Next.js 16 web application and a production-grade Spring Boot 3 REST API backend.

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                             WEB CLIENT (BROWSER)                            │
 │  Next.js 16 App Router · React 19 · Framer Motion · Tailwind CSS v4          │
 │  • Primary Landing Page (/)                                                 │
 │  • Dedicated RMG Assessment Portal (/deploy)                                │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        │ HTTP REST / JSON
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         SPRING BOOT 3 REST BACKEND                          │
 │  Java 21 · Spring Security · Spring Data JPA · Flyway V2 · RFC 9457 Errors  │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        │ JDBC SQL
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                           PERSISTENCE LAYER (DATABASE)                      │
 │  H2 In-Memory (Dev Profile) / PostgreSQL 16 (Production Profile)            │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Directory Layout

```text
fabins_portfolio/
├── frontend/                 # Next.js 16 Web Application
│   ├── app/                  # App Router: layout, home (/), deploy portal (/deploy)
│   ├── components/           # UI Primitives, Gateway Sections, Navbar & Footer Shell
│   ├── lib/                  # Data fixtures, Selectors, API boundary (contact.ts)
│   └── public/               # Static assets — logos, photography, favicon
│
├── backend/                  # Spring Boot 3.4 REST API Service
│   ├── src/main/java/        # Controllers, Services, Repositories, Entities, DTOs, Mappers
│   ├── src/main/resources/   # application.yml config, Flyway migrations (V1, V2), email templates
│   ├── src/test/java/        # JUnit 5 suite — endpoint, security, and email tests
│   ├── pom.xml               # Maven dependencies & build configuration
│   └── mvnw / mvnw.cmd       # Cross-platform Maven Wrappers
│
├── .github/workflows/        # ⚙️ CI/CD — build, test, and deploy pipeline
│
└── docs/                     # 📚 Central Documentation & Learning Guides
    ├── FRONTEND_ARCHITECTURE_GUIDE.md  # Complete React/Next.js architecture guide
    ├── BACKEND_LEARNING_GUIDE.md       # Complete Spring Boot & JPA learning guide
    └── CICD_AND_DEPLOYMENT.md          # Deployment, custom domains, lessons learned
```

---

## 🚀 Quick Start Guide

### Prerequisites

* **Node.js**: v20.0+ and `pnpm` (or `npm`)
* **Java JDK**: Version 21

---

### Step 1: Run the Spring Boot Backend (Terminal 1)

```bash
cd backend
./mvnw spring-boot:run          # On Windows PowerShell: .\mvnw.cmd spring-boot:run
```

* **API Base URL**: `http://localhost:8080/api/v1`
* **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
* **H2 Database Console**: `http://localhost:8080/h2-console` *(JDBC: `jdbc:h2:mem:fabins`, User: `sa`, No Password)*

---

### Step 2: Run the Next.js Frontend (Terminal 2)

```bash
cd frontend
cp .env.example .env.local      # Points API requests at http://localhost:8080
pnpm install
pnpm dev
```

* Open **`http://localhost:3000`** in your web browser.
* Open **`http://localhost:3000/deploy`** for the RMG Industry Assessment Portal.

---

## 🛠️ Technology Stack & Layering

| Tier | Component | Description |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js 16 (App Router) | High-performance React 19 SSR/SSG rendering framework with dedicated `/deploy` route |
| **Styling** | Tailwind CSS v4 | Utility-first CSS engine with custom cyber-grid design tokens |
| **Animations** | Framer Motion | Fluid scroll entrance presets & interactive modal transitions |
| **Backend API** | Spring Boot 3.4 | Production-grade Java 21 REST API framework |
| **Security** | Spring Security 6 | CORS policy control, CSRF protection, and endpoint role isolation |
| **Database Migrations** | Flyway 10 | Versioned SQL database migrations (`V1`, `V2` schema upgrades) |
| **Persistence** | Spring Data JPA | Automatic SQL mapping for H2 (in-memory) & PostgreSQL |
| **Documentation** | OpenAPI 3.0 / Swagger | Automated interactive REST API documentation |

---

## 📚 Central Learning & Educational Documentation

This repository was specifically built as an **international educational reference** for developers learning full-stack web and backend architecture:

* 📖 **[Frontend Architecture Guide](docs/FRONTEND_ARCHITECTURE_GUIDE.md)**: Teaches clean 3-layer React architecture, route composition (`/deploy`), state management, and custom design primitives.
* 📱 **[Smooth Modal & Lightbox Transitions Guide](docs/SMOOTH_MODAL_AND_LIGHTBOX_TRANSITIONS_GUIDE.md)**: Production implementation guide for mobile web, iPad (portrait & landscape), and desktop card modals with zero-lag fullscreen picture lightboxes.
* ☕ **[Spring Boot Learning Guide](docs/BACKEND_LEARNING_GUIDE.md)**: Line-by-line explanation of Spring Boot annotations, Flyway migrations, DTO mapping, and RFC 9457 error handling.
* 🚀 **[CI/CD & Deployment Guide](docs/CICD_AND_DEPLOYMENT.md)**: Production topology, GitHub Actions, custom domain setup (DNS, CORS, SPF/DKIM/DMARC), and PaaS deployment troubleshooting.

---

## 🔌 API Endpoints Summary

| Method | Endpoint Path | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/deployment-requests` | **Public** | Submit RMG deployment assessment request with full machine specs |
| `GET` `POST` | `/api/v1/deployment-requests/{id}/acknowledge` | **Public** | One-click acknowledge link embedded in the R&D notification email — moves request to `IN_REVIEW` |
| `GET` | `/api/v1/deployment-requests` | Admin | List deployment requests (paginated, filterable by status) |
| `GET` | `/api/v1/deployment-requests/{id}` | Admin | Retrieve details of a specific deployment request |
| `PATCH` | `/api/v1/deployment-requests/{id}/status` | Admin | Update request status (`NEW` ➔ `IN_REVIEW` ➔ `CONTACTED` ➔ `CLOSED`) |

---

## 👥 Authors & Credits

Developed by **Saturn Textiles Limited — Research & Development Department**:

* **Md. Rahinur Rahman** — AI Systems Engineer (*EEE, BUET*)
* **Mohammad Ninad Mahmud Nobo** — AI Software Engineer (*CSE, BUET*)

---

<p align="center">
  <sub>Built with international precision for the Ready-Made Garment (RMG) export industry.</sub>
</p>
