# 📱 Smooth Card Details & Zero-Lag Full Picture Lightbox Guide
### Cross-Platform Implementation for Mobile Web, iPad (Portrait & Landscape), and Desktop

This documentation provides an end-to-end, copy-pasteable architectural guide and code-level implementation for building **smooth transitions between card previews, detailed pop-up cards, and fullscreen photo lightboxes**. 

It is designed to solve common cross-platform UX pitfalls such as:
1. Mobile edge-swipe / back button navigating away from the site instead of closing the modal.
2. Next.js router revalidation freeze when opening image lightboxes.
3. Jittery animations and mobile layout shifts caused by 100vh toolbar expansion.
4. Handling responsiveness across **Mobile**, **iPad (vertical & horizontal)**, and **Desktop Web**.

---

## 🏗️ Architectural Overview & User Flow

```
┌────────────────────────────────────────────────────────┐
│ 1. Card Grid (Landing/Page View)                       │
│    [Thumbnail Image] [Title] [ "View Details" Button ] │
└──────────────────────────┬─────────────────────────────┘
                           │ User clicks "View Details"
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. View Details Modal (`DetailModal`)                  │
│    • Mobile/iPad Portrait: Edge-to-edge `100dvh` sheet │
│    • iPad Landscape/Web: Floating centered rounded card│
│    • Interactive hero banner with horizontal snap      │
└──────────────────────────┬─────────────────────────────┘
                           │ User taps photo to expand
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Full Picture View (`ImageLightboxModal`)            │
│    • Zero-lag instant transition (0.12s fade)          │
│    • Native CSS touch scroll-snap (60/120 FPS swipe)   │
│    • Photo-centric caption & counter bar               │
│    • Click anywhere outside photo to return            │
└────────────────────────────────────────────────────────┘
```

---

## 📱 Device-Level Ergonomics Matrix

| Device Tier | Viewport Breakpoint | Details Modal Layout | Image Lightbox Layout | Gesture & Navigation Support |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Web** | `< 640px` (`sm:`) | `h-[100dvh] w-full rounded-none` (zero outer margin, sticky top bar) | `max-h-[66vh]`, photo title + pill counter stacked directly below photo | Native swipe-back / Android physical back button closes modal via `popstate`; horizontal touch snap |
| **iPad Vertical (Portrait)** | `768px - 1024px` (`md:`) | `h-[100dvh]` or `max-h-[95vh]`, comfortable thumb-reach touch targets | `max-h-[70vh]`, stacked caption, touch-pan swipe with rubber-band containment | Two-finger & touch-pan gestures; rubber-band containment (`overscroll-contain`) |
| **iPad Horizontal & Web** | `≥ 1024px` (`lg:`) | `lg:max-w-2xl lg:max-h-[90vh] rounded-3xl`, centered dialog with drop-shadow | `max-h-[74vh]`, horizontal row for title and counter; left/right arrow buttons | Arrow keys (`←`, `→`), `Esc` key to close, click outside photo to dismiss |

---

## 🛠️ Step 1: Mobile Native Back-Gesture Hook (`useModalHistory.ts`)

### Why this is essential:
On mobile devices and iPads, users intuitively use the browser back button or edge-swipe to dismiss an open modal. Without this hook, the browser pops the URL and navigates the user off the page.

Create `lib/hooks/useModalHistory.ts` (or `hooks/useModalHistory.ts`):

