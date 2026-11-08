import type { Metadata } from 'next'
import { adminSiteMetadata } from '@/lib/seo/config'

export const metadata: Metadata = adminSiteMetadata

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
