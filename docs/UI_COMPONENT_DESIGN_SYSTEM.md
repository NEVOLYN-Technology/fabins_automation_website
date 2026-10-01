# Unified UI Component & Box Design Rules (FABINS & NEVOLYN)

This document establishes the official design standards, layout architectures, and interaction behaviors for UI components, boxes, cards, and modal dialogs across both **web** and **mobile**.

---

## 1. Card Bottom Action Bar (Featured Milestones & News Cards)

### Strict Single-Row Requirement (Mobile & Web)
On both mobile and desktop screens, the bottom action row containing social links (**LinkedIn**, **Facebook**) and the **View Details** button must **always remain in a single horizontal line**.
- **Container Class**:
  ```tsx
  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 w-full">
  ```
- **Critical Constraint**: **NEVER** use `flex-wrap` on this container for mobile cards. Wrapping causes buttons to split into two awkward lines on screens under 420px.

### Adaptive Social Link Labels
To ensure social links never crowd or push the **View Details** button onto a second line:
- Group social buttons on the left with `shrink-0`:
  ```tsx
  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
  ```
- Wrap text labels in `<span className="hidden sm:inline">...</span>`:
  - **LinkedIn**:
    ```tsx
    <a
      href={item.linkedinUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label="View on LinkedIn"
      className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold text-[#0a66c2] bg-white border border-[#0a66c2]/30 shadow-xs hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] active:bg-[#084e96] active:text-white transition-all duration-200 active:scale-95 shrink-0"
    >
      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
      <span className="hidden sm:inline">LinkedIn</span>
    </a>
    ```
  - **Facebook**:
    ```tsx
    <a
      href={item.facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label="View on Facebook"
      className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold text-[#1877f2] bg-white border border-[#1877f2]/30 shadow-xs hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] active:bg-[#145dbf] active:text-white transition-all duration-200 active:scale-95 shrink-0"
    >
      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      <span className="hidden sm:inline">Facebook</span>
    </a>
    ```

### "View Details" Button Standard
Positioned on the right side of the row:
```tsx
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    setSelectedNews(item)
  }}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-sky-700 bg-white hover:bg-sky-600 hover:text-white border border-sky-600/30 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0"
>
  <Eye size={13} className="shrink-0" />
  <span>View Details</span>
</button>
```

### Visual Width Breakdown (Mobile Budget)
| Element | Mobile Width | Desktop Width (`sm:`) |
| :--- | :--- | :--- |
| LinkedIn Button | ~30px (Icon pill) | ~85px (Icon + Text) |
| Facebook Button | ~30px (Icon pill) | ~90px (Icon + Text) |
| Gap between socials | 6px | 8px |
| View Details Button | ~100px | ~100px |
| **Total Row Width** | **~166px–175px** | **~283px** |

*Result: On a 310px-wide card with 40px horizontal padding, the 270px available container easily accommodates the 175px elements in a single clean row with ~95px of breathing space.*

---

## 2. Box & Card Appearance (Mobile & Web)

### Carousel Cards (`CarouselCard.tsx` / Featured Milestones)
- **Shell Dimensions & Responsive Physics**:
  ```tsx
  className={cn(
    'w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-center rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 bg-white flex flex-col justify-between border relative group',
    isCentered
      ? 'scale-100 opacity-100 shadow-xl shadow-sky-500/15 border-sky-300/80 ring-2 ring-sky-400/20 z-20'
      : 'scale-95 opacity-75 sm:opacity-85 hover:opacity-100 hover:scale-[0.97] border-slate-200 shadow-md z-10'
  )}
  ```
- **Top Accent Beam**:
  ```tsx
  <div className={cn(
    'absolute top-0 left-0 right-0 h-1 transition-all duration-400 z-20',
    isCentered
      ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500'
      : 'bg-transparent'
  )} />
  ```
- **Banner Header**:
  - `relative w-full h-44 sm:h-52 overflow-hidden bg-slate-900 shrink-0`
  - Image transition: `group-hover:scale-105 transition-transform duration-700 ease-out`
  - Bottom vignette overlay: `absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none`
- **Body Padding**:
  - `p-5 sm:p-6 flex-1 flex flex-col justify-between`

