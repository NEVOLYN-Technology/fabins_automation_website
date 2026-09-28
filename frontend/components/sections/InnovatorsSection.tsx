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
            System architecture, hardware integration, computer vision and production software —
            built at Saturn Textiles R&amp;D by our parent company{' '}
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

      {/* Two-column grid, so an odd number of members leaves a gap. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {fabinsInnovators.map((member, index) => (
          <motion.article
            key={member.id}
            {...fadeUpProps(index * 0.1)}
            className="card card-hover group flex flex-col gap-6 !p-6 sm:flex-row sm:items-start"
          >
            {/* Portrait, or a placeholder if the member has no image. */}
            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl border border-line bg-panel-2 sm:h-44 sm:w-36">
              {member.image ? (
                /* eslint-disable-next-line @next/next/no-img-element -- see note in README on image optimisation */
                <img
                  src={member.image}
                  alt={`${member.name} portrait`}
                  // `object-top` keeps faces in frame when the crop is tight.
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-soft">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="text-lg font-semibold leading-snug tracking-tight">{member.name}</h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                {member.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{member.bio}</p>

              {/* `mt-auto` pins this row to the bottom so both cards align. */}
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="group inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-accent transition-all duration-300 hover:-translate-y-0.5 hover:text-accent-bright active:scale-95"
                >
                  View details
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>

                {member.social?.linkedin && (
                  <Link
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    className="group inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-ink-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-[#0A66C2] active:scale-95"
                  >
                    <LinkedinIcon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span>LinkedIn</span>
                  </Link>
                )}
              </div>
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