'use client'

import { useId, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { X, Mail, ExternalLink, User, ArrowLeft } from 'lucide-react'
import type { InnovatorMember } from '@/lib/data/innovators'
import { useModalHistory } from '@/lib/hooks/useModalHistory'

/**
 * INNOVATOR PROFILE MODAL — the full biography dialog opened from an
 * innovator card in `InnovatorsSection`.
 *
 * The parent owns the open/closed state and wraps this in Framer Motion's
 * `<AnimatePresence>`; this component renders only when a member is selected
 * and handles its own exit animation.
 *
 * ─── ACCESSIBILITY ──────────────────────────────────────────────────────────
 * This is a modal dialog, so it takes over the keyboard while open:
 *   - focus moves into the dialog on open and returns to the card on close
 *   - Tab and Shift+Tab cycle within the dialog instead of escaping behind it
 *   - Escape closes it, as does clicking the backdrop
 *   - background scrolling is locked
 * Keep all four behaviours if you refactor this — they are what make it a
 * dialog rather than a floating box.
 *
 * ─── ON THE COLOURS ─────────────────────────────────────────────────────────
 * This dialog deliberately uses its own blue/slate palette rather than the
 * site's teal `--accent` tokens. The values are collected in `PALETTE` below
 * so the whole modal can be recoloured in one edit. To bring it in line with
 * the rest of the site, swap them for `text-accent` / `border-line` /
 * `text-ink-muted` and friends — but note that this changes the visual design,
 * so it is left as an explicit decision rather than done silently.
 */

/** Every colour used by this dialog, in one place. */
const PALETTE = {
  panel: 'bg-white',
  border: 'border-blue-500/70',
  glow: 'shadow-[0_0_45px_rgba(37,99,235,0.25)]',
  ring: 'ring-blue-500/80',
  accentText: 'text-blue-500',
  headingText: 'text-slate-900',
  bodyText: 'text-slate-600',
  listText: 'text-slate-700',
  labelText: 'text-slate-800',
  mutedText: 'text-slate-400',
  hairline: 'border-slate-100',
  hoverSurface: 'hover:bg-slate-100',
} as const

export interface InnovatorDetailsProps {
  member: InnovatorMember
  onClose: () => void
}

export function InnovatorDetails({ member, onClose }: InnovatorDetailsProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const headingId = useId()

  // Integrates browser history so phone back button / edge swipe closes the modal smoothly
  const { handleClose } = useModalHistory({
    isOpen: true,
    onClose,
    modalId: 'innovator-details',
  })

  // Fall back to the one-line card bio if no long-form biography was written.
  const bioParagraphs: string[] = member.extendedBio ?? [member.bio]

  return (
    <>
      {/* Backdrop — dims the page and closes the dialog when clicked. */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm sm:backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Dialog panel — mobile-first full sheet or centered desktop dialog */}
      <motion.div
        key="panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50
                   w-full h-[100dvh] sm:h-auto sm:w-[94%] sm:max-w-3xl sm:max-h-[85vh] flex flex-col
                   bg-white rounded-none sm:rounded-[28px] shadow-2xl
                   border-0 sm:border-2 border-blue-500/70 sm:ring-4 ring-blue-500/10
                   overflow-hidden overscroll-contain"
      >
        {/* Top Decorative Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 shrink-0" />

        {/* ── Fixed Header: portrait, name, title, Back & close buttons ─────────────────── */}
        <div
          className={`flex shrink-0 items-center justify-between gap-3 sm:gap-4 border-b ${PALETTE.hairline} ${PALETTE.panel} p-3.5 sm:p-6 md:px-8 bg-white z-10`}
        >
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Quick Back Button on Mobile */}
            <button
              onClick={handleClose}
              type="button"
              aria-label="Back to innovators"
              className="inline-flex sm:hidden items-center justify-center p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Portrait avatar */}
            <div
              className={`relative flex h-12 w-12 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-white p-0.5 sm:p-1 shadow-sm ring-2 ${PALETTE.ring}`}
            >
              {member.image ? (
                /* eslint-disable-next-line @next/next/no-img-element -- see note in README on image optimisation */
                <img
                  src={member.image}
                  alt={`${member.name} portrait`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                /* Fallback when a member has no portrait in `public/`. */
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <User className={`h-6 w-6 sm:h-8 sm:w-8 ${PALETTE.accentText}`} />
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="min-w-0">
              <h3
                id={headingId}
                className={`text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight ${PALETTE.headingText} truncate`}
              >
                {member.name}
              </h3>
              <p className={`mt-0.5 sm:mt-1 text-xs sm:text-base font-semibold ${PALETTE.accentText} truncate`}>
                {member.title}
              </p>
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClose}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleClose}
              type="button"
              aria-label="Close profile"
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* ── Body: biography, responsibilities, links ─────────────────────── */}
        <div
          className={`flex-1 space-y-6 sm:space-y-7 overflow-y-auto no-scrollbar p-5 sm:p-8 text-sm leading-relaxed ${PALETTE.bodyText} sm:text-base overscroll-contain`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="space-y-4">
            {bioParagraphs.map((paragraph: string, index: number) => (
              <p key={index} className={`leading-relaxed ${PALETTE.bodyText}`}>
                {paragraph}
              </p>
            ))}
          </div>

          {member.responsibilities.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-6">
              <h4
                className={`mb-3 text-xs font-extrabold uppercase tracking-widest ${PALETTE.headingText}`}
              >
                Key Responsibilities
              </h4>
              <ul className={`list-disc space-y-1.5 pl-5 ${PALETTE.listText}`}>
                {member.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/*
            Links block. Every row is optional and renders only when the matching
            field exists on the member, so adding a link means editing
            `lib/data/innovators.ts` only — unless it is a brand-new *kind* of
            link, in which case add a `<ProfileLink>` row here too.
          */}
          {(member.social || member.email) && (
            <div>
              <h4
                className={`mb-3 text-xs font-extrabold uppercase tracking-widest ${PALETTE.headingText}`}
              >
                Links &amp; Profiles
              </h4>
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {member.social?.portfolio && (
                  <ProfileLink
                    href={member.social.portfolio}
                    label="Portfolio"
                    value={stripProtocol(member.social.portfolio)}
                  />
                )}
                {member.social?.github && (
                  <ProfileLink
                    href={member.social.github}
                    label="GitHub"
                    value={stripProtocol(member.social.github)}
                  />
                )}
                {member.social?.linkedin && (
                  <ProfileLink
                    href={member.social.linkedin}
                    label="LinkedIn"
                    value={stripProtocol(member.social.linkedin)}
                  />
                )}
                {member.social?.scholar && (
                  <ProfileLink
                    href={member.social.scholar}
                    label="Google Scholar"
                    value={member.social.scholarName || 'Google Scholar'}
                  />
                )}
                {member.social?.orcid && (
                  <ProfileLink
                    href={member.social.orcid}
                    label="ORCID"
                    value={member.social.orcid.split('/').pop() ?? member.social.orcid}
                  />
                )}
                {member.email && (
                  <ProfileLink
                    href={`mailto:${member.email}`}
                    label="Email"
                    value={member.email}
                    icon="mail"
                  />
                )}
              </div>
            </div>
          )}

          {/* Bottom Dismiss / Back Button */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleClose}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/90 font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Innovators</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

/** Strips `https://` and a leading `www.` so long URLs read cleanly. */
function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '')
}

/**
 * One "Label: value" row in the links grid.
 *
 * Extracted because the six rows above were six copies of the same 12 lines of
 * markup, differing only in their label and how the display text was derived.
 */
function ProfileLink({
  href,
  label,
  value,
  icon = 'external',
}: {
  href: string
  /** Bold prefix, e.g. "GitHub". */
  label: string
  /** Display text for the link target. */
  value: string
  /** `mail` for mailto links, `external` for everything else. */
  icon?: 'external' | 'mail'
}) {
  const Icon = icon === 'mail' ? Mail : ExternalLink
  const isExternal = href.startsWith('http')

  return (
    <Link
      href={href}
      // Only http(s) links open in a new tab; a mailto: would open a blank one.
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-center gap-2 text-sm transition-colors hover:opacity-85 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200"
    >
      <Icon className={`h-4 w-4 shrink-0 ${PALETTE.accentText}`} />
      <span className={`font-bold ${PALETTE.labelText}`}>{label}:</span>
      <span className={`${PALETTE.accentText} truncate hover:underline`}>{value}</span>
    </Link>
  )
}