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
| **Lightbox State** | Pure React (`NO pushState`) | Pure React (`NO pushState`) | Pure React (`NO pushState`) |
| **Lightbox Arrows** | Visible (`absolute left-2`) | Visible (`absolute left-3`) | Visible (`absolute left-4`) |
| **Back Button Action** | Closes modal via `popstate` / `history.back()` | Closes modal via `popstate` / `history.back()` | Closes modal via on-screen button / `Esc` |
