import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { rootSiteMetadata, buildSchemaGraph, SEO_CONFIG } from '@/lib/seo/config'
import './globals.css'

/**
 * ROOT LAYOUT — wraps every page, and the only place global CSS is imported.
 *
 * ─── SEO / SOCIAL METADATA ──────────────────────────────────────────────────
 * Root metadata and Schema.org structured data are managed centrally in
 * `@/lib/seo/config.ts`.
 */

export const metadata: Metadata = {
  ...rootSiteMetadata,
  title: SEO_CONFIG.title,
  description: SEO_CONFIG.description,
  alternates: {
    canonical: 'https://fabins.nevolyn.com/',
  },
  openGraph: rootSiteMetadata.openGraph,
  verification: {
    google: 'vzbTJSa6lso2s74DPf_itEshA7SPnSNE2As5Jg4N2iM',
  },
}

const schemaGraph = buildSchemaGraph()

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
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