```typescript
'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
}

/**
 * useModalHistory - Manages browser history integration for popup modals.
 *
 * 1. Pushes a dummy state into history so the modal becomes the latest history entry.
 * 2. If the user presses the phone's back button / edge swipe, `popstate` fires and
 *    smoothly closes the modal without leaving the website.
 * 3. If the user clicks any on-screen "Back" or "Close" button, `handleClose()` will
 *    call `window.history.back()`, cleanly popping the history state and closing the modal.
 * 4. Manages body scroll locking and keyboard Escape handling.
 */
export function useModalHistory({ isOpen, onClose, modalId = 'modal' }: UseModalHistoryOptions) {
  const hasPushedStateRef = useRef(false)
  const isClosingRef = useRef(false)

  // Unified close handler for on-screen buttons and backdrop clicks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
        window.history.back()
        return
      }
    }

    onClose()
  }, [onClose, modalId])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      hasPushedStateRef.current = false
      return
    }

    isClosingRef.current = false

    // Push history entry for mobile back-button handling
    try {
      const currentState = window.history.state || {}
      window.history.pushState({ ...currentState, [modalId]: true }, '')
      hasPushedStateRef.current = true
    } catch {
      hasPushedStateRef.current = false
    }

    const handlePopState = () => {
      hasPushedStateRef.current = false
      onClose()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Lock background scroll while modal is active
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
    }
  }, [isOpen, modalId, onClose, handleClose])

  return { handleClose }
}
```

---

## 🛠️ Step 2: Zero-Lag Full Picture Lightbox (`ImageLightboxModal.tsx`)

### The Performance Principles Behind Zero-Lag:
* **No `window.history.pushState` on secondary photo clicks:** Running Next.js router revalidations on top of an already open modal introduces a 150-300ms freeze. Secondary photo viewing remains pure React state.
* **Hardware-Accelerated Fade:** Framer Motion `duration: 0.12s, ease: 'easeOut'`.
* **Solid Background (`bg-black/95`):** Avoids heavy `backdrop-filter: blur()` during fullscreen photo zooms which can drop FPS on mobile GPUs.
* **Pointer Gesture Detection:** Tracks mouse/finger drag distance. If the user was swiping between pictures, releasing the finger will *not* trigger the backdrop-click dismissal.

Create `components/ui/ImageLightboxModal.tsx`:

```tsx
'use client'

import type { JSX } from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export interface ImageLightboxModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  images: string[]
  initialIndex?: number
  onIndexChange?: (newIndex: number) => void
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  title,
  images,
  initialIndex = 0,
  onIndexChange,
}: ImageLightboxModalProps): JSX.Element | null {
  const validImages = images.length > 0 ? images : []
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Sync currentIndex when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const targetIndex = Math.max(0, Math.min(initialIndex, validImages.length - 1))
      setCurrentIndex(targetIndex)
      requestAnimationFrame(() => {
        const el = scrollRef.current
        if (el) {
          el.scrollLeft = targetIndex * el.clientWidth
        }
      })
    }
  }, [isOpen, initialIndex, validImages.length])

  // Track pointer gestures to prevent closing when dragging/swiping
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
    if (dx > 10 || dy > 10) {
      isDraggingRef.current = true
    }
  }

  // Dismiss modal on backdrop / outside clicks unless user was swiping
  const handleBackdropClick = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      return
    }
    onClose()
  }

  // Real-time horizontal scroll tracking
  const handleScroll = useCallback(() => {
    isDraggingRef.current = true
    const el = scrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width)
      if (newIndex >= 0 && newIndex < validImages.length && newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    }
  }, [validImages.length, currentIndex, onIndexChange])

  // Scroll to a specific photo index
  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const targetLeft = index * el.clientWidth
    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
    setCurrentIndex(index)
    onIndexChange?.(index)
  }, [onIndexChange])

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation()
        if (currentIndex > 0) scrollToIndex(currentIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation()
        if (currentIndex < validImages.length - 1) scrollToIndex(currentIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, validImages.length, onClose, scrollToIndex])

  if (!isOpen || validImages.length === 0) return null

  const isMultiple = validImages.length > 1

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Photo Lightbox'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 text-white select-none overscroll-contain cursor-pointer"
      >
        {/* Floating Top-Right Close Button */}
        <div className="absolute top-0 right-0 p-3 sm:p-5 z-40">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label="Close photo lightbox"
            className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white bg-black/60 hover:bg-black/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Photos Carousel with CSS Scroll Snapping */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth cursor-pointer"
        >
          {validImages.map((src, idx) => (
            <div
              key={idx}
              className="w-full h-full shrink-0 snap-center snap-always flex flex-col items-center justify-center p-3 sm:p-6 cursor-pointer"
            >
              {/* Photo & Caption Group: Centers photo and places caption just below it */}
              <div className="flex flex-col items-center max-w-full">
                {/* Photo Image — Clicking the photo itself does NOT close */}
                <img
                  src={src}
                  alt={title ? `${title} — Photo ${idx + 1}` : `Photo ${idx + 1}`}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-[96vw] lg:max-w-[92vw] max-h-[66vh] lg:max-h-[74vh] object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default select-none"
                />

                {/* Photo Caption & Counter: Positioned directly below photo */}
                <div className="mt-2.5 flex flex-col items-center justify-center gap-1.5 text-center max-w-2xl px-2">
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2.5">
                    {title && (
                      <h4 className="text-xs sm:text-sm lg:text-base font-medium text-slate-200 line-clamp-1 max-w-[90vw] lg:max-w-xl text-center">
                        {title}
                      </h4>
                    )}
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-slate-200 border border-white/10 tracking-wide">
                      Photo {idx + 1} of {validImages.length}
                    </span>
                  </div>

                  {/* Interactive Indicator Dots */}
                  {isMultiple && (
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      {validImages.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            scrollToIndex(dotIdx)
                          }}
                          aria-label={`Jump to photo ${dotIdx + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            dotIdx === currentIndex
                              ? 'w-4 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                              : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop / iPad Navigation Arrows */}
        {isMultiple && currentIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              scrollToIndex(currentIndex - 1)
            }}
            aria-label="Previous photo"
            className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        {isMultiple && currentIndex < validImages.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              scrollToIndex(currentIndex + 1)
            }}
            aria-label="Next photo"
            className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## 🛠️ Step 3: View Details Responsive Modal (`DetailModal.tsx`)

