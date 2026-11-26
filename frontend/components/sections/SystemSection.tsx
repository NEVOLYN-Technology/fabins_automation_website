'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Camera, Sliders, Sun, Monitor, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FABINS_SYSTEM_DATA, type HardwarePillarId } from '@/lib/data/fabins-system'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { InfoCard } from '@/components/ui/InfoCard'
import { fadeUpProps } from '@/lib/animations'
import { cn } from '@/lib/utils'

/**
 * SYSTEM SECTION — the inspection pipeline carousel plus the hardware cards.
 *
 * Content: `pipelineSteps` and `hardwarePillars` in `lib/data/fabins-system.ts`.
 *
 * ─── HOW THE CAROUSEL WORKS ─────────────────────────────────────────────────
 * There is no carousel library. The track is a plain horizontally-scrolling
 * flex row using native CSS scroll snapping, which means it responds to touch,
 * trackpad, and scrollbar dragging for free. On top of that:
 *
 *   - `handleScroll` measures which card is nearest the container's centre and
 *     stores its index in `centeredIndex`. That index drives the "focused" card
 *     styling and the active navigation dot.
 *   - `scrollToCard` does the reverse: given an index, it scrolls that card to
 *     the centre. The arrows and the dots both call it.
 *
 * The huge horizontal padding on the track (`px-[calc(50%-160px)]`) is what
 * lets the first and last cards reach the centre of the viewport — without it
 * they would stop at the container edge. Those pixel values are half the card
 * width at each breakpoint, so if you change a card width, change the padding
 * to match.
 */

/**
 * Icon for each hardware pillar, keyed by the pillar's `id`.
 *
 * Typed as `Record<HardwarePillarId, LucideIcon>`, so adding a pillar to the
 * data file will not compile until an icon is added here. Previously this was a
 * plain array matched by position, where reordering the data silently gave
 * every card the wrong icon.
 */
const PILLAR_ICONS: Record<HardwarePillarId, LucideIcon> = {
  camera: Camera,
  encoder: Sliders,
  lighting: Sun,
  software: Monitor,
}

