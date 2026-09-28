'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeUpProps } from '@/lib/animations'
import { cn } from '@/lib/utils'

/**
 * SECTION HEADER — the eyebrow + heading + description block that opens every
 * major section of the page.
 *
 * WHY THIS EXISTS
 * Six sections repeated the same three elements with the same class strings and
 * the same three animation delays. Any tweak to the heading rhythm meant six
 * near-identical edits, and they had already drifted apart. This is now the one
 * place that markup lives.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────
 *   <SectionHeader
 *     eyebrow="The problem"
 *     title={<>THE BOTTLENECK IN<br />EVERY FABRIC ROLL</>}
 *     description="Bangladesh RMG is a national export pillar…"
 *   />
 *
 * ─── CHOOSING A LAYOUT ──────────────────────────────────────────────────────
 *   'stacked' (default) — heading and description in one narrow column.
 *                         Used by Problem, About, Standards.
 *   'split'             — heading left, description right on large screens.
 *                         Used by System, Innovators.
 *   'bare'              — no wrapper spacing, for headers that already sit
 *                         inside a parent grid cell. Used by Contact.
 *
 * The staggered entrance (eyebrow → title → description) is deliberate and
 * shared; to retime it, change the three delays below once.
 */

/** Entrance delays in seconds. Keeping them here keeps every section in step. */
const DELAY_EYEBROW = 0.05
const DELAY_TITLE = 0.1
const DELAY_DESCRIPTION = 0.16

/**
 * Default responsive heading size. Override per section with `titleClassName`
 * when a longer heading needs to run smaller (see StandardsSection).
 */
const DEFAULT_TITLE_SIZE = 'text-[clamp(2rem,4.4vw,3.25rem)]'

export interface SectionHeaderProps {
  /** Small uppercase label above the heading, e.g. "The problem". */
  eyebrow?: string
  /** Pill-shaped badge label, e.g. "UPDATES & MILESTONES". */
  pillLabel?: string
  /**
   * The heading itself. Accepts a node so sections can insert `<br />` line
   * breaks or accent-coloured `<span>`s.
   */
  title: ReactNode
  /** Optional supporting paragraph. Omit it and nothing is rendered. */
  description?: ReactNode
  /** See "Choosing a layout" above. Defaults to `'stacked'`. */
  layout?: 'stacked' | 'split' | 'bare'
  /** Extra classes for the `<h2>`, typically a size override. */
  titleClassName?: string
  /** Extra classes for the description, typically a width constraint. */
  descriptionClassName?: string
  /** Extra classes for the wrapper element. */
  className?: string
}

export function SectionHeader({
  eyebrow,
  pillLabel,
  title,
  description,
  layout = 'stacked',
  titleClassName,
  descriptionClassName,
  className,
}: SectionHeaderProps) {
  const labelText = pillLabel || eyebrow
  const isPill = Boolean(pillLabel)

  // Shared between all three layouts, so they can never drift apart again.
  const eyebrowElement = labelText ? (
    <motion.span
      {...fadeUpProps(DELAY_EYEBROW)}
      className={
        isPill
          ? 'inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-sky-50/80 px-3.5 py-1 text-xs font-bold tracking-wider text-sky-700 uppercase shadow-xs mb-3'
          : 'eyebrow'
      }
    >
      <span
        className={cn(
          'rounded-full',
          isPill ? 'h-2 w-2 bg-sky-500 animate-pulse' : 'h-2 w-2 bg-accent sm:h-2.5 sm:w-2.5'
        )}
      />
      {labelText}
    </motion.span>
  ) : null

  const titleElement = (
    <motion.h2
      {...fadeUpProps(DELAY_TITLE)}
      className={cn('display mt-5', DEFAULT_TITLE_SIZE, titleClassName)}
    >
      {title}
    </motion.h2>
  )

  // In 'split' the description is a flex sibling of the heading column, so it
  // gets no top margin — the parent's `gap` handles the spacing instead.
  if (layout === 'split') {
    return (
      <div
        className={cn(
          'mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end',
          className
        )}
      >
        <div className="max-w-2xl">
          {eyebrowElement}
          {titleElement}
        </div>

        {description && (
          <motion.p
            {...fadeUpProps(DELAY_DESCRIPTION)}
            className={cn('max-w-md leading-relaxed text-ink-muted', descriptionClassName)}
          >
            {description}
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <div className={cn(layout === 'stacked' && 'mb-14 max-w-3xl', className)}>
      {eyebrowElement}
      {titleElement}

      {description && (
        <motion.p
          {...fadeUpProps(DELAY_DESCRIPTION)}
          className={cn('mt-5 leading-relaxed text-ink-muted', descriptionClassName)}
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}

/**
 * Gradient text helper for stylized heading words.
 */
export function GradText({
  children,
  variant = 'sky',
  className,
}: {
  children: ReactNode
  variant?: 'sky' | 'emerald' | 'cyan' | 'indigo' | 'accent' | 'rose'
  className?: string
}) {
  const gradientClass =
    variant === 'emerald'
      ? 'from-emerald-500 to-teal-500'
      : variant === 'indigo'
        ? 'from-indigo-500 to-purple-500'
        : variant === 'cyan'
          ? 'from-cyan-500 to-blue-500'
          : variant === 'rose'
            ? 'from-rose-500 to-pink-500'
            : variant === 'accent'
              ? 'from-accent to-accent-bright'
              : 'from-sky-500 via-blue-600 to-indigo-600'

  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent font-extrabold',
        gradientClass,
        className
      )}
    >
      {children}
    </span>
  )
}