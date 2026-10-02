# Unified UI Component & Box Design Rules (FABINS & NEVOLYN)

This document establishes the official design standards, layout architectures, responsive ergonomics, and interaction behaviors for UI components, boxes, cards, and modal dialogs across both **web** and **mobile**.

Both **FABINS** (`D:\fabins_automation_website`) and **NEVOLYN** (`D:\nevolyn_official_website`) strictly implement these rules to ensure consistent aesthetics, zero layout shifts, and 60–120 FPS performance.

---

## 1. Card Bottom Action Bar (Featured Milestones & News Cards)

### Strict Single-Row Requirement (Mobile & Web)
On mobile devices, iPads, and desktop displays, the bottom action row containing social links (**LinkedIn**, **Facebook**) and the **View Details** button must **always remain in a single horizontal line**.
- **Container Class**:
  ```tsx
  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 w-full flex-nowrap">
  ```
- **Critical Constraint**: **NEVER** use `flex-wrap` on this container for mobile cards. Wrapping causes buttons to split into awkward vertical stacks on screens under 420px.

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
Positioned on the right side of the row with `shrink-0`:
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
| Element | Mobile Width (`< 640px`) | Desktop Width (`sm:`, `≥ 640px`) |
| :--- | :--- | :--- |
| LinkedIn Button | ~30px (Icon pill) | ~85px (Icon + Text) |
| Facebook Button | ~30px (Icon pill) | ~90px (Icon + Text) |
| Gap between socials | 6px | 8px |
| View Details Button | ~100px | ~100px |
| **Total Row Width** | **~166px–175px** | **~283px** |

*Result: On a 310px-wide card with 40px horizontal padding, the 270px available container easily accommodates the 175px elements in a single clean row with ~95px of breathing room.*

---

## 2. Box & Card Appearance (Mobile, iPad, Web)

### Carousel Cards (`CarouselCard.tsx` / Featured Milestones)
- **Shell Dimensions & Responsive Scaling**:
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
  - `relative w-full h-44 sm:h-52 overflow-hidden bg-slate-900 shrink-0 cursor-zoom-in`
  - Image transition: `group-hover/photo:scale-105 transition-transform duration-700 ease-out`
  - Vignette overlay: `absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none`
- **Body Padding**:
  - `p-5 sm:p-6 flex-1 flex flex-col justify-between`

### Compact News Timeline Cards
- **Shell**: `snap-start rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between overflow-hidden relative min-h-[200px]`
- **Tone Indicator Bar**: `absolute left-0 top-0 bottom-0 w-1.5 <toneClass> transition-all duration-300`
- **Inner Padding**: `p-4 sm:p-5 pl-5 sm:pl-6 flex-1 flex flex-col justify-between`

---

## 3. Card Header, Media, & Description Interaction Matrix

To deliver a polished experience and eliminate dead click zones, the card's interactive targets have strict, well-defined responsibilities:

| Element | Resting State | Hover State | Interaction Action | Cursor Class |
| :--- | :--- | :--- | :--- | :--- |
| **Card Title / Headline** | `text-slate-900 font-bold` | `hover:text-sky-600 transition-colors duration-200` | Opens **`NewsDetailModal`** | `cursor-pointer` |
| **Banner Photo / Thumbnail** | Standard scale, clean aspect | `group-hover:scale-105 transition-transform` | Opens **`ImageLightboxModal`** (Zero-lag full photo) | `cursor-zoom-in` |
| **"View Details" Button** | White bg, `text-sky-700` | `hover:bg-sky-600 hover:text-white` | Opens **`NewsDetailModal`** | `cursor-pointer active:scale-95` |
| **Tagline / Description** | `text-slate-600` | No color shift | Non-clickable reading copy | `cursor-default select-text` |

### Interaction Architecture Rules
1. **Title & "View Details" Button**: Exclusively trigger `NewsDetailModal` (article text, date, category, inline links, social sharing).
2. **Photos & Thumbnails**: Exclusively trigger `ImageLightboxModal` (full uncropped photo viewer with zero delay).
3. **Description / Tagline**: Clean, non-interactive reading text.

---

## 4. Detail Modals (`NewsDetailModal.tsx`)

