/**
 * MARQUEE STRIP — the continuously scrolling capability ticker under the hero.
 *
 * ─── HOW THE SEAMLESS LOOP WORKS ────────────────────────────────────────────
 * The item list is rendered twice, back to back, inside a track that is twice
 * the visible width. The `marquee` animation in `app/globals.css` slides that
 * track left by exactly 50% — the width of one full copy — and then snaps back
 * to the start. Because the second copy is pixel-identical to the first, the
 * reset is invisible and the strip appears to scroll forever.
 *
 * This is why the list is duplicated rather than repeated three or four times:
 * the trick only works with exactly two copies and a -50% translation. If you
 * change one, you must change the other.
 *
 * ─── TO EDIT THE ITEMS ──────────────────────────────────────────────────────
 * Change `ITEMS` below. The duplicate copy is generated, so add or remove
 * entries freely. To change the speed, edit the `38s` duration on
 * `.marquee-track` in `app/globals.css`.
 *
 * Motion is disabled automatically for visitors who have asked their operating
 * system to reduce motion — see the `prefers-reduced-motion` rule in globals.css.
 */

const ITEMS = [
  'AI defect detection',
  'Millimetre measurement',
  'Four-Point scoring',
  'Automatic reports',
  'Encoder-locked capture',
  'Retrofit installation',
]

export const MarqueeStrip = () => (
  // `.marquee` on the wrapper is what lets the CSS pause the animation on hover.
  <div className="marquee relative overflow-hidden border-y border-line bg-panel/60 py-5 backdrop-blur-sm">
    <div className="marquee-track flex w-max items-center gap-10">
      {[0, 1].map((copyIndex) => (
        <div
          key={copyIndex}
          className="flex shrink-0 items-center gap-10"
          // The second copy is purely visual filler; hide it from screen readers
          // so the list is not announced twice.
          aria-hidden={copyIndex === 1}
        >
          {ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-10">
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-ink-muted">
                {item}
              </span>
              {/* Accent dot separating each item from the next. */}
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
          ))}
        </div>
      ))}
    </div>

    {/* Gradient masks so items fade out at the edges instead of clipping. */}
    <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent" />
  </div>
)