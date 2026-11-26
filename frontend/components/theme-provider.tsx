'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * Client-component wrapper around `next-themes`.
 *
 * The wrapper exists purely to draw the server/client boundary. `layout.tsx` is
 * a server component and cannot render `NextThemesProvider` directly, because
 * that provider uses React context and effects. Marking this file `'use client'`
 * and re-exporting is the standard App Router workaround.
 *
 * Props are passed straight through — `attribute`, `defaultTheme` and the rest
 * are configured at the call site in `app/layout.tsx`, not here, so there is
 * only ever one place to look for the theme configuration.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