### Cross-Device Viewport Sizing
- **Mobile & iPad Portrait (`< 1024px`)**:
  - Shell: `w-full h-[100dvh] rounded-none`
  - Sticky top navigation bar: `sticky top-0 z-30 px-4 py-2.5 bg-white/95 backdrop-blur-md border-b`
  - Body: `overflow-y-auto no-scrollbar flex-1 overscroll-contain`
- **iPad Landscape & Desktop Web (`≥ 1024px`)**:
  - Shell: `lg:max-w-2xl lg:max-h-[92vh] rounded-3xl border border-slate-200/90 shadow-2xl`
  - Centered floating dialog with smooth spring entrance.

### Hero Banner Horizontal Carousel
- Viewport: `w-full h-56 lg:h-72 bg-slate-900 overflow-hidden`
- Scroll Track: `snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth`
- Indicator Dots: Interactive pill dots below the photo with active glow: `w-5 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]`.

### Multi-Photo Event Gallery Grid
- When news has multiple photos (`modalImages.length > 1`), an Event Gallery grid renders below the description:
  - Mobile: `grid-cols-2 gap-2.5`
  - Desktop (`sm:`): `grid-cols-4 gap-3.5` (when 4+ photos)
  - Active thumbnail features: `border-sky-500 ring-2 ring-sky-400/40 shadow-md`
  - Tapping any gallery thumbnail smoothly updates the hero banner via `scrollToHeroIndex(idx)` and opens `ImageLightboxModal`.

### Contact Block: Email on Left, Website on Right (Guaranteed Single-Row Grid)
When a news announcement or project card contains paired contact channels, **Email must always be on the LEFT** and **Website must always be on the RIGHT**. Both elements must use `min-w-0`, `overflow-hidden`, and `<span className="truncate">` to guarantee zero overflow on narrow mobile screens:
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

### Bottom Action Toolbar (Modal)
Must never wrap into multiple rows on mobile devices:
```tsx
<div className="pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3 flex-nowrap">
  {/* Left: Social Buttons in one row */}
  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
    {/* LinkedIn with hidden lg:inline */}
    {/* Facebook with hidden lg:inline */}
  </div>

  {/* Right: Prominent Back Button */}
  <button
    onClick={handleClose}
    type="button"
    className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md hover:shadow-slate-900/20 active:bg-black active:text-white transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0"
  >
    <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
    <span className="hidden lg:inline">Back to Updates</span>
    <span className="lg:hidden">Back</span>
  </button>
</div>
```

---

## 5. Fullscreen Photo Lightbox Standards (`ImageLightboxModal.tsx`)

### The Performance Architecture
1. **Zero-Lag State Management**:
   - The lightbox operates on **pure React state** (`isOpen: boolean`).
   - **STRICT PROHIBITION**: NEVER call `window.history.pushState` when opening the photo lightbox. In Next.js production builds on mobile, router revalidations triggered by `pushState` introduce noticeable freezing and stutter.
2. **Solid Dark Overlay (`bg-black/92`)**:
   - Renders a solid, high-performance background without expensive `backdrop-filter: blur()`. Blurring full-screen viewports drops GPU frame rates on mobile devices.
3. **Hardware-Accelerated Opacity Transition**:
   - Framer Motion `duration: 0.12s, ease: 'easeOut'` ensures snappy, instantaneous opening and closing.
4. **Photo-Centric Layout & Captions**:
   - Photo is constrained to `max-w-[96vw] max-h-[66vh]` on mobile (`max-h-[74vh]` on desktop).
   - Caption, counter ("Photo X of Y"), and indicator dots are positioned **directly below the photo** in a tight, readable group.
5. **Dismissal & Touch Safety**:
   - Tapping anywhere outside the photo closes the lightbox.
   - Tapping the photo itself does NOT close the lightbox (`e.stopPropagation()`).
   - Dragging/swiping distance is tracked (`dx > 10 || dy > 10`). Releasing a swipe gesture will NOT trigger an accidental backdrop dismissal.
6. **Universal Arrow Navigation**:
   - Left and Right navigation buttons (`ChevronLeft`, `ChevronRight`) use `className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 ..."` and are **NOT hidden on mobile**, giving mobile and iPad users both tap and swipe options.

---

## 6. Project & Innovation Cards (`InnovationsSection.tsx` & `CarouselCard.tsx`)

