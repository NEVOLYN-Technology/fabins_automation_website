'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, Ruler, Award, Globe } from 'lucide-react'
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

            <div className="flex items-center justify-between gap-1 sm:justify-start sm:gap-2.5 pt-1 w-full max-w-full">
              <span className="flex-1 sm:flex-none inline-flex items-center justify-center gap-0.5 sm:gap-2 rounded-full border border-line bg-panel-2/90 px-1 py-1 sm:px-3.5 sm:py-1.5 text-[7.5px] min-[375px]:text-[8px] min-[410px]:text-[9px] sm:text-xs font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-md tracking-tighter sm:tracking-tight whitespace-nowrap">
                <span className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-cyan-500 animate-pulse shrink-0" />
                <span>Detects every <span className="text-accent font-bold">defect</span></span>
              </span>
              <span className="flex-1 sm:flex-none inline-flex items-center justify-center gap-0.5 sm:gap-2 rounded-full border border-line bg-panel-2/90 px-1 py-1 sm:px-3.5 sm:py-1.5 text-[7.5px] min-[375px]:text-[8px] min-[410px]:text-[9px] sm:text-xs font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-md tracking-tighter sm:tracking-tight whitespace-nowrap">
                <span className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span>Measures roll <span className="text-accent font-bold">dimensions</span></span>
              </span>
              <span className="flex-1 sm:flex-none inline-flex items-center justify-center gap-0.5 sm:gap-2 rounded-full border border-line bg-panel-2/90 px-1 py-1 sm:px-3.5 sm:py-1.5 text-[7.5px] min-[375px]:text-[8px] min-[410px]:text-[9px] sm:text-xs font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-md tracking-tighter sm:tracking-tight whitespace-nowrap">
                <span className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Certifies fabric <span className="text-accent font-bold">quality</span></span>
              </span>
            </div>
          </motion.div>

          {/* Action buttons: social links + Deploy FABINS */}
          <motion.div {...fadeUpProps(0.24)} className="mt-8 sm:mt-9 flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/fabinsautomation/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FABINS on LinkedIn"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#0a66c2] bg-white hover:bg-[#0a66c2] hover:text-white border border-[#0a66c2]/30 transition-all duration-200 active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              LinkedIn
            </a>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/fabinsautomation/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FABINS on Facebook"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#1877f2] bg-white hover:bg-[#1877f2] hover:text-white border border-[#1877f2]/30 transition-all duration-200 active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
            {/* divider */}
            <span className="h-5 sm:h-6 w-px bg-slate-300 shrink-0" aria-hidden="true" />
            <Link
              href="/deploy"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ease-out active:scale-95 bg-white text-accent border border-accent/30 hover:bg-accent hover:text-white hover:border-accent hover:shadow-[0_10px_30px_-12px_var(--btn-from)] hover:-translate-y-0.5 shadow-sm shrink-0 whitespace-nowrap"
            >
              Deploy FABINS
            </Link>
          </motion.div>

          <motion.p {...fadeUpProps(0.3)} className="mt-6 sm:mt-7 flex items-center gap-2 text-xs sm:text-sm text-ink-soft">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
            Automate Fabric Inspection with FABINS.
          </motion.p>

          <motion.div {...fadeUpProps(0.4)} className="mt-3.5 sm:mt-4 flex items-center gap-1 sm:gap-2.5 w-full max-w-full">
            {/* Nevolyn — signature teal brand link matching "INS" */}
            <a
              href="https://nevolyn.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit NEVOLYN Technology"
              className="group inline-flex items-center gap-1 sm:gap-2 rounded-full border border-accent/30 bg-white px-2 py-1 min-[375px]:px-2.5 min-[375px]:py-1.5 sm:px-4 sm:py-2 text-[8.5px] min-[375px]:text-[9.5px] sm:text-sm font-semibold text-accent shadow-sm transition-all duration-200 hover:bg-accent hover:text-white hover:border-accent hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-accent group-hover:text-white transition-colors shrink-0" />
              <span>A Nevolyn Product</span>
            </a>
            <span className="text-[10px] sm:text-sm text-ink-soft/40 shrink-0">·</span>
            {/* Saturn — amber static badge */}
            <span className="inline-flex items-center gap-1 sm:gap-2 rounded-full border border-amber-300/70 bg-white px-2 py-1 min-[375px]:px-2.5 min-[375px]:py-1.5 sm:px-4 sm:py-2 text-[8.5px] min-[375px]:text-[9.5px] sm:text-sm font-medium text-amber-700 shadow-sm shrink-0 whitespace-nowrap">
              <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
              <span>Sponsored by Saturn Textiles Limited</span>
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