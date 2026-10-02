# FABINS — Product Portfolio

Single-page product site for **FABINS**, an AI-based automated fabric defect inspection system built by the Saturn Textiles Limited R&D department.

The site explains the product to mill owners: why manual inspection at the frame fails, why FABINS retrofits existing machines instead of replacing them, how the inspection pipeline works, how defects are scored under ASTM D5430, and how to request a deployment.

---

> 📖 **New Developers & Students**: Read the comprehensive [Frontend Architecture Guide](../docs/FRONTEND_ARCHITECTURE_GUIDE.md) to understand the data flow, layer isolation, and step-by-step instructions on updating site copy or adding new sections.

---

This is the **frontend** half of the repository. The API it talks to lives in
[`../backend`](../backend); see the [root README](../README.md) for how the two
fit together.

---

## Quick start

```bash
cp .env.example .env.local   # points the contact form at the local API
pnpm install                 # or: npm install
pnpm dev                     # or: npm run dev
```

Open <http://localhost:3000>.

The site runs fine on its own. Only the contact form needs the backend — without
it, submitting shows a clear error instead of succeeding.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Production build — run this before pushing |
| `pnpm start` | Serve the production build locally |
| `pnpm type-check` | TypeScript check with no build output |

---

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Language | TypeScript (strict) |