### Two-Line Heading Hierarchy
1. **Top Line**: Displays the brand logo alongside the brand name (`FABINS`). **Only this element is a clickable link** leading to `project.url`, turning electric sky blue on hover (`group-hover/brand:text-sky-600`).
2. **Second Line**: Displays the descriptive subtitle (`Fabric Inspection Automation`) in bold `text-slate-800`. This text is non-clickable.
3. **No Arrow Icons**: External link arrow icons (`<ExternalLink />`) are removed to keep the card sleek and clutter-free.

### Dynamic Button Width Balancing
On the bottom action bar (`CarouselCard.tsx`):
- **Mobile (`< 640px`)**:
  - Email button uses `flex-1 min-w-0`: automatically expands to give `fabins@nevolyn.com` all needed space so it never truncates.
  - View Details button uses `shrink-0`: stays compact (~95px) so it does not steal space from the email.
- **Desktop (`sm:`, `≥ 640px`)**:
  - Both Email and View Details buttons use `sm:flex-1 sm:min-w-0`: automatically balances both buttons to an **equal 50/50 width**, ensuring clean symmetry on wide screens.

---

## 7. Master Cross-Device Responsive Specification Matrix

| Feature | Mobile (`< 640px`) | iPad Portrait (`768px - 1023px`) | iPad Landscape & Desktop (`≥ 1024px`) |
| :--- | :--- | :--- | :--- |
| **Card Action Bar** | 1 Row, Icon-only socials (`hidden sm:inline`), ~175px width | 1 Row, Full text socials, balanced spacing | 1 Row, Full text socials, balanced spacing |
| **Card Title Hover** | Color transitions to `sky-600` | Color transitions to `sky-600` | Color transitions to `sky-600` |
| **Card Media Tap** | Opens zero-lag `ImageLightboxModal` | Opens zero-lag `ImageLightboxModal` | Opens zero-lag `ImageLightboxModal` |
| **Detail Modal Shell** | `h-[100dvh] w-full rounded-none` | `h-[100dvh] w-full rounded-none` | `max-w-2xl max-h-[92vh] rounded-3xl` dialog |
| **Detail Modal Hero** | `h-56` CSS snap + dots | `h-64` CSS snap + dots | `h-72` CSS snap + dots + arrows |
| **Event Gallery Grid** | 2 columns (`grid-cols-2`) | 2–4 columns | 4 columns (`grid-cols-4`) |
| **Contact Block** | 2 columns (Email Left, Web Right) | 2 columns (Email Left, Web Right) | 2 columns (Email Left, Web Right) |
| **Lightbox Backdrop** | Solid `bg-black/92` | Solid `bg-black/92` | Solid `bg-black/92` |
| **Lightbox State** | `useModalHistory` (`image-lightbox`) + 0ms `handleClose` | `useModalHistory` (`image-lightbox`) + 0ms `handleClose` | `useModalHistory` (`image-lightbox`) + 0ms `handleClose` |
| **Lightbox Arrows** | Visible (`absolute left-2`) | Visible (`absolute left-3`) | Visible (`absolute left-4`) |
| **Back Button Action** | Closes modal via `popstate` / `history.back()` | Closes modal via `popstate` / `history.back()` | Closes modal via on-screen button / `Esc` |

---

## 8. Leadership & Team Profile Cards (Single-Line Full Name Guarantee)

### The Single-Line Full Name Requirement
Names of all lengths (including long names up to 30 characters such as **`Mohammad Ninad Mahmud Nobo`**) must **always remain in a single horizontal line** (`whitespace-nowrap`) and **100% visible** without any truncation (`...`) or multi-line wrapping across all mobile device viewports (from 320px ultra-compact phones to 430px+ modern displays).

### Card Shell Dimensions & Responsive Typography
- **Container Padding Optimization**:
  - Mobile: `p-4 min-[360px]:p-5 sm:p-7`
  - *Rationale*: Standard 24px padding (`p-6`) consumes 48px of width, leaving too little room on 360px mobile screens. Reducing mobile padding to `p-4` or `p-5` expands the inner text width to 288px+, easily accommodating long names.
- **Card Headline Typography**:
  ```tsx
  <h3 className="text-[13px] min-[360px]:text-[14px] min-[390px]:text-[15.5px] sm:text-lg md:text-xl font-bold text-slate-900 mb-1.5 min-h-[2.25rem] sm:min-h-[3rem] flex items-center justify-center leading-tight whitespace-nowrap tracking-tight">
    {member.name}
  </h3>
  ```