export const SystemSection = () => {
  /** Index of the card currently nearest the centre of the track. */
  const [centeredIndex, setCenteredIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const steps = FABINS_SYSTEM_DATA.pipelineSteps

  /** Finds the card closest to the container's horizontal centre. */
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    window.requestAnimationFrame(() => {
      const containerCenter = container.scrollLeft + container.clientWidth / 2

      let minDistance = Infinity
      let closestIndex = 0

      container.querySelectorAll<HTMLElement>('[data-card-index]').forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const distance = Math.abs(containerCenter - cardCenter)

        if (distance < minDistance) {
          minDistance = distance
          closestIndex = Number(card.getAttribute('data-card-index'))
        }
      })

      setCenteredIndex((prev) => (prev !== closestIndex ? closestIndex : prev))
    })
  }, [])

  /** Scrolls the card at `index` to the centre of the track. */
  const scrollToCard = useCallback((index: number) => {
    const container = scrollContainerRef.current
    if (!container) return

    const targetCard = container.querySelectorAll<HTMLElement>('[data-card-index]')[index]
    if (!targetCard) return

    // Offset by half the container minus half the card so the card lands centred.
    const targetLeft = targetCard.offsetLeft - container.clientWidth / 2 + targetCard.offsetWidth / 2
    container.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Set the initial centred card before any scrolling happens.

    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Guards against an out-of-range index if the step list shrinks at runtime.
  const activeIndex = Math.min(Math.max(0, centeredIndex), Math.max(0, steps.length - 1))

  // Both arrows wrap around, so the carousel has no dead end.
  const handlePrev = () => scrollToCard(activeIndex > 0 ? activeIndex - 1 : steps.length - 1)
  const handleNext = () => scrollToCard(activeIndex < steps.length - 1 ? activeIndex + 1 : 0)

  return (
    <Section id="system" className="overflow-hidden bg-canvas-alt/60">
      <SectionHeader
        layout="split"
        eyebrow="The system"
        title={
          <>
            FROM ROLLING FABRIC
            <br />
            TO INSTANT REPORT.
          </>
        }
        description="Synchronized with real fabric motion to deliver millimeter-accurate defect detection at full production speed."
      />

      <motion.div {...fadeUpProps(0.25)} className="relative w-full py-4">
        {/* Arrow controls. Hidden entirely when there is nothing to scroll. */}
        {steps.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous step"
              className="group absolute left-2 top-1/2 z-40 -translate-y-1/2 cursor-pointer rounded-full border border-line bg-panel/90 p-3 text-ink-muted shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent active:scale-95 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next step"
              className="group absolute right-2 top-1/2 z-40 -translate-y-1/2 cursor-pointer rounded-full border border-line bg-panel/90 p-3 text-ink-muted shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent active:scale-95 sm:right-4"
            >
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}

        {/*
          The scroll track.
          - `scrollbarWidth`/`msOverflowStyle` hide the scrollbar in Firefox
            and legacy Edge; the arrows and dots are the intended controls.
          - The `px-[calc(50%-…)]` padding lets the end cards reach the centre.
        */}
        <div
          ref={scrollContainerRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex snap-x snap-mandatory select-none gap-6 overflow-x-auto scroll-smooth px-[calc(50%-160px)] py-6 sm:px-[calc(50%-220px)] lg:px-[calc(50%-240px)]"
        >
          {steps.map((step, index) => {
            const isCentered = index === activeIndex

            return (
              <div
                key={step.stepNumber}
                // Read back by `handleScroll` to identify this card's position.
                data-card-index={index}
                onClick={() => scrollToCard(index)}
                className={cn(
                  'w-[300px] shrink-0 snap-center sm:w-[420px] lg:w-[460px]',
                  // The 1.5px padding is the card's gradient border: the inner
                  // panel sits on top and leaves this edge showing.
                  'group transform cursor-pointer rounded-[28px] p-[1.5px] transition-all duration-500 ease-out',
                  isCentered
                    ? // Focused: lifted, enlarged, sharp, glowing accent border.
                      'z-20 -translate-y-3 scale-105 bg-gradient-to-b from-accent/80 via-accent-bright/50 to-blue-600/30 opacity-100 shadow-[0_20px_50px_rgba(8,145,178,0.35),0_0_25px_rgba(8,145,178,0.2)]'
                    : // Resting: dropped back, faded and slightly blurred, sharpening on hover.
                      'z-10 translate-y-2 scale-95 bg-line/40 opacity-60 shadow-lg sm:filter sm:blur-[1.5px] hover:opacity-90 hover:blur-0'
                )}
              >
                <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[26px] bg-panel p-6 sm:p-7">
                  {/* Accent beam across the top edge of the card. */}
                  <div
                    className={cn(
                      'absolute left-0 right-0 top-0 h-1.5 rounded-t-3xl transition-all duration-500',
                      isCentered
                        ? 'bg-gradient-to-r from-accent via-accent-bright to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                        : 'bg-line'
                    )}
                  />

                  <div>
                    <div className="mb-5 flex items-center justify-between gap-2 pt-1">
                      <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-quiet px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        {/* padStart gives "Step 01" rather than "Step 1". */}
                        <span>Step {String(step.stepNumber).padStart(2, '0')}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                        Phase {step.stepNumber} of {steps.length}
                      </span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                      {step.title}
                    </h3>

                    {/* min-height keeps every card the same height regardless of copy length. */}
                    <p className="min-h-[48px] text-sm font-normal leading-relaxed text-ink-muted text-justify">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-6 font-mono text-xs text-ink-soft">
                    <span>FABINS Inspection Pipeline</span>
                    <span className="font-semibold text-accent">
                      {String(step.stepNumber).padStart(2, '0')} /{' '}
                      {String(steps.length).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation dots — the active one stretches into a pill. */}
        {steps.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.stepNumber}
                onClick={() => scrollToCard(index)}
                aria-label={`Go to step ${index + 1}`}
                className={cn(
                  'h-2.5 cursor-pointer rounded-full transition-all duration-300 hover:scale-125',
                  index === activeIndex
                    ? 'w-8 bg-gradient-to-r from-accent to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                    : 'w-2.5 bg-line-strong hover:bg-accent/60'
                )}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Hardware pillars ─────────────────────────────────────────────── */}
      <div className="mt-20">
        <motion.h3
          {...fadeUpProps(0.05)}
          className="text-[11px] min-[360px]:text-xs sm:text-sm font-semibold uppercase tracking-[0.05em] sm:tracking-[0.16em] text-ink-soft whitespace-nowrap"
        >
          Built on catalogue industrial hardware
        </motion.h3>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FABINS_SYSTEM_DATA.hardwarePillars.map((pillar, index) => (
            <InfoCard
              key={pillar.id}
              icon={PILLAR_ICONS[pillar.id]}
              title={pillar.title}
              headline={pillar.headline}
              spec={pillar.spec}
              description={pillar.description}
              // h4 because these sit under the "Built on…" h3 above.
              as="h4"
              delay={index * 0.07}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}
