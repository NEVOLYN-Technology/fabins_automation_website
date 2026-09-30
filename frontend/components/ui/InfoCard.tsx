'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { fadeUpProps } from '@/lib/animations'
import { cn } from '@/lib/utils'

/**
 * INFO CARD — the icon-and-text card used across the feature grids.
 *
 * Backs both the problem cards and the hardware pillars, which were the same
 * card with two small differences: the pillars carry a spec chip in the corner
 * and an accent sub-heading. Both are optional props here, so one component
 * serves both grids and any future one.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────
 *   // Plain: icon, title, description
 *   <InfoCard icon={Clock} title="Fatigue" description="…" delay={0.07} />
 *
 *   // With a corner chip and an accent sub-heading
 *   <InfoCard
 *     icon={Camera}
 *     title="Line-Scan Camera"
 *     headline="8192px Industrial Color Sensor"
 *     spec="8192px Line Rate"
 *     description="…"
 *   />
 *
 * ─── STAGGERING A GRID ──────────────────────────────────────────────────────
 * Pass the item's index times a small step so the row cascades in on scroll:
 *
 *   items.map((item, i) => <InfoCard key={item.id} delay={i * 0.07} … />)
 */

interface InfoCardProps {
  /** Icon component from `lucide-react`, shown in the tile. */
  icon: LucideIcon
  title: string
  description: string
  /** Optional accent line between the title and the description. */
  headline?: string
  /** Optional short spec, shown as a chip in the top-right corner. */
  spec?: string
  /**
   * Heading level. Defaults to `h3`. Use `h4` when the card sits under a
   * sub-heading, so the document outline stays correctly nested.
   */
  as?: 'h3' | 'h4'
  /** Entrance delay in seconds. */
  delay?: number
  className?: string
}

export function InfoCard({
  icon: Icon,
  title,
  description,
  headline,
  spec,
  as: Heading = 'h3',
  delay = 0,
  className,
}: InfoCardProps) {
  return (
    <motion.div {...fadeUpProps(delay)} className={cn('card card-hover', className)}>
      {/* When there is a spec chip the row becomes a split; otherwise the tile
          sits alone. Both keep the same 24px gap below. */}
      <div className={cn('mb-6', spec && 'flex items-start justify-between')}>
        <IconTile icon={Icon} />
        {spec && <span className="chip !text-[10px] text-accent">{spec}</span>}
      </div>

      <Heading className="text-base font-semibold tracking-tight">{title}</Heading>

      {headline && (
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
          {headline}
        </p>
      )}

      {/* Sits closer to the title when there is no headline between them. */}
      <p className={cn('text-sm leading-relaxed text-ink-muted text-justify', headline ? 'mt-3' : 'mt-2')}>
        {description}
      </p>
    </motion.div>
  )
}

/**
 * The rounded, bordered square that holds a card's icon.
 *
 * Exported because it is a design primitive in its own right — anything that
 * needs the same 44px accent tile should use this rather than re-typing the
 * six classes that make it.
 */
export function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-panel-2 text-accent',
        className
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
  )
}