- **Proportional Avatar**:
  - `w-24 h-24 sm:w-28 sm:h-28` to maintain balanced visual hierarchy alongside the responsive title.

---

## 9. Leader & Member Profile Modal Header (`LeaderDetails.tsx`)

### Fullscreen Modal Header Sizing
The sticky top navigation bar of member profile modals must accommodate long full names in **one single line** without text truncation:
- **Header Container**:
  ```tsx
  <div className="flex shrink-0 items-center justify-between gap-2.5 sm:gap-4 lg:gap-6 border-b border-slate-100 bg-white p-3 sm:p-5 lg:p-6 lg:px-8 z-10">
  ```
- **Avatar in Header**:
  ```tsx
  <div className="relative flex h-11 w-11 sm:h-16 sm:w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-full bg-white p-0.5 lg:p-1 ring-2">
  ```
- **Header Name Typography**:
  ```tsx
  <h3
    id={headingId}
    className="text-[13px] min-[360px]:text-[14.5px] min-[390px]:text-base sm:text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap leading-tight"
  >
    {member.name}
  </h3>
  ```
- **Critical Rule**: **Never** add `truncate` to the member's name in this header. Use `whitespace-nowrap` paired with responsive font clamps so the full name is always 100% visible on mobile.

---

## 10. Modal Dismissal Touch Ergonomics (`pointer-events-none` & Zero Inactivity)

### The Problem
When a modal unmounts via Framer Motion, standard spring transitions (`damping: 30, stiffness: 350`) hold the fixed backdrop in the DOM for ~450ms. If `pointer-events: auto` remains active, user touches intended for the landing page are intercepted by the fading modal, causing noticeable touch lag or inactivity on mobile.

### The Standard Implementation
1. **Disable Touch Interception on Exit**:
   ```tsx
   {/* Backdrop Overlay */}
   <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0, pointerEvents: 'none' }}
     transition={{ duration: 0.12, ease: 'easeOut' }}
     onClick={handleClose}
     className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm sm:backdrop-blur-md cursor-pointer"
   />

   {/* Modal Dialog Panel */}
   <motion.div
     role="dialog"
     initial={{ opacity: 0, scale: 0.96, y: 15 }}
     animate={{ opacity: 1, scale: 1, y: 0 }}
     exit={{ opacity: 0, scale: 0.97, pointerEvents: 'none' }}
     transition={{ duration: 0.12, ease: 'easeOut' }}
     className="fixed inset-0 ... z-50"
   />
   ```
2. **Instant Scroll & Touch Unlock (0ms)**:
   In `useModalHistory.ts`, unlock body styles immediately inside `handleClose()` and `handlePopState()`:
   ```typescript
   if (typeof document !== 'undefined') {
     const activeModals = document.querySelectorAll('[role="dialog"]')
     if (activeModals.length <= 1) {
       document.body.style.overflow = ''
       document.body.style.touchAction = ''
     }
   }
   ```
   *Result*: The user can scroll or tap the webpage the exact millisecond they tap Close, with 0ms dead time.

---

## 11. Root Viewport Canvas Background Token

To eliminate white screen flashes when unmounting full-screen overlays on mobile GPUs:
- Both `<html>` and `<body>` must explicitly declare `background-color: var(--background)` in `globals.css`:
  ```css
  html {
    background-color: var(--background);
    -webkit-text-size-adjust: 100%;
    scroll-padding-top: 6rem;
  }

  body {
    @apply bg-background text-foreground overflow-x-hidden;
    background-color: var(--background);
  }
  ```
- `app/layout.tsx` must declare `style={{ backgroundColor: '#eef1f5' }}` directly on both tags to guarantee the browser window canvas matches the page background prior to CSS hydration.

---

## 12. Fullscreen Photo Lightbox Specification (`ImageLightboxModal.tsx`)

### 1. Close & Dismissal Ergonomics (Instant 0ms on Mobile)
- **Top-Right Close ("X") Button**:
  - Must include **Safe-Area Insets**:
    ```tsx
    <div className="absolute top-0 right-0 p-3 sm:p-5 z-40 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))]">
    ```
  - Must have a minimum **44–48px touch target**:
    ```tsx
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        handleClose()
      }}
      aria-label="Close photo lightbox"
      className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-slate-300 hover:text-white bg-black/60 hover:bg-black/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-lg touch-manipulation"
    >
      <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
    </button>
    ```