This component bridges the initial card and the full picture view.

Create `components/ui/DetailModal.tsx`:

```tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import { useModalHistory } from '@/lib/hooks/useModalHistory'
import { ImageLightboxModal } from './ImageLightboxModal'

export interface DetailItem {
  id: string
  title: string
  subtitle?: string
  description: string
  images: string[]
}

interface DetailModalProps {
  item: DetailItem | null
  isOpen: boolean
  onClose: () => void
}

export function DetailModal({ item, isOpen, onClose }: DetailModalProps) {
  // Mobile history integration
  const { handleClose } = useModalHistory({
    isOpen: Boolean(isOpen && item),
    onClose,
    modalId: 'detail-modal',
  })

  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const heroScrollRef = useRef<HTMLDivElement>(null)

  const images = item?.images ?? []
  const isMultiple = images.length > 1

  // Reset scroll & photo index on item change
  useEffect(() => {
    setActiveImageIndex(0)
    if (heroScrollRef.current) {
      heroScrollRef.current.scrollLeft = 0
    }
  }, [item?.id, isOpen])

  const handleHeroScroll = useCallback(() => {
    const el = heroScrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIdx = Math.round(el.scrollLeft / width)
      if (newIdx >= 0 && newIdx < images.length && newIdx !== activeImageIndex) {
        setActiveImageIndex(newIdx)
      }
    }
  }, [images.length, activeImageIndex])

  const scrollToIndex = useCallback((index: number) => {
    const el = heroScrollRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
    setActiveImageIndex(index)
  }, [])

  if (!item) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-8 overscroll-contain">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm lg:backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Modal Container: Fullscreen on mobile & iPad portrait, floating centered dialog on iPad landscape & desktop */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full h-[100dvh] lg:h-auto lg:max-w-2xl lg:max-h-[90vh] flex flex-col rounded-none lg:rounded-3xl bg-white shadow-2xl border-0 lg:border border-slate-200 overflow-hidden z-10 overscroll-contain"
            >
              {/* Sticky Top Header */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span className="truncate max-w-[200px]">{item.subtitle || 'Details'}</span>
                </span>

                <button
                  onClick={handleClose}
                  type="button"
                  aria-label="Close dialog"
                  className="p-1.5 lg:p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
                >
                  <X className="w-6 h-6" strokeWidth={2.2} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div
                className="overflow-y-auto overflow-x-hidden no-scrollbar flex-1 overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* Hero Banner with Scroll Snap */}
                {images.length > 0 && (
                  <div className="relative w-full h-56 sm:h-64 lg:h-72 bg-slate-900 overflow-hidden select-none">
                    <div
                      ref={heroScrollRef}
                      onScroll={handleHeroScroll}
                      className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth"
                    >
                      {images.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveImageIndex(idx)
                            setIsPhotoOpen(true)
                          }}
                          className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center cursor-zoom-in relative"
                        >
                          <img
                            src={imgSrc}
                            alt={`${item.title} — Photo ${idx + 1}`}
                            className="w-full h-full object-contain p-2 sm:p-3 pointer-events-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Zoom-in Badge */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-xs shadow-xs pointer-events-none">
                      <ZoomIn size={12} />
                      <span>Click photo to expand</span>
                    </div>

                    {/* Navigation Arrows */}
                    {isMultiple && activeImageIndex > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          scrollToIndex(activeImageIndex - 1)
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}
                    {isMultiple && activeImageIndex < images.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          scrollToIndex(activeImageIndex + 1)
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}

                    {/* Dots */}
                    {isMultiple && (
                      <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              scrollToIndex(idx)
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === activeImageIndex
                                ? 'w-4 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                                : 'w-1.5 bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Details Text Content */}
                <div className="p-5 sm:p-8 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {item.title}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Lightbox */}
      <ImageLightboxModal
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        title={item.title}
        images={images}
        initialIndex={activeImageIndex}
        onIndexChange={(newIndex) => {
          setActiveImageIndex(newIndex)
          scrollToIndex(newIndex)
        }}
      />
    </>
  )
}
```

