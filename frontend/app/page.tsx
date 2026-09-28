import { PageShell } from '@/components/layout/PageShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { MarqueeStrip } from '@/components/sections/MarqueeStrip'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { SystemSection } from '@/components/sections/SystemSection'
import { StandardsSection } from '@/components/sections/StandardsSection'
import { InnovatorsSection } from '@/components/sections/InnovatorsSection'
import { LatestNewsSection } from '@/components/sections/LatestNewsSection'
import { ContactSection } from '@/components/sections/ContactSection'

/**
 * THE PAGE — FABINS is a single-page site, so this file is its table of contents.
 *
 * Read top to bottom, the sections tell the sales story in order:
 *   Hero        → what FABINS is
 *   Marquee     → what it does, at a glance
 *   Problem     → why manual inspection fails
 *   About       → why retrofit rather than replace
 *   System      → how it works, end to end
 *   Standards   → how defects are scored (ASTM D5430 Four-Point)
 *   Innovators  → who built it
 *   News        → official milestones, awards and updates
 *   Contact     → how to get it
 *
 * ─── TO REORDER OR ADD A SECTION ────────────────────────────────────────────
 *   1. Move or add the component below — this order is the page order.
 *   2. Update `NAV_LINKS` in `lib/data/site.ts` to match, so the navbar, the
 *      footer, and the scroll-spy stay in step.
 * Each section owns its own `id`, spacing, and background; there is deliberately
 * no layout logic here beyond the order itself.
 */

export default function Home() {
  return (
    <PageShell>
      <HeroSection />
      <MarqueeStrip />
      <ProblemSection />
      <AboutSection />
      <SystemSection />
      <StandardsSection />
      <InnovatorsSection />
      <LatestNewsSection />
      <ContactSection />
    </PageShell>
  )
}