- **Backdrop Click vs. Swipe Drag Detection**:
  - Differentiate finger swipes from quick taps using elapsed duration (`Date.now() - startTime`) and displacement threshold (`dx > 20px || dy > 20px`).
  - Do NOT swallow taps if `elapsed < 250ms`:
    ```tsx
    const handleBackdropClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-lightbox-photo]')) return
      const elapsed = Date.now() - pointerStartRef.current.time
      if (isDraggingRef.current && elapsed > 250) {
        isDraggingRef.current = false
        return
      }
      isDraggingRef.current = false
      handleClose()
    }
    ```
- **Hardware / Gesture Back Button Handling**:
  - Plug `ImageLightboxModal` into `useModalHistory({ isOpen, onClose, modalId: 'image-lightbox' })`.
  - When the user swipes back from the phone's edge or taps the Android back button, the modal dismisses smoothly in place at 0ms without triggering Next.js route transitions or page reloads.

### 2. High-Performance Horizontal Swiping
- **Native CSS Scroll Snapping**:
  ```tsx
  <div
    ref={scrollRef}
    onScroll={handleScroll}
    className="relative w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain cursor-pointer"
  >
  ```
- **CRITICAL**: Do **NOT** add `scroll-smooth` to the class list of the touch container. `scroll-smooth` causes mobile touch drag momentum to clash with browser easing physics. Programmatic smooth scrolling should only be used via `el.scrollTo({ left, behavior: 'smooth' })` on arrow and dot clicks.
- **Decouple Hidden Background Hero Scrolling**:
  - When opening the lightbox from `NewsDetailModal`, do **NOT** smooth-scroll the hidden hero banner behind the lightbox on every swipe step.
  - Track the active index in a lightweight ref (`lightboxIndexRef.current = newIdx`) during swipe.
  - When the lightbox closes, instantly sync the hero banner:
    ```tsx
    const handleClosePhoto = useCallback(() => {
      setIsPhotoOpen(false)
      const targetIdx = lightboxIndexRef.current
      setActiveImageIndex(targetIdx)
      if (heroScrollRef.current) {
        heroScrollRef.current.scrollLeft = targetIdx * heroScrollRef.current.clientWidth
      }
    }, [])
    ```

---

## 13. Strict Engineering Guardrails (DOs & DON'Ts)

### ❌ What NEVER to Do
1. **NEVER** use `window.history.pushState` directly without `useModalHistory`'s capture-phase `e.stopImmediatePropagation()`. Doing raw `pushState` in Next.js App Router triggers route revalidation and severe 200–400ms mobile UI freezes.
2. **NEVER** add `backdrop-filter: blur(...)` to fullscreen photo lightboxes. Mobile tile-based GPUs drop frame rates from 60–120 FPS down to 15 FPS. Use solid `bg-black/92`.
3. **NEVER** use `scroll-smooth` in CSS on native touch containers (`touch-pan-x` + `snap-x`).
4. **NEVER** smooth-scroll hidden background elements while a foreground modal is actively being swiped.
5. **NEVER** add `truncate` or `line-clamp` to leadership member names. Full names (e.g. `Mohammad Ninad Mahmud Nobo`) must remain on one single line (`whitespace-nowrap`).
6. **NEVER** leave exit animations without `pointerEvents: 'none'`. Failing to add this causes 300–500ms of dead touch time on mobile.
7. **NEVER** wrap a modal in outer `<AnimatePresence>` if the modal internally contains its own `<AnimatePresence>`. Double presence contexts break exit animations.

### ✅ What ALWAYS to Do
1. **ALWAYS** use `h-[100dvh]` on mobile sheets instead of `100vh`.
2. **ALWAYS** provide safe-area padding (`pt-[max(0.75rem,env(safe-area-inset-top))]`) and at least 44–48px touch targets for mobile close buttons.
3. **ALWAYS** clear `document.body.style.overflow = ''` and `touchAction = ''` at 0ms in `handleClose()` and `handlePopState()`.
4. **ALWAYS** set explicit background colors on `<html>` and `<body>` to prevent GPU white flashes upon modal unmounting.
5. **ALWAYS** use `touch-action: manipulation` on buttons and interactive cards to eliminate the 300ms mobile tap delay.

