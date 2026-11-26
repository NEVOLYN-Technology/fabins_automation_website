import React from 'react'

/**
 * FABINS brand mark.
 *
 * Rendered in the navbar and the footer. Sizing is entirely caller-controlled
 * via `className`, which is why no width/height is set here.
 *
 * ─── ON THE LOGO FILES IN `public/` ─────────────────────────────────────────
 * The site is light-mode only (see the note at the top of `app/globals.css`),
 * so this renders exactly one asset: `fabins-logo-light-mode.png`. The other
 * two files in `public/` — `fabins-logo-dark-mode.png` and `fabins-logo.png` —
 * are currently unused. If dark mode is ever added, swap them in here with a
 * pair of `<img>` elements hidden and shown by CSS (`hidden dark:block`) rather
 * than by JavaScript, so the correct mark is present on first paint and the
 * logo does not flash on hydration.
 */

interface FabinsLogoProps {
  /** Tailwind sizing classes. Must set both a width and a height. */
  className?: string
  /** Override only when the surrounding text already names the brand. */
  alt?: string
}

export const FabinsLogo: React.FC<FabinsLogoProps> = ({
  className = 'h-14 w-auto',
  alt = 'FABINS — Fabric Inspection Automation',
}) => (
  <span className="relative inline-flex shrink-0 items-center">
    {/* eslint-disable-next-line @next/next/no-img-element -- see note in README on image optimisation */}
    <img
      src="/fabins-logo-light-mode.png"
      alt={alt}
      className={`block object-contain ${className}`}
    />
  </span>
)