---

## 🛠️ Step 4: Card Component Integration Example

Here is how you trigger the flow from any card grid or list component:

```tsx
'use client'

import { useState } from 'react'
import { DetailModal, type DetailItem } from '@/components/ui/DetailModal'

const SAMPLE_ITEMS: DetailItem[] = [
  {
    id: 'project-1',
    title: 'Autonomous System Deployment',
    subtitle: 'Robotics',
    description: 'Real-time telemetry and camera vision inspection system.',
    images: ['/images/project1-a.jpg', '/images/project1-b.jpg'],
  },
]

export function PortfolioSection() {
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null)

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_ITEMS.map((item) => (
          <div key={item.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col">
            <div className="h-48 w-full bg-slate-100 overflow-hidden">
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
              
              <div className="mt-auto pt-4">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full py-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Details Modal with nested Lightbox */}
      <DetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  )
}
```

---

## 🎨 Global CSS Utilities Needed

Add these utility rules to your `globals.css` or CSS file:

```css
/* 1. Prevent rubber-band bounce from leaking through */
.overscroll-contain {
  overscroll-behavior: contain;
}

/* 2. Hide scrollbars while preserving kinetic touch scrolling */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 3. Hardware acceleration hints */
.cursor-zoom-in {
  cursor: zoom-in;
}
```

---

## 🏆 Key Takeaways & Best Practices

1. **Use `100dvh` for Mobile Sheets**: Traditional `100vh` causes bottom buttons to be clipped behind mobile address bars. `100dvh` (Dynamic Viewport Height) resizes automatically with the browser UI.
2. **CSS Scroll Snap over Javascript Carousels**: Using `snap-x snap-mandatory` leverages native mobile OS compositor threads (60/120Hz smooth scrolling) rather than continuous JS layout calculations.
3. **Decouple Router State from Lightbox**: Pushing browser state when opening a high-res photo modal slows down frame delivery due to route reconciliation. Keep the Lightbox in pure React state while letting the parent modal manage the browser history state.
