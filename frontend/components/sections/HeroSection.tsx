'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, Ruler, Award, Zap } from 'lucide-react'
import { fadeUpProps } from '@/lib/animations'

/**
 * HERO SECTION — the opening screen: product name, promise, and machine photo.
 *
 * This is the only section whose copy is written inline rather than read from
 * `lib/data/`. That is deliberate: the hero is a one-off with bespoke typography
 * and a hand-tuned animation cascade, so there is nothing to gain from moving
 * six strings into a data file that only this component would ever read.
 *
 * It also does not use `SectionHeader`, because it renders an `<h1>` (there is
 * exactly one per page) with a two-tier title and its own entrance timing.
 *
 * ─── ON THE ANIMATION DELAYS ────────────────────────────────────────────────
 * The delays below (0.05 → 0.30) stagger the entrance top to bottom. Keep them
 * ascending in source order; the machine photo at 0.20 is timed to land while
 * the copy is still arriving.
 */

export const HeroSection = () => (
  <section id="home" className="relative overflow-hidden pb-20 pt-10 sm:pt-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
        {/* ── Left: headline and calls to action ─────────────────────────── */}
        <div className="lg:col-span-6">
          <motion.span {...fadeUpProps(0.05)} className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
            Future of Fabric Inspection
          </motion.span>

          <motion.h1 {...fadeUpProps(0.12)} className="display mt-4 text-[clamp(2.6rem,6.2vw,4.6rem)]">
            FAB<span className="text-accent">INS</span>
            {/* Subtitle sits inside the h1 so it is part of the page's one heading. */}
            <span className="mt-2 block text-[clamp(1.5rem,3.4vw,2.5rem)] font-bold tracking-normal text-ink-muted">
              Fabric Inspection Automation
            </span>
          </motion.h1>

          {/* Wonderful 3-Pillar Tagline Component */}
          <motion.div {...fadeUpProps(0.18)} className="mt-6 space-y-4">

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-2/90 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-md">
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                Detects every <span className="text-accent font-bold">defect</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-2/90 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-md">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Measures roll <span className="text-accent font-bold">dimensions</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-2/90 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-md">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Certifies fabric <span className="text-accent font-bold">quality</span>
              </span>
            </div>
          </motion.div>

          {/* Action buttons: See how it works scrolls to #system, Deploy FABINS links to /deploy */}
          <motion.div {...fadeUpProps(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#system" className="btn btn-primary">
              See how it works
            </a>
            <Link href="/deploy" className="btn btn-primary">
              Deploy FABINS
            </Link>
          </motion.div>

          <motion.p {...fadeUpProps(0.3)} className="mt-7 flex items-start gap-2 text-sm text-ink-soft">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            Automate Fabric Inspection with FABINS.
          </motion.p>

          <motion.div {...fadeUpProps(0.4)} className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href="https://nevolyn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-accent transition-colors hover:bg-accent/20"
              title="NEVOLYN Technology"
            >
              <Zap className="h-3 w-3" />
              A Nevolyn Product
            </a>
            <span className="text-xs text-ink-soft/40">·</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-accent">
              <ShieldCheck className="h-3 w-3" />
              Sponsored by Saturn Textiles Limited
            </span>
          </motion.div>
        </div>

        {/* ── Right: machine photograph ──────────────────────────────────── */}
        <motion.div {...fadeUpProps(0.2)} className="relative lg:col-span-6 flex justify-center lg:justify-center">
          <div className="relative w-full max-w-[420px] sm:max-w-[450px] overflow-hidden rounded-[1.75rem] border border-line bg-panel-2 shadow-[var(--shadow-lift)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- see note in README on image optimisation */}
            <img
              src="/fabins-machine.png"
              className="max-h-[380px] w-full object-cover object-center"
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
)