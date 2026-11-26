'use client'

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { FABINS_SYSTEM_DATA } from '@/lib/data/fabins-system'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { fadeUpProps } from '@/lib/animations'

/**
 * ABOUT SECTION — why FABINS retrofits existing machines instead of replacing them.
 *
 * Content: `FABINS_SYSTEM_DATA.aboutComparisons` in `lib/data/fabins-system.ts`.
 *
 * ─── ON THE LAYOUT ──────────────────────────────────────────────────────────
 * This reads as a table but is built from CSS grid rather than `<table>`, so
 * that each row can collapse into a stack on small screens. The 3/4/5 column
 * split is repeated in the header row and in each body row and the two must
 * stay in sync, or the headings will not sit above their columns.
 */

export const AboutSection = () => (
  <Section id="about">
    <SectionHeader
      eyebrow="The Strategy"
      titleClassName="text-[clamp(1.65rem,3.2vw,2.5rem)]"
      title={
        <>
          RETROFIT, DON'T REPLACE:
          <br />
          <span className="text-accent">UPGRADE YOUR EXISTING MACHINES</span>
        </>
      }
      description="Importing complete automated inspection machines from abroad requires millions in capital expenditure and disruptive factory floor redesign. FABINS upgrades the inspection machines already sitting in Bangladeshi mills."
    />

    <motion.div
      {...fadeUpProps(0.22)}
      className="overflow-hidden rounded-3xl border border-line bg-panel shadow-sm"
    >
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[540px] sm:min-w-0">
          {/* Column headings. Widths match the body rows below. */}
          <div className="grid grid-cols-12 border-b border-line bg-panel-2 px-5 sm:px-6 py-3.5 sm:py-4 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ink-soft">
            <div className="col-span-3">Dimension</div>
            <div className="col-span-4 text-rose-500/80">Conventional Machine</div>
            <div className="col-span-5 font-extrabold text-accent">FABINS Retrofit</div>
          </div>

          <div className="divide-y divide-line/60">
            {FABINS_SYSTEM_DATA.aboutComparisons.map((row) => (
              <div
                key={row.dimension}
                className="grid grid-cols-12 items-start gap-4 sm:gap-6 px-5 sm:px-6 py-5 sm:py-6"
              >
                <span className="col-span-3 text-base sm:text-lg font-semibold tracking-tight text-ink">
                  {row.dimension}
                </span>

                {/* Conventional: muted, marked with a cross. */}
                <div className="col-span-4">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-rose-600/90 sm:text-ink-soft">
                    <X className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                    {row.conventional}
                  </span>
                  <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs leading-relaxed text-ink-soft">
                    {row.conventionalDetail}
                  </p>
                </div>

                {/* FABINS: accented, marked with a check. */}
                <div className="col-span-5">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {row.fabins}
                  </span>
                  <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs leading-relaxed text-ink-muted">
                    {row.fabinsDetail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </Section>
)
