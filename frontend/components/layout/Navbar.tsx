'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Mail } from 'lucide-react'
import { NAV_LINKS, PRIMARY_CTA, SECTION_IDS } from '@/lib/data/site'
import { scrollToSection, useActiveSection, useIsScrolled } from '@/lib/scroll'
import { cn } from '@/lib/utils'
import { Wordmark } from '@/components/ui/Wordmark'

/**
 * NAVBAR — the floating pill header.
 *
 * Links come from `NAV_LINKS` in `lib/data/site.ts`, which the footer also
 * reads. To add or reorder a nav item, edit that file — not this one.
 *
 * ─── BEHAVIOUR ──────────────────────────────────────────────────────────────
 *   - `useIsScrolled` swaps the bar from translucent to solid once the page moves.
 *   - `useActiveSection` highlights the link for the section in view.
 *   - `usePathname` detects if the user is on the dedicated `/deploy` route,
 *     seamlessly delegating hash navigation back to `/#section`.
 *   - Clicks are intercepted on the single-page home view so navigation scrolls
 *     smoothly with header offset applied instead of jumping.
 *
 * The sliding highlight behind the active link is a single element shared
 * between links via Framer Motion's `layoutId` — gliding smoothly between links.
 */
export const Navbar = () => {
  const isScrolled = useIsScrolled()
  const activeSection = useActiveSection(SECTION_IDS)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isDeployPage = pathname === '/deploy'

  /** Scrolls to a section and closes the mobile menu if it is open. */
  const handleNavigate = (event: React.MouseEvent, sectionId: string) => {
    setIsMobileMenuOpen(false)
    if (isDeployPage) {
      // Allow standard Next.js route navigation to home with hash anchor
      return
    }
    event.preventDefault()
    scrollToSection(sectionId)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border backdrop-blur-xl transition-all duration-300',
          'px-3 py-2 sm:px-4',
          'hover:-translate-y-1 hover:border-accent/50 hover:bg-panel/90 hover:shadow-[0_20px_50px_-16px_rgba(8,145,178,0.55)]',
          isScrolled
            ? 'border-line bg-panel/85 shadow-[0_12px_44px_-26px_rgba(8,145,178,0.75)]'
            : 'border-line/60 bg-panel/45'
        )}
      >
        {/* Brand — scrolls back to top or home */}
        <Link
          href="/#home"
          onClick={(event) => handleNavigate(event, 'home')}
          className="group flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-panel-2"
        >
          <Wordmark size="sm" />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = !isDeployPage && activeSection === link.id
            const href = isDeployPage ? `/#${link.id}` : `#${link.id}`

            return (
              <Link
                key={link.id}
                href={href}
                onClick={(event) => handleNavigate(event, link.id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5',
                  isActive
                    ? 'text-[var(--btn-ink)]'
                    : 'text-ink-muted hover:bg-accent-quiet hover:text-accent'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--btn-from)] to-[var(--btn-to)] shadow-[0_8px_25px_-8px_var(--btn-from)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* CTA — scrolls to the contact section; uses the same active pill as nav links */}
          {(() => {
            const isContactActive = !isDeployPage && activeSection === 'contact'
            return (
              <Link
                href={isDeployPage ? '/#contact' : '#contact'}
                onClick={(e) => !isDeployPage && handleNavigate(e, 'contact')}
                className={cn(
                  'relative hidden !px-5 !py-2.5 text-[13px] lg:inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5',
                  isContactActive
                    ? 'text-[var(--btn-ink)]'
                    : 'border border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                )}
              >
                {isContactActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--btn-from)] to-[var(--btn-to)] shadow-[0_8px_25px_-8px_var(--btn-from)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Mail className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">Let&#39;s Connect</span>
              </Link>
            )
          })()}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel text-ink-muted transition-colors hover:border-line-strong hover:text-accent lg:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="mx-auto mt-2 max-w-7xl rounded-3xl border border-line bg-panel/95 p-3 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={isDeployPage ? `/#${link.id}` : `#${link.id}`}
              onClick={(event) => handleNavigate(event, link.id)}
              className={cn(
                'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                !isDeployPage && activeSection === link.id
                  ? 'bg-gradient-to-r from-[var(--btn-from)] to-[var(--btn-to)] text-[var(--btn-ink)] shadow-[0_8px_25px_-8px_var(--btn-from)]'
                  : 'text-ink-muted hover:bg-panel-2 hover:text-ink'
              )}
            >
              {link.name}
            </Link>
          ))}

          {(() => {
            const isContactActive = !isDeployPage && activeSection === 'contact'
            return (
              <Link
                href={isDeployPage ? '/#contact' : '#contact'}
                onClick={(e) => { if (!isDeployPage) handleNavigate(e, 'contact'); setIsMobileMenuOpen(false); }}
                className={cn(
                  'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 mt-1',
                  isContactActive
                    ? 'bg-gradient-to-r from-[var(--btn-from)] to-[var(--btn-to)] text-[var(--btn-ink)] shadow-[0_8px_25px_-8px_var(--btn-from)]'
                    : 'text-ink-muted hover:bg-panel-2 hover:text-ink'
                )}
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Let&#39;s Connect
                </span>
              </Link>
            )
          })()}
        </div>
      )}
    </header>
  )
}