### Compact News Timeline Cards
- **Shell**: `snap-start rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between overflow-hidden relative min-h-[200px]`
- **Tone Indicator Bar**: `absolute left-0 top-0 bottom-0 w-1.5 <toneClass> transition-all duration-300`
- **Inner Padding**: `p-4 sm:p-5 pl-5 sm:pl-6 flex-1 flex flex-col justify-between`

### Card Header, Tagline & Media Hover Color & "View Details" Linking Standards

To deliver a polished, responsive web experience and eliminate dead click zones, the card's **header (title)**, **tagline (description)**, and **banner/thumbnail image** are engineered as direct companion triggers linked to the **View Details** pop-up modal (`setSelectedNews(item)`).

#### Color Transformation & State Transition Matrix

| Element | Default State (Resting) | Card Group Hover (`group-hover:`) | Direct Element Hover (`hover:`) | Interaction Affordance |
| :--- | :--- | :--- | :--- | :--- |
| **Card Header (Title / Headline)** | `text-slate-900` (`#0f172a` — solid bold navy/black) | `group-hover:text-sky-600` (`#0284c7` — brand highlight) | `hover:text-sky-600` (`#0284c7` — active link affordance) | `cursor-pointer transition-colors duration-200` |
| **Tagline (Summary / Description)** | `text-slate-600` (`#475569` — secondary muted slate) | `group-hover:text-slate-800` (`#1e293b` — subtle text pop) | `hover:text-slate-900` (`#0f172a` — high-contrast crispness) | `cursor-pointer transition-colors duration-200` |
| **Media (Banner / Thumbnail)** | Standard brightness, scale `1.0` | `group-hover:scale-105` (smooth 700ms zoom) | Subtle inner glow / shadow depth | `cursor-pointer overflow-hidden` |
| **View Details Button** | White bg, `text-sky-700`, `border-sky-600/30` | Button remains distinct CTA | `hover:bg-sky-600 hover:text-white` | `cursor-pointer active:scale-95` |

---

#### 1. Card Header / Title Behavior & Implementation
- **Visual Feedback**:
  - Starts in deep readable `text-slate-900`.
  - When the user hovers over the card as a whole, the title dynamically transitions to `group-hover:text-sky-600`.
  - When the cursor hovers directly over the title, it intensifies into vivid brand electric blue (`hover:text-sky-600`), accompanied by `cursor-pointer`.
- **Linked Modal Action**:
  - Clicking the title dispatches the full modal payload with `e.stopPropagation()` so parent carousel swipe or dragging handlers are not interrupted.
- **Reference Code (Featured Milestones & 3D Carousel)**:
  ```tsx
  {/* Milestone Title: Changes color to vibrant sky-600 on hover & triggers View Details */}
  <h4
    onClick={(e) => {
      e.stopPropagation()
      setSelectedNews({
        id: item.id,
        title: item.title,
        description: item.description,
        content: item.content,
        category: item.category,
        date: item.date,
        image: item.image,
        linkedinUrl: item.linkedinUrl,
        facebookUrl: item.facebookUrl,
      })
    }}
    className="inline text-lg sm:text-xl font-black text-slate-900 hover:text-sky-600 transition-colors duration-200 tracking-tight leading-snug cursor-pointer"
  >
    {item.title}
  </h4>
  ```
- **Reference Code (Vertical News Feed & Compact Cards)**:
  ```tsx
  <h4
    onClick={(e) => {
      e.stopPropagation()
      setSelectedNews(item)
    }}
    className="inline text-sm sm:text-base font-bold text-slate-900 hover:text-sky-600 cursor-pointer transition-colors duration-200 leading-snug"
  >
    {item.title}
  </h4>
  ```
  *(Note: Must use static `font-bold` without `hover:font-bold` or font-size shifts, so the title only transitions color to sky-600 smoothly on hover, matching Featured Milestones exactly.)*

---

#### 2. Tagline / Short Description Behavior
- **Non-Clickable Reading Text**:
  - The short description / tagline is styled as comfortable, non-interactive reading copy (`text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-normal text-justify`).
  - Does NOT trigger View Details modal on click, keeping the user's focus on the bold title and bottom button.

---

