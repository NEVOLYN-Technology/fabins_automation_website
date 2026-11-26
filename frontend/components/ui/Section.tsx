import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * SECTION — the outer shell every page section shares.
 *
 * Supplies two things that were previously copy-pasted into each section: the
 * vertical rhythm (`py-24 sm:py-28`) and the centred content container
 * (`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`). Changing the page's maximum width
 * or its section spacing is now one edit here rather than seven.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────
 *   <Section id="problem">
 *     <SectionHeader … />
 *     …
 *   </Section>
 *
 * With a background — `className` lands on the `<section>` element:
 *
 *   <Section id="standards" className="border-y border-line bg-canvas-alt/40">
 *
 * ─── WHAT THE `id` IS FOR ───────────────────────────────────────────────────
 * It is the scroll target for the navbar and the footer. It must match an entry
 * in `NAV_LINKS` (`lib/data/site.ts`), or the link will scroll nowhere and the
 * scroll-spy will never highlight it.
 *
 * ─── WHEN NOT TO USE THIS ───────────────────────────────────────────────────
 * `HeroSection` has its own asymmetric padding and `MarqueeStrip` is a full-
 * bleed strip with no container at all. Both are deliberately hand-rolled —
 * forcing them through this component would mean adding props that exist for a
 * single caller.
 */

interface SectionProps {
  /** DOM id used as the scroll target. Must match the nav entry. */
  id: string
  children: ReactNode
  /** Extra classes for the `<section>` — backgrounds, borders, overflow. */
  className?: string
  /** Extra classes for the inner container. Rarely needed. */
  containerClassName?: string
}

export function Section({ id, children, className, containerClassName }: SectionProps) {
  return (
    // `cn` merges rather than concatenates, so a caller passing `py-16` cleanly
    // replaces the default padding instead of both classes fighting.
    <section id={id} className={cn('py-24 sm:py-28', className)}>
      <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', containerClassName)}>
        {children}
      </div>
    </section>
  )
}
