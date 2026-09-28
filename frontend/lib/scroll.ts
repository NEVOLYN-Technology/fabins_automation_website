'use client'

/**
 * SCROLL BEHAVIOUR — shared smooth-scrolling and scroll-spy for the one-page site.
 *
 * WHY THIS EXISTS
 * The Navbar and the Footer both need to scroll the visitor to a section, and
 * both need to compensate for the fixed header that would otherwise cover the
 * section's heading. That offset used to be a magic `-96` copy-pasted into two
 * files; it now lives here once, as `HEADER_OFFSET_PX`.
 *
 * ─── IF THE HEADER HEIGHT CHANGES ───────────────────────────────────────────
 * Update `HEADER_OFFSET_PX` below AND the matching values in:
 *   - `app/globals.css`              → `html { scroll-padding-top }`
 *   - `components/layout/PageShell`  → `<main className="pt-24">`
 * All three describe the same physical gap and must move together.
 */

import { useEffect, useState } from 'react'

/**
 * Height reserved for the fixed navbar, in pixels.
 * A section scrolled to with `scrollToSection` stops this far from the top so
 * its heading clears the header instead of hiding behind it.
 */
export const HEADER_OFFSET_PX = 96

/**
 * How far down the viewport the scroll-spy probe sits, in pixels.
 * A section counts as "active" once it has passed this line. Larger values
 * make the navbar highlight switch later (further into each section).
 */
const SPY_PROBE_OFFSET_PX = 200

/** Scroll distance, in pixels, after which the navbar switches to its solid style. */
const SCROLLED_THRESHOLD_PX = 16

/**
 * Smoothly scrolls to a section by its DOM `id`, accounting for the fixed header.
 *
 * @param sectionId - The `id` of a `<section>` on the page, or `'home'` to
 *                    return to the very top of the document.
 *
 * @example
 *   <a href="#system" onClick={(e) => { e.preventDefault(); scrollToSection('system') }}>
 */
export function scrollToSection(sectionId: string): void {
  // 'home' is the top of the document rather than a section that needs offsetting.
  if (sectionId === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const element = document.getElementById(sectionId)
  if (!element) return

  // getBoundingClientRect() is viewport-relative, so add the current scroll
  // position to convert it to a document-absolute coordinate. This is correct
  // for nested and transformed elements, unlike `offsetTop`.
  const targetTop = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX

  window.scrollTo({ top: targetTop, behavior: 'smooth' })
}

/**
 * Tracks which section the visitor is currently looking at, for navbar highlighting.
 *
 * Walks the given ids from last to first and returns the first one whose top
 * edge has already passed the probe line — i.e. the deepest section the visitor
 * has scrolled into.
 *
 * @param sectionIds - Section ids in the same top-to-bottom order they appear
 *                     on the page. Order matters; see `SECTION_IDS` in
 *                     `lib/data/site.ts` for the canonical list.
 * @returns The id of the active section. Defaults to the first id.
 */
export function useActiveSection(sectionIds: readonly string[]): string {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const probeLine = window.scrollY + SPY_PROBE_OFFSET_PX
          let current = sectionIds[0] ?? ''

          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const element = document.getElementById(sectionIds[i])
            if (!element) continue

            const elementTop = element.getBoundingClientRect().top + window.scrollY
            if (elementTop <= probeLine) {
              current = sectionIds[i]
              break
            }
          }

          setActiveSection((prev) => (prev !== current ? current : prev))
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Run once so the correct link is highlighted on first paint.

    return () => window.removeEventListener('scroll', handleScroll)
    // `sectionIds` is a module-level constant, so this effect runs exactly once.
  }, [sectionIds])

  return activeSection
}

/**
 * Returns `true` once the page has been scrolled past `SCROLLED_THRESHOLD_PX`.
 * Used by the Navbar to swap from its translucent resting style to its solid,
 * elevated style.
 */
export function useIsScrolled(): boolean {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled((prev) => {
            const next = window.scrollY > SCROLLED_THRESHOLD_PX
            return prev !== next ? next : prev
          })
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return isScrolled
}