#### 3. Banner Image & Thumbnail Behavior: Full Uncropped Lightbox
- **Visual Feedback**:
  - Outer container features `overflow-hidden cursor-zoom-in group`.
  - Image scales subtly on hover with ease-out curve (`group-hover:scale-105` or `group-hover:scale-110`).
  - Features an uncropped full photo hint pill on hover.
- **Linked Action: Full Photo Lightbox (`ImageLightboxModal`)**:
  - Clicking any card photo (Featured Milestones or All News list) or the hero photo inside `NewsDetailModal` opens the **full uncropped photo lightbox** (`ImageLightboxModal`), NOT the article text modal.
  - The lightbox renders the complete, uncropped photo against a dark blurred backdrop (`bg-black/90 backdrop-blur-md`) with `useModalHistory` mobile back-button integration.

---

#### 4. Interaction Architecture Summary
- **Bold Title & "View Details" Button**: Exclusively trigger `NewsDetailModal` (article text, date, category, inline links, social sharing).
- **Photos & Thumbnails**: Exclusively trigger `ImageLightboxModal` (full uncropped photo viewer).
- **Description / Tagline**: Clean, non-interactive reading text.

---

## 3. Detail Modals (`NewsDetailModal.tsx`)

### Contact Block: Email on Left, Website on Right (Guaranteed Single-Row Grid on Mobile)
When a news announcement or project card contains paired contact channels, **Email must always be on the LEFT** and **Website must always be on the RIGHT**. Both elements must use `min-w-0`, `overflow-hidden`, and `<span className="truncate">` to guarantee they never overflow or go out of bounds on narrow mobile screens:
```tsx
<div className={`grid gap-1.5 sm:gap-2.5 w-full ${contact.website && contact.email ? 'grid-cols-2' : 'grid-cols-1'}`}>
  {/* Email on LEFT */}
  {contact.email && (
    <a
      href={`mailto:${contact.email}`}
      className="min-w-0 w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-xl bg-white border border-emerald-200/90 text-emerald-700 hover:text-white hover:bg-emerald-600 hover:border-transparent font-bold text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm shadow-xs transition-all duration-200 active:scale-95 group overflow-hidden"
    >
      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-500 group-hover:text-white transition-colors" />
      <span className="truncate">{contact.email}</span>
    </a>
  )}

  {/* Website on RIGHT */}
  {contact.website && (
    <a
      href={contact.website}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-0 w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-xl bg-white border border-sky-200/90 text-sky-700 hover:text-white hover:bg-sky-600 hover:border-transparent font-bold text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm shadow-xs transition-all duration-200 active:scale-95 group overflow-hidden"
    >
      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-sky-500 group-hover:text-white transition-colors" />
      <span className="truncate">{contact.website.replace(/^https?:\/\//, '')}</span>
      <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:text-white hidden min-[440px]:inline-block sm:inline-block" />
    </a>
  )}
</div>
```

---

## 4. Project & Innovation Cards (`InnovationsSection.tsx` & `CarouselCard.tsx`)

### Machine Photo Banner on Top (News Card Parity)
- To maintain visual consistency with news cards while keeping the card sleek and compact vertically, project cards feature a full-bleed top image banner (`/fabins-machine.png`):
  ```tsx
  {image && (
    <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-slate-900 shrink-0 border-b border-slate-100">
      <img
        src={image}
        alt={imageAlt}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
    </div>
  )}
  ```

### Machine Photo Banner on Top: Full Uncropped Lightbox
- To maintain visual consistency with news cards and showcase industrial machinery in full fidelity, project cards feature a full-bleed top image banner (`/fabins-machine.png`):
  - **Click to Enlarge**: Clicking the banner opens the **full uncropped photo lightbox** (`ImageLightboxModal`) with `cursor-zoom-in` and a hover badge (`Full Photo`).
  - Does NOT trigger routing to external links; provides clean media discovery.

### FABINS Logo Beside Tag
- Within the project category badge (e.g. `INDUSTRIAL AI`), the official `/fabins-logo.png` is placed alongside the tag text:
  ```tsx
  <div className={cn(
    "inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-2xs",
    colorClasses
  )}>
    <img
      src="/fabins-logo.png"
      alt="FABINS Logo"
      className="w-4 h-4 object-contain shrink-0"
    />
    <span>{project.category}</span>
  </div>
  ```

