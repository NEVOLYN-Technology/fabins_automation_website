'use client'

import { Mail, MapPin, Phone, ShieldCheck, Zap } from 'lucide-react'
import { SEO_CONFIG } from '@/lib/seo/config'
import { scrollToSection } from '@/lib/scroll'
import { Wordmark } from '@/components/ui/Wordmark'
import { FabinsLogo } from '@/components/ui/FabinsLogo'

/**
 * FOOTER — brand summary, partner badges, contact info, and social links.
 */
export const Footer = () => {
  const handleNavigate = (event: React.MouseEvent, sectionId: string) => {
    event.preventDefault()
    scrollToSection(sectionId)
  }

  return (
    <footer className="border-t border-line bg-canvas-alt/60">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* ── Col 1: FABINS (Enlarged Logo + Text & Socials) ─────────── */}
          <div className="flex items-center gap-3.5 w-full md:w-auto lg:shrink-0">
            <a
              href="#home"
              onClick={(event) => handleNavigate(event, 'home')}
              className="shrink-0 transition-opacity hover:opacity-80"
            >
              <FabinsLogo className="h-[76px] sm:h-[84px] lg:h-[88px] w-auto" />
            </a>
            <div className="flex flex-col justify-between self-stretch py-0.5">
              <a
                href="#home"
                onClick={(event) => handleNavigate(event, 'home')}
                className="transition-opacity hover:opacity-80"
              >
                <span className="flex flex-col justify-center leading-none">
                  <span className="block font-extrabold tracking-[-0.02em] text-xl">
                    FAB<span className="text-accent">INS</span>
                  </span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                    Fabric Inspection Automation
                  </span>
                </span>
              </a>

              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                <a
                  href={SEO_CONFIG.social.fabinsLinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="FABINS on LinkedIn"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0a66c2] bg-white hover:bg-[#0a66c2] hover:text-white border border-[#0a66c2]/30 transition-all duration-200 active:scale-95 shadow-xs shrink-0"
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
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1877f2] bg-white hover:bg-[#1877f2] hover:text-white border border-[#1877f2]/30 transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Col 2: Partner Boxes (Nevolyn & Saturn Individual Boxes) ─ */}
          <div className="flex flex-col gap-2.5 w-full md:w-auto lg:shrink-0">
            {/* Nevolyn Box */}
            <div className="flex items-center justify-between gap-3 sm:gap-3.5 w-full rounded-2xl border border-line bg-panel px-3.5 py-2 min-h-[48px] shadow-xs transition-colors hover:border-line-strong">
              <a
                href="https://nevolyn.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-accent group shrink-0"
                title="NEVOLYN Technology"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="h-4 w-4 shrink-0 text-accent" />
                </div>
                <span className="text-xs leading-tight">
                  <span className="block text-ink-soft">Powered by</span>
                  <span className="block font-semibold text-ink group-hover:text-accent transition-colors">Nevolyn Technology</span>
                </span>
              </a>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <a
                  href="https://www.linkedin.com/company/nevolyn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NEVOLYN Technology on LinkedIn"
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#0a66c2] bg-white hover:bg-[#0a66c2] hover:text-white border border-[#0a66c2]/30 transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="hidden lg:inline">LinkedIn</span>
                </a>
                <a
                  href="https://www.facebook.com/nevolyn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NEVOLYN Technology on Facebook"
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#1877f2] bg-white hover:bg-[#1877f2] hover:text-white border border-[#1877f2]/30 transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="hidden lg:inline">Facebook</span>
                </a>
              </div>
            </div>

            {/* Saturn Box */}
            <div className="flex items-center justify-between gap-3 sm:gap-3.5 w-full rounded-2xl border border-line bg-panel px-3.5 py-2 min-h-[48px] shadow-xs transition-colors hover:border-line-strong">
              <div
                className="inline-flex items-center gap-2.5 shrink-0"
                title="Saturn Textiles Limited"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                </div>
                <span className="text-xs leading-tight">
                  <span className="block text-ink-soft">Sponsored by</span>
                  <span className="block font-semibold text-ink">Saturn Textiles Limited</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <a
                  href="https://www.linkedin.com/company/saturn-rnd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Saturn R&D on LinkedIn"
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#0a66c2] bg-white hover:bg-[#0a66c2] hover:text-white border border-[#0a66c2]/30 transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="hidden lg:inline">LinkedIn</span>
                </a>
                <a
                  href="https://www.facebook.com/saturntextileslimited"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Saturn Textiles Limited on Facebook"
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#1877f2] bg-white hover:bg-[#1877f2] hover:text-white border border-[#1877f2]/30 transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="hidden lg:inline">Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Col 3: Contact Info ───────────────────────────────────── */}
          <div className="w-full md:col-span-2 lg:col-span-1 lg:w-auto lg:shrink-0 space-y-2 pt-3 md:pt-4 lg:pt-0 border-t border-line/60 md:border-t lg:border-t-0">
            <h4 className="font-bold text-xs uppercase tracking-[0.16em] text-ink">
              Contact
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-3 lg:flex lg:flex-col gap-2.5 text-xs sm:text-sm text-ink-muted">
              {/* Address */}
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                <a
                  href="https://maps.app.goo.gl/TNcbozMxhhjg29gP8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                  aria-label="Location Map Link"
                >
                  13/2, Abdus Sattar Master Road, Tongi, Gazipur
                </a>
              </li>

              {/* Phone numbers */}
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-sky-500" />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <a
                    href="tel:+8801679248064"
                    aria-label="Call +880 1679-248064"
                    className="hover:text-accent transition-colors"
                  >
                    +880 1679-248064
                  </a>
                  <span className="text-line-strong">•</span>
                  <a
                    href="tel:+8801939444451"
                    aria-label="Call +880 1939-444451"
                    className="hover:text-accent transition-colors"
                  >
                    +880 1939-444451
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-rose-500" />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <a
                    href="mailto:fabins@nevolyn.com"
                    aria-label="Email fabins@nevolyn.com"
                    className="hover:text-accent transition-colors"
                  >
                    fabins@nevolyn.com
                  </a>
                  <span className="text-line-strong">•</span>
                  <a
                    href="mailto:info@nevolyn.com"
                    aria-label="Email info@nevolyn.com"
                    className="hover:text-accent transition-colors"
                  >
                    info@nevolyn.com
                  </a>
                </div>
              </li>
            </ul>
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