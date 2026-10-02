'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { User, ChevronDown } from 'lucide-react'
import { fabinsInnovators, type InnovatorMember } from '@/lib/data/innovators'
import { InnovatorDetails } from '@/components/ui/InnovatorDetails'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { fadeUpProps } from '@/lib/animations'

/**
 * INNOVATORS SECTION — the team card grid, and the profile modal it opens.
 *
 * Content: `fabinsInnovators` in `lib/data/innovators.ts`.
 *
 * This section owns the modal's open/closed state: `selectedMember` is the
 * person being shown, or `null` when the modal is closed. `<AnimatePresence>`
 * is what lets `InnovatorDetails` play its exit animation before unmounting —
 * without it the modal would vanish instantly on close.
 */

/**
 * LinkedIn's mark, inlined as SVG.
 *
 * Written out rather than taken from lucide because this needs LinkedIn's exact
 * brand colour (#0A66C2) and filled shape; lucide provides only monochrome
 * outline icons. Everything else on the page uses lucide.
 */
const LinkedinIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="5" fill="#0A66C2" />
    <path
      d="M19 19H15.8202V13.8407C15.8202 12.5199 15.3408 11.6163 14.1565 11.6163C13.2505 11.6163 12.716 12.2217 12.4795 12.808C12.3929 13.0182 12.3708 13.3108 12.3708 13.6046V19H9.18972C9.18972 19 9.2323 10.3709 9.18972 9.46736H12.3708V10.8202C12.7937 10.1659 13.5517 9.2323 15.2492 9.2323C17.3392 9.2323 18.9189 10.5975 18.9189 13.5414V19H19Z"
      fill="white"
    />
    <path
      d="M5.53906 8.01633C6.65089 8.01633 7.34509 7.28308 7.32454 6.36875C7.30399 5.43317 6.65089 4.7207 5.56116 4.7207C4.47143 4.7207 3.75488 5.43317 3.75488 6.36875C3.75488 7.28308 4.45088 8.01633 5.53906 8.01633ZM3.94824 19H7.12933V9.46736H3.94824V19Z"
      fill="white"
    />
  </svg>
)

export const InnovatorsSection = () => {
  /** The member whose profile modal is open, or `null` when none is. */
  const [selectedMember, setSelectedMember] = useState<InnovatorMember | null>(null)

  return (
    <Section id="innovators">
      <SectionHeader
        layout="split"
        eyebrow="The Innovators"
        className="max-w-3xl lg:max-w-4xl mx-auto mb-10"
        title={
          <>
            {/* Two-tier heading: a small lead-in above the large wordmark. */}
            <span className="block text-[clamp(1.1rem,1.8vw,1.45rem)] font-extrabold tracking-tight opacity-90">
              INNOVATORS BEHIND
            </span>
            <span className="block text-[clamp(2.1rem,4vw,3.15rem)]">
              FAB<span className="text-accent">INS</span>
            </span>
          </>
        }
        description={
          <>
            System architecture, hardware integration, computer vision and production software
            engineered and built by{' '}
            <Link
              href="https://nevolyn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-ink underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
            >
              Nevolyn Technology
            </Link>.
          </>
        }
      />

      {/* Two-column grid with balanced proportions and aligned card heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 md:auto-rows-fr max-w-3xl lg:max-w-4xl mx-auto">
        {fabinsInnovators.map((member, index) => (
          <motion.article
            key={member.id}
            {...fadeUpProps(index * 0.1)}
            className="card card-hover group flex flex-col items-center text-center !p-4 min-[360px]:!p-5 sm:!p-7 h-full w-full"
          >
            {/* Person circular portrait with glowing accent ring */}
            <div className="relative mx-auto flex h-28 w-28 min-[360px]:h-32 min-[360px]:w-32 sm:h-36 sm:w-36 shrink-0 items-center justify-center rounded-full p-1 border-2 border-accent/80 shadow-[0_0_20px_rgba(14,116,144,0.2)] bg-panel transition-transform duration-500 group-hover:scale-[1.03]">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-panel-2">
                {member.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- see note in README on image optimisation */
                  <img
                    src={member.image}
                    alt={`${member.name} portrait`}
                    // `object-top` keeps faces in frame when the crop is tight.
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-accent">
                    <User className="h-12 w-12 stroke-[1.6]" />
                  </div>
                )}
              </div>
            </div>

            {/* Name & Title with consistent heights across cards */}
            <h3 className="mt-4 sm:mt-5 text-[13px] min-[350px]:text-[14px] min-[380px]:text-[15.5px] min-[420px]:text-base sm:text-base md:text-[17px] lg:text-xl font-bold tracking-tight text-ink leading-snug min-h-[1.75rem] flex items-center justify-center whitespace-nowrap">
              {member.name}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm font-semibold text-accent min-h-[1.25rem] flex items-center justify-center">
              {member.title}
            </p>

            {/* Short Bio with uniform container height */}
            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-ink-muted max-w-sm min-h-[2.75rem] flex items-center justify-center">
              {member.bio}
            </p>

            {/* Accent divider dash */}
            <div className="w-8 h-0.5 bg-accent/80 rounded-full mx-auto my-4 shrink-0" />

            {/* Bottom Actions pinned to bottom of card so both are on the exact same level */}
            <div className="mt-auto flex flex-col items-center w-full">
              {/* Pill-shaped VIEW DETAILS button */}
              <button
                onClick={() => setSelectedMember(member)}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-accent/40 bg-accent/5 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-accent transition-all duration-300 hover:border-accent hover:bg-accent/15 hover:scale-105 active:scale-95 shadow-xs"
              >
                <span>VIEW DETAILS</span>
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
              </button>

              {member.social?.linkedin && (
                <>
                  {/* Subtle hairline divider line across card */}
                  <div className="w-full border-t border-line/70 mt-4 mb-3.5" />

                  {/* Centered LinkedIn link with brand color */}
                  <Link
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0a66c2] hover:text-[#084e96] transition-all duration-300 active:scale-95"
                  >
                    <LinkedinIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>LinkedIn</span>
                  </Link>
                </>
              )}
            </div>
          </motion.article>
        ))}
      </div>

      {/* The modal is `fixed`, so the container cannot clip or constrain it. */}
      <AnimatePresence>
        {selectedMember && (
          <InnovatorDetails member={selectedMember} onClose={() => setSelectedMember(null)} />
        )}
      </AnimatePresence>
    </Section>
  )
}