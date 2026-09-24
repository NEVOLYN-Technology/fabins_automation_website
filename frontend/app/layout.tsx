import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

/**
 * ROOT LAYOUT — wraps every page, and the only place global CSS is imported.
 *
 * ─── SEO / SOCIAL METADATA ──────────────────────────────────────────────────
 * `metadata` below controls the browser tab title, the search-result snippet,
 * and the favicon. Next.js reads this export automatically; there is no
 * `<head>` element to edit.
 *
 * ─── ON THEMING ─────────────────────────────────────────────────────────────
 * The site is intentionally light-mode only. `forcedTheme="light"` pins it
 * there and `enableSystem={false}` stops the visitor's OS preference from
 * overriding it, so the design is identical for everyone.
 *
 * TO ENABLE DARK MODE LATER:
 *   1. Add a `.dark { … }` token block in `app/globals.css` alongside `:root`
 *      — every colour already resolves through those variables, so redefining
 *      them there is enough to re-skin the whole site.
 *   2. Remove `forcedTheme="light"` here and set `enableSystem` to `true`.
 *   3. Restore the dark logo in `components/ui/FabinsLogo.tsx` (see its notes).
 * Until then the provider has no visible effect — it is a placeholder for that
 * future switch, not something the current design depends on.
 */

export const metadata: Metadata = {
  title: 'FABINS — Future of Fabric Inspection', // auto-deploy test
  description:
    'AI-powered fabric defect detection: line-scan capture, millimetre measurement and automatic Four-Point inspection reports — a retrofit for the inspection frames mills already own.',
  icons: {
    icon: [
      { url: '/fabins-logo-light-mode.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/fabins-logo-light-mode.png',
    apple: '/fabins-logo-light-mode.png',
  },
}

/** Tints the mobile browser chrome to match `--canvas` in globals.css. */
export const viewport: Viewport = {
  themeColor: '#f4f6fa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning` is required by next-themes: it sets the theme
    // class on <html> before React hydrates, which would otherwise be reported
    // as a server/client mismatch.
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}