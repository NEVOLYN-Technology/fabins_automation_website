import type { Metadata } from 'next'
import { adminSiteMetadata, buildAdminSchemaGraph } from '@/lib/seo/config'

export const metadata: Metadata = adminSiteMetadata

const adminSchemaGraph = buildAdminSchemaGraph()

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(adminSchemaGraph) }}
      />
      {children}
    </>
  )
}
