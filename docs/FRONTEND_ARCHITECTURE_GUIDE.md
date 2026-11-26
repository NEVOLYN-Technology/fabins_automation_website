# 📚 FABINS Frontend Architecture & Developer Learning Guide

Welcome to the **FABINS Product Portfolio Frontend** codebase! This document is designed for **new developers, team members, and computer science / software engineering students** learning modern web application architecture, Next.js 16 (App Router), React 19, TypeScript, and clean code principles.

---

## 🎯 Architectural Philosophy

This project is built following **Clean Architecture** principles for frontend applications. The core goal is **Strict Separation of Concerns**:

* **Content & Data** contain *only* data (strings, numbers, semantic types) — no styling or JSX.
* **UI Primitives** contain *only* design system styling and markup — no specific domain data.
* **Section Components** compose UI Primitives with Data — acting as purely compositional blocks.
* **Page Layout (`page.tsx`)** defines *only* the order of section execution.

---

## 🔄 The Data & Component Flow

Everything in this repository flows in **one direction**:

```text
  ┌─────────────────────────────────────────────────────────┐
  │ 1. Data Layer: lib/data/ & types/                      │
  │    (Holds all text, numbers, specifications, types)    │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 2. Data Access Layer (DAL): lib/data/index.ts           │
  │    (Exposes clean getter functions / selectors)          │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 3. UI Design System Primitives: components/ui/         │
  │    (Section, SectionHeader, InfoCard — reusable)        │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 4. Section Components: components/sections/            │
  │    (ProblemSection, SystemSection, AboutSection)       │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 5. App Routes & Pages: app/                            │
  │    • app/page.tsx (Landing overview section order)     │
  │    • app/deploy/page.tsx (Dedicated RMG Assessment)    │
  └──────────────────────────┘
```

---

## 🛠️ Step-by-Step: How to Change Data in `lib/data/`

All content is decoupled from UI components. You never need to touch TSX component markup to update site copy or specifications.

### 1. Changing Problem Cards (`ProblemSection`)

* **File**: `frontend/lib/data/fabins-system.ts`
* **Target Property**: `FABINS_SYSTEM_DATA.problemItems`
* **Example Modification**:

  ```typescript
  {
    id: 'manual',
    title: 'Manual, Person-Dependent',
    description: 'Updated description text here...',
    iconName: 'UserX' // Must match a valid ProblemIconName
  }
  ```

### 2. Changing Strategy / Comparison Table (`AboutSection`)

* **File**: `frontend/lib/data/fabins-system.ts`
* **Target Property**: `FABINS_SYSTEM_DATA.aboutComparisons`

### 3. Changing Vision Pipeline Steps or Hardware Specs (`SystemSection`)

* **File**: `frontend/lib/data/fabins-system.ts`
* **Target Properties**: `FABINS_SYSTEM_DATA.pipelineSteps` & `FABINS_SYSTEM_DATA.hardwarePillars`

### 4. Changing Innovator & Team Profiles (`InnovatorsSection`)

* **File**: `frontend/lib/data/innovators.ts`
* **Target Array**: `fabinsInnovators`

---

## 🌐 API Architecture Deep-Dive (`lib/api/contact.ts`)

### 🔍 "Why is there ~150 lines of code for only ONE API call?"

Students often ask: *Why not just write a 3-line `fetch()` inside the button click handler?*

```typescript
// ❌ Naive 3-Line Approach (Fragile in Production):
const res = await fetch('http://localhost:8080/api/v1/deployment-requests', { method: 'POST', body: JSON.stringify(data) })
const json = await res.json()
alert('Success!')
```

**What happens when the 3-line approach fails in real life?**

1. **Server takes 30 seconds to respond?** The UI freezes forever with no feedback.
2. **User's Wi-Fi drops or backend server is down?** Uncaught `TypeError: Failed to fetch` crashes the React app.
3. **Backend validation fails (e.g. invalid email format)?** The user sees a raw JSON `{"title": "Constraint Violation"}` instead of a clean, friendly error message.
4. **User clicks on Safari on an old tablet?** Modern fetch extensions fail or crash.

---

### 🛡️ Production-Grade API Pattern: The 4 Protective Layers

In enterprise software, network calls are isolated inside `lib/api/` using a **4-Layer Resilient Pattern**:

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ 1. Discriminated Union Return Type ({ ok: true } | { ok: false; error }) │
│    UI never needs try/catch; compiler forces handling error state.       │
├───────────────────────────────────────────────────────────────────────────┤
│ 2. AbortController Timeout Guard (REQUEST_TIMEOUT_MS = 10_000)            │
│    Automatically cancels hung requests after 10s (Safari compatible).    │
├───────────────────────────────────────────────────────────────────────────┤
│ 3. Network & Abort Exception Normalization                             │
│    Catches DNS failures, offline state, timeouts, & converts to messages. │
├───────────────────────────────────────────────────────────────────────────┤
│ 4. RFC 9457 Problem Details & Field Error Parser (readErrorMessage)       │
│    Extracts specific field errors ("Invalid email") vs HTTP 500 fallbacks. │
└───────────────────────────────────────────────────────────────────────────┘
```

Happy Coding & Building! 🚀