### Two-Line Project Heading (Logo + Clickable Brand on Top, Subtitle on Second Line, No Arrows)
- The card heading is split across two intentional lines without any arrow icons (`<ExternalLink />` removed):
  1. **Top Line**: Displays the official brand logo alongside the brand name (`FABINS`). **Only this element is a clickable link** leading to `project.url`, turning electric sky blue on hover (`group-hover/brand:text-sky-600`).
  2. **Second Line**: Displays the descriptive subtitle (`Fabric Inspection Automation`) in bold `text-slate-800`. This text is non-clickable.
- **Reference Code**:
  ```tsx
  <div className="mb-3">
    {/* Top line: FABINS Logo + FABINS (Only this is clickable) */}
    <div>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="group/brand inline-flex items-center gap-2 hover:opacity-100 transition-all duration-300 ease-out cursor-pointer mb-1 transform-gpu hover:-translate-y-1 sm:hover:-translate-y-1.5 hover:drop-shadow-[0_8px_16px_rgba(10,130,157,0.25)]"
        title={`Visit ${brand} (${project.url})`}
      >
        <img
          src={project.websiteLogo || '/fabins-logo.png'}
          alt={`${brand} Logo`}
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 group-hover/brand:scale-110 group-hover/brand:-rotate-3 transition-transform duration-300 ease-out drop-shadow-xs"
        />
        <span className="text-xl sm:text-2xl font-black tracking-tight transition-transform duration-300 group-hover/brand:scale-[1.02]">
          <span className="text-slate-900">FAB</span>
          <span className="text-[#0a829d] group-hover/brand:text-[#07687d] transition-colors">INS</span>
        </span>
      </a>
    </div>

    {/* Second line: Subtitle (Non-clickable) */}
    <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-snug">
      {subtitle}
    </h3>
  </div>
  ```

### No Arrows on Card
- Neither the title nor the website button at the bottom contains external link arrow icons (`<ExternalLink />`). This prevents visual noise and keeps the layout clean and uncluttered.

### Strict Cursor State Rules (Only Links Are Clickable)
- The active card surface and outer container use `cursor-default` (`cursor: default`) so hovering over whitespace, machine photos, badges, subtitles, and descriptions never triggers a pointer hand cursor.
- The outer wrapper only uses `cursor-pointer` when the card is inactive (`!isCenter`) to allow clicking side cards into center view.
- Within the card body, ONLY genuine interactive links display `cursor-pointer`:
  1. Top-line **`FABINS`** brand title link (`<a>`)
  2. Bottom **Email** action button (`<a>`)
  3. Bottom **Website** action button (`<a>`)

### Bottom Action Bar: Responsive Dynamic Balance (Mobile Parity & Web Symmetry)
- Container uses `flex items-center gap-1.5 min-[380px]:gap-2 w-full max-w-full overflow-hidden`:
  - **Mobile (< 640px)**:
    - Email uses `flex-1 min-w-0`: automatically expands to give `fabins@nevolyn.com` all needed space so it never truncates.
    - View Details uses `shrink-0`: stays compact (~95px) so it doesn't steal space from the email.
  - **Web (`sm:`, >= 640px)**:
    - Both Email and View Details use `sm:flex-1 sm:min-w-0`: automatically balances both buttons to an **equal 50/50 width**, preventing the email pill from stretching unnaturally large on wide desktop screens.
  - Guarantees zero `...` cutoffs on phones while maintaining clean, symmetric button proportions on desktop.

### Bottom Action Toolbar (Modal)
Must never wrap into vertical columns on mobile:
```tsx
<div className="pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
  {/* Left: Social Buttons in one row */}
  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
    {/* LinkedIn with hidden sm:inline */}
    {/* Facebook with hidden sm:inline */}
  </div>

  {/* Right: Back Button */}
  <button
    onClick={handleClose}
    type="button"
    className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md hover:shadow-slate-900/20 active:bg-black active:text-white transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0"
  >
    <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
    <span className="hidden sm:inline">Back to Updates</span>
    <span className="sm:hidden">Back</span>
  </button>
</div>
```
