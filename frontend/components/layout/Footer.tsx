'use client'

import Link from 'next/link'
import { ShieldCheck, Zap } from 'lucide-react'
import { FOOTER_LINKS } from '@/lib/data/site'
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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
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
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-xs text-ink-soft sm:flex-row">
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