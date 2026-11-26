import { Navbar } from './Navbar'
import { Footer } from './Footer'

/**
 * PAGE SHELL — the frame every page renders inside: navbar, content, footer,
 * and the ambient background.
 *
 * ─── THE BACKGROUND LAYERS ──────────────────────────────────────────────────
 * Three fixed, non-interactive layers sit behind the content at `-z-10`: a
 * faint engineering grid and two large blurred colour washes. They are `fixed`
 * rather than `absolute` so they stay put while the page scrolls, and
 * `pointer-events-none` so they never intercept a click. `aria-hidden` keeps
 * them out of the accessibility tree — they are pure decoration.
 *
 * ─── THE `pt-24` ON `<main>` ────────────────────────────────────────────────
 * The navbar is `fixed`, so it is out of the document flow and the content
 * would otherwise start underneath it. This padding reserves that space and
 * must stay in step with `HEADER_OFFSET_PX` in `lib/scroll.ts` and
 * `scroll-padding-top` in `app/globals.css` — all three describe the same gap.
 */

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-canvas text-ink">
      {/* Engineering grid. Pattern is defined by `.grid-bg` in globals.css. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-70" />

      {/* Cyan wash behind the hero with lightweight radial gradient (zero GPU blur overhead for mobile 60/120fps) */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-a) 0%, transparent 70%)' }}
      />

      {/* Blue wash anchored to the bottom-right corner */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[380px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-b) 0%, transparent 70%)' }}
      />

      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  )
}