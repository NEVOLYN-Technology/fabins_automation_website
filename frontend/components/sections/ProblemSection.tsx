'use client'

import { UserX, Clock, BarChart2, Database, Zap, Globe, ShieldAlert, Cpu } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FABINS_SYSTEM_DATA, type ProblemIconName } from '@/lib/data/fabins-system'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { InfoCard } from '@/components/ui/InfoCard'

/**
 * PROBLEM SECTION — why manual inspection at the frame does not scale.
 *
 * Content: `FABINS_SYSTEM_DATA.problemItems` in `lib/data/fabins-system.ts`.
 * Every item is rendered; there is no filtering here.
 */

/**
 * Maps each icon name used in the content to a real icon component.
 *
 * Typed as `Record<ProblemIconName, LucideIcon>`, which means TypeScript will
 * not compile unless this map covers every name in the `ProblemIconName` union.
 * Add an icon name to the data file and the build fails here until you supply
 * the matching icon — so a card can never render with a missing icon.
 */
const PROBLEM_ICONS: Record<ProblemIconName, LucideIcon> = {
  UserX,
  Clock,
  BarChart2,
  Database,
  Zap,
  Globe,
  ShieldAlert,
  Cpu,
}

export const ProblemSection = () => (
  <Section id="problem">
    <SectionHeader
      eyebrow="The problem"
      title={
        <>
          THE BOTTLENECK IN
          <br />
          <span className="text-accent">EVERY FABRIC ROLL</span>
        </>
      }
      description="Bangladesh RMG is a national export pillar, yet quality control at the frame is still one inspector, one pair of eyes, one tally sheet, while competing manufacturing hubs have already automated it."
    />

    {/* Card grid. Sized for four items per row on large screens. */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {FABINS_SYSTEM_DATA.problemItems.map((item, index) => (
        <InfoCard
          key={item.id}
          icon={PROBLEM_ICONS[item.iconName]}
          title={item.title}
          description={item.description}
          // Stagger each card slightly so the row cascades in on scroll.
          delay={index * 0.07}
        />
      ))}
    </div>
  </Section>
)
