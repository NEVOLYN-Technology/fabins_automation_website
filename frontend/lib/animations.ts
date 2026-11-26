import type { Transition, Variants } from 'framer-motion'

/**
 * SCROLL ANIMATIONS — the shared entrance presets used across every section.
 *
 * Sections do not write their own Framer Motion config; they spread one of the
 * helpers below. That is what keeps the whole page moving with a single rhythm,
 * and means the site's motion can be retuned from this one file.
 *
 * ─── TYPICAL USE ────────────────────────────────────────────────────────────
 *   <motion.div {...fadeUpProps()}>…</motion.div>          // immediate
 *   <motion.div {...fadeUpProps(0.15)}>…</motion.div>      // 150ms later
 *
 * For a list, multiply by the index so the items cascade:
 *   items.map((item, i) => <motion.div key={item.id} {...fadeUpProps(i * 0.07)} />)
 *
 * ─── ACCESSIBILITY ──────────────────────────────────────────────────────────
 * These are transform and opacity animations, which are safe under
 * `prefers-reduced-motion` in a way that parallax or large motion would not be.
 * The CSS-driven marquee is disabled outright for those visitors — see the
 * media query at the bottom of `app/globals.css`.
 */

/**
 * Custom cubic-bezier: a quick start that overshoots slightly and settles.
 * Gives the entrance a bit of spring without the unpredictability of a real
 * spring simulation.
 */
const SMOOTH_POP: Transition['ease'] = [0.21, 0.47, 0.32, 0.98]

/**
 * When an element is considered "in view".
 *
 * `once: false` means animations replay every time an element scrolls back into
 * view, in both directions — a deliberate choice for this site, which is meant
 * to feel alive when a visitor scrolls back up. Set `once: true` if you would
 * rather each element animate a single time per page load.
 *
 * `amount: 0.05` triggers as soon as 5% of the element is visible, so tall
 * sections start animating as they enter rather than once mostly on screen.
 */
export const defaultViewport = { once: true, amount: 0.05 } as const

/**
 * Variants for a parent that should cascade its children.
 *
 * Use with `fadeInUpVariants` on the children: the parent orchestrates the
 * timing and each child animates itself.
 *
 * @param staggerChildren - Gap between consecutive children, in seconds.
 * @param delayChildren   - Pause before the first child starts, in seconds.
 */
export function staggerContainer(staggerChildren = 0.1, delayChildren = 0.2): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren, delayChildren },
    },
  }
}

/** Child variant to pair with `staggerContainer`. Rises and scales into place. */
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: SMOOTH_POP },
  },
}

/**
 * The workhorse preset: fades and rises into place on scroll.
 *
 * Returns a complete set of `motion` props, so it is spread rather than called
 * as a hook: `<motion.div {...fadeUpProps(0.2)} />`.
 *
 * @param delay    - Seconds to wait before starting. Stagger a group by passing
 *                   the item's index multiplied by a small step.
 * @param duration - Seconds the animation runs for.
 */
export function fadeUpProps(delay = 0, duration = 0.55) {
  return {
    initial: { opacity: 0, y: 36, scale: 0.97 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: defaultViewport,
    transition: { duration, delay, ease: SMOOTH_POP },
  }
}

/** As `fadeUpProps`, but enters from the left. For side-by-side layouts. */
export function fadeLeftProps(delay = 0, duration = 0.55) {
  return {
    initial: { opacity: 0, x: -36, scale: 0.97 },
    whileInView: { opacity: 1, x: 0, scale: 1 },
    viewport: defaultViewport,
    transition: { duration, delay, ease: SMOOTH_POP },
  }
}