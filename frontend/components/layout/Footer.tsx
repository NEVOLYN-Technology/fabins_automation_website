'use client'

import Link from 'next/link'
import { ShieldCheck, Zap } from 'lucide-react'
import { SEO_CONFIG } from '@/lib/seo/config'
import { fabinsInnovators } from '@/lib/data/innovators'
import { scrollToSection } from '@/lib/scroll'
import { Wordmark } from '@/components/ui/Wordmark'

/**
 * FOOTER — brand summary, navigation, and the innovator list.
 *
 * Both lists are read from the data layer rather than written out here:
 *   - links   → `FOOTER_LINKS` in `lib/data/site.ts` (shared with the navbar)
 *   - people  → `fabinsInnovators` in `lib/data/innovators.ts` (shared with
 *               the innovators section)
 *
 * The people list previously duplicated the names and roles as literals, which
 * meant updating someone's title in the data file left the footer showing the
 * old one. Neither list should be hardcoded here again.
 */

export const Footer = () => {
  const handleNavigate = (event: React.MouseEvent, sectionId: string) => {
    event.preventDefault()
    scrollToSection(sectionId)
  }

  return (
    <footer className="border-t border-line bg-canvas-alt/60">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* ── Brand and summary ──────────────────────────────────────── */}
          <div className="md:col-span-5 flex flex-col items-start">
            <a
              href="#home"
              onClick={(event) => handleNavigate(event, 'home')}
              className="inline-flex items-center transition-opacity hover:opacity-80"
            >
              <Wordmark size="md" className="gap-3" />
            </a>

            <a
              href="https://nevolyn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 transition-colors hover:border-accent/40"
              title="NEVOLYN Technology"
            >
              <Zap className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-xs leading-tight">
                <span className="block text-ink-soft">Powered by</span>
                <span className="block font-semibold">Nevolyn Technology</span>
              </span>
            </a>
            <div className="mt-2 inline-flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-xs leading-tight">
                <span className="block font-semibold">Saturn Textiles Limited</span>
                <span className="block text-ink-soft">Research &amp; Development</span>
              </span>
            </div>

          </div>

          {/* ── Navigation ─────────────────────────────────────────────── */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Navigate
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/#about" className="text-ink-muted transition-colors hover:text-accent">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#system" className="text-ink-muted transition-colors hover:text-accent">
                  System
                </Link>
              </li>
              <li>
                <Link href="/#standards" className="text-ink-muted transition-colors hover:text-accent">
                  Standards
                </Link>
              </li>
              <li>
                <Link href="/#innovators" className="text-ink-muted transition-colors hover:text-accent">
                  Innovators
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Innovators ─────────────────────────────────────────────── */}
          <div className="md:col-span-4">
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Innovators
            </h4>
            <ul className="mt-5 space-y-4 text-sm">
              {fabinsInnovators.map((member) => (
                <li key={member.id}>
                  <a
                    href="#innovators"
                    onClick={(event) => handleNavigate(event, 'innovators')}
                    className="group block"
                  >
                    <span className="block font-medium transition-colors group-hover:text-accent">
                      {member.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-soft">{member.shortRole}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* FABINS social pills — one row below both names */}
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={SEO_CONFIG.social.fabinsLinkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FABINS on LinkedIn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0a66c2] bg-white hover:bg-[#0a66c2] hover:text-white border border-[#0a66c2]/30 transition-all duration-200 active:scale-95 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://www.facebook.com/fabinsautomation/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FABINS on Facebook"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1877f2] bg-white hover:bg-[#1877f2] hover:text-white border border-[#1877f2]/30 transition-all duration-200 active:scale-95 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-2 border-t border-line pt-4 text-xs text-ink-soft sm:flex-row">
          {/* Year is computed at render so the notice never goes stale. */}
          <p>© {new Date().getFullYear()} FABINS · NEVOLYN . All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Dhaka, Bangladesh</span>
          </p>
        </div>
      </div>
    </footer>
  )
}