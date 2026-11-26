import type { Metadata } from 'next'
import { SEO_CONFIG } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'FABINS Deployment',
  description:
    'Submit RMG factory specifications and request a tailored deployment assessment for FABINS AI-powered fabric inspection automation.',
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/deploy`,
  },
  openGraph: {
    title: `Factory Assessment & Deployment Request | ${SEO_CONFIG.brandName}`,
    description:
      'Submit RMG factory specifications and request a tailored deployment assessment for FABINS AI-powered fabric inspection automation.',
    url: `${SEO_CONFIG.siteUrl}/deploy`,
    siteName: SEO_CONFIG.brandName,
    images: [
      {
        url: SEO_CONFIG.assets.machinePhoto,
        width: 1254,
        height: 1254,
        alt: 'FABINS Automation Machine Rig',
      },
    ],
  },
}

export default function DeployLayout({ children }: { children: React.ReactNode }) {
  return children
}