The site is **statically rendered and light-mode only**. All content is built in; the only runtime call is the contact form — see [Talking to the API](#talking-to-the-api).

---

## Project structure

```text
app/
  globals.css     Design tokens + shared classes. Read the header comment first.
  layout.tsx      Root layout, page metadata, theming decision
  page.tsx        The main landing page: section composition & overview
  deploy/
    page.tsx      Dedicated RMG Industry Deployment Assessment Portal (/deploy)

components/
  layout/         The frame around the content
    PageShell       Navbar + main + Footer + ambient background
    Navbar          Floating pill header, scroll-spy, mobile menu, /deploy awareness
    Footer          Brand, navigation, innovator list, /deploy link

  sections/       One file per page section, named for its section.
                  Each composes primitives; none defines its own layout shell.
                  ContactSection is the Gateway Portal connecting to /deploy.

  ui/             Reusable primitives — the design system
    Section         Section shell: vertical rhythm + centred container
    SectionHeader   Eyebrow + heading + description, with staggered entrance
    InfoCard        Icon card, optional spec chip and accent sub-heading
    IconTile        The 44px bordered accent icon square
    Wordmark        Logo + FABINS + tagline lockup
    FabinsLogo      Brand mark on its own
    InnovatorDetails  Profile modal (focus-trapped dialog)

lib/
  data/           ALL CONTENT LIVES HERE — see below
    site.ts             Navigation (shared by navbar and footer)
    fabins-system.ts    Every product claim, spec, and grading rule
    innovators.ts       Team members, bios, links
  api/
    contact.ts    The one boundary between the UI and the backend API
  animations.ts   Shared Framer Motion entrance presets
  scroll.ts       Smooth scrolling + scroll-spy, and the header offset
  utils.ts        `cn()` class merging

public/           Images, served from the site root (`/fabins-logo.png`)
```

Every file opens with a comment explaining what it is, what reads it, and what
to change to alter its behaviour. **Start there rather than here** — this README
covers the shape of things; the files cover the details.

### The three layers

Everything flows one way: **content → primitive → section → page.**

```text
lib/data/       what the site says     (strings and numbers only)
    ↓
components/ui/  how things look        (no knowledge of FABINS content)
    ↓
sections/       what goes where        (composes primitives with content)
    ↓
app/page.tsx    the order they appear
```

A primitive never imports from `lib/data/`. A section never redefines a layout
shell. That separation is what makes the primitives reusable: `InfoCard` knows
nothing about fabric inspection, so it serves the problem grid and the hardware
grid equally, and will serve the next one without modification.

### Building a section

A section should read as composition, not markup. The whole of `ProblemSection`:

```tsx
<Section id="problem">
  <SectionHeader eyebrow="The problem" title={…} description="…" />

  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {FABINS_SYSTEM_DATA.problemItems.map((item, index) => (
      <InfoCard
        key={item.id}
        icon={PROBLEM_ICONS[item.iconName]}
        title={item.title}
        description={item.description}
        delay={index * 0.07}
      />
    ))}
  </div>
</Section>
```

No `<section>` element, no container div, no card markup, no animation config —
those live in the primitives. If you find yourself writing
`mx-auto max-w-7xl px-4` or `card card-hover` inside a section, reach for
`Section` or `InfoCard` instead.

**The two deliberate exceptions** are `HeroSection` (asymmetric padding, an `h1`,
its own entrance timing) and `MarqueeStrip` (full-bleed, no container). Forcing
either through `Section` would mean adding props that exist for one caller.

---

## How to make common changes

### Change wording on the page

Almost all copy is in `lib/data/`, not in components:

| To change | Edit |
| --- | --- |
| Navigation links | `lib/data/site.ts` |
| Problem cards, comparison table, pipeline steps, hardware specs, defect and grading content | `lib/data/fabins-system.ts` |
| Team members, bios, profile links | `lib/data/innovators.ts` |

The exceptions are deliberate and documented in place: the hero headline, the marquee strip, and the footer blurb are one-offs written inline in their own components, because moving six strings into a data file that only one component reads adds indirection without buying anything.

### Add a section to the page

1. Create `components/sections/YourSection.tsx`.
2. Wrap its contents in `<Section id="your-id">` — that supplies the spacing and
   the container, so you never write a `<section>` element yourself.
3. Render it in `app/page.tsx` — that file's order **is** the page order.
4. Add a matching entry to `NAV_LINKS` in `lib/data/site.ts`.

The navbar link, footer link, and scroll-spy highlight all follow from step 4.

### Change a colour

Edit the token in the `:root` block at the top of `app/globals.css`. Nothing hardcodes a hex value, so one edit re-skins the whole site. Adding a *new* token also requires registering it in the `@theme inline` block below it — that is what generates the Tailwind utility class.

### Add a section heading

Use `SectionHeader`; do not hand-write the eyebrow/heading/description markup. It keeps the entrance animation timing consistent across every section.

```tsx
<SectionHeader
  eyebrow="The problem"
  title={<>THE HUMAN LIMIT AT<br />THE INSPECTION FRAME</>}
  description="Quality control at the frame is still one inspector…"
/>
```

---

## Conventions

**Content and presentation are kept apart.** Files in `lib/data/` hold plain strings and numbers — no Tailwind classes, no icon components, no JSX. A card's colour is expressed as a semantic tone (`'amber'`), and the section maps that to classes. This is what lets the content move behind an API or a CMS later without rewriting the components.

**Lookups are keyed by id, never by array position.** Icons and per-item styling are resolved through a `Record<UnionType, …>` map. This is not just tidiness: it makes the map exhaustive, so adding an entry to a data file fails the build until the matching icon or colour is supplied, instead of rendering a blank space. `PROBLEM_ICONS`, `PILLAR_ICONS`, and `TONE_CLASSES` all work this way.

**Sections compose, they do not draw.** A section picks primitives and feeds them
content. It does not define a layout shell, a card, or an animation — those come
from `components/ui/`. `app/page.tsx` in turn contains no layout logic beyond the
order of the sections.

**Primitives know nothing about FABINS.** Nothing in `components/ui/` imports from
`lib/data/`. That is what makes them reusable rather than merely extracted.

**Magic numbers are named and cross-referenced.** The fixed-header offset appears in three places — `HEADER_OFFSET_PX` in `lib/scroll.ts`, `scroll-padding-top` in `globals.css`, and `pt-24` on `<main>` in `PageShell`. Each names the other two in a comment. If you change one, change all three.

---

## Talking to the API

The contact form is the only part of the site that calls the backend. It goes
through one function, which is the sole place the frontend knows an API exists:

```ts
// lib/api/contact.ts
submitDeploymentRequest(request: DeploymentRequest): Promise<SubmitResult>
```

It posts to `POST /api/v1/deployment-requests` on the Spring Boot service in
[`../backend`](../backend). Set the origin in `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

`NEXT_PUBLIC_` exposes a value to browser code, which is required here — and
means it is publicly visible. Never put a secret in one.

**The function never throws.** Validation failures, server errors, network loss,
and timeouts all come back as `{ ok: false, error }` with a message written
for the visitor. `SubmitResult` is a discriminated union
(`{ ok: true } | { ok: false; error }`) rather than an exception, so
TypeScript will not let you read `.error` without checking `ok` first — the
failure path cannot be forgotten.

To change transport, add retries, or move to a server action, edit that one
file. Nothing in `components/` needs to know.

---

## Known follow-ups

Not defects, but worth doing before this is considered finished:

- **Images are unoptimised.** Every image uses a plain `<img>` tag, so nothing is resized, converted to WebP, or lazy-loaded. `rahin-photo.png` alone is 1.7 MB and `fabins-machine.png` is 750 KB — together the page ships roughly 3 MB of images. Migrating to `next/image` with explicit `width`/`height` would cut that substantially with no visual change. The `eslint-disable` comments marking each `<img>` point at this note.
- **No linter.** `pnpm lint` currently just runs the TypeScript compiler. Adding `eslint-config-next` would catch the unused imports and index-keyed lookups that this codebase had accumulated.
- **`public/` holds two unused logos.** `fabins-logo-dark-mode.png` and `fabins-logo.png` are not referenced anywhere; only `fabins-logo-light-mode.png` is used. They are kept for a future dark mode — delete them if that is not planned.
- **The profile modal uses its own palette.** `InnovatorDetails` is styled in blue and slate rather than the site's teal design tokens. The values are collected in one `PALETTE` constant at the top of the file, so unifying it is a small change — but it *is* a visual change, so it is left as a decision rather than done silently.
- **`next-themes` is inert.** The theme provider is wired up but pinned to light mode, so it currently does nothing. It is kept as the hook for adding dark mode; see the note in `app/layout.tsx`. Remove it and the dependency if dark mode is off the table.

---

## Team

- **Md. Rahinur Rahman** — AI Systems Engineer · EEE, BUET
- **Mohammad Ninad Mahmud Nobo** — AI Software Engineer · CSE, BUET

Saturn Textiles Limited, Research & Development · Dhaka, Bangladesh