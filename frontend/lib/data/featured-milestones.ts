/**
 * Featured Milestones Data Store — NEVOLYN Technology & FABINS.
 *
 * Single source of truth for the 4 major high-impact institutional announcements and prototype milestones.
 * Rendered in the 3D horizontal carousel within `LatestNewsSection.tsx`.
 *
 * Chronological order (latest first):
 * 1. Bangladesh Innovation Fair 2026 — Award / Prize (2026-09-14)
 * 2. Bangladesh Innovation Fair 2026 — Top 50 / Selection (2026-09-10)
 * 3. Strategic Partnership with Saturn R&D (2026-07-01)
 * 4. First POC Demonstration at Saturn (2026-06-28)
 *
 * @module lib/data/featured-milestones
 */

export interface FeaturedMilestone {
  /** Unique identifier — used as React list key and anchor link. */
  id: string
  /** Headline title of the milestone. */
  title: string
  /** High-impact 1-2 sentence summary for preview card. */
  description: string
  /** Full announcement text for detail modal. */
  content: string
  /** Category tag classification. */
  category: string
  /** ISO publication date string (YYYY-MM-DD). */
  date: string
  /** Specific path to image asset in `/public`. */
  image: string
  /** Direct link to LinkedIn post or company page. */
  linkedinUrl: string
  /** Direct link to Facebook post or page. */
  facebookUrl: string
}

/**
 * Exactly 4 Featured Milestones ordered latest-to-earliest with distinct authentic images from `/public`.
 */
export const featuredMilestones: FeaturedMilestone[] = [
  {
    id: 'milestone-fair-award',
    title: 'Bangladesh Innovation Fair 2026 — Award & Prize Recognition',
    description:
      'FABINS was selected among the Top 50 Innovations out of 950+ innovations and celebrated at the official award-giving ceremony with prize recognition.',
    content:
      'A Proud Milestone for NEVOLYN & FABINS - Fabric Inspection Automation\n\nWe are proud to share that FABINS has been selected among the Top 50 Innovations out of 950+ innovations at the Bangladesh Innovation Fair 2026.\n\nFABINS has been showcased at the fair, and being recognized among the Top 50 innovations is a truly meaningful achievement for our team.\n\nThe Top 50 recognition was celebrated through an award-giving ceremony, marking another important step in our journey from innovation and prototype development toward real-world impact.\n\nWe are grateful for this recognition and proud to represent Bangladeshi innovation, AI, and automation through FABINS.\n\nInnovation Hub | Bangladesh Innovation Fair 2026\nTop 50 Innovations / 950+ Innovations\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Award & Prize',
    date: '2026-09-14',
    image: '/news_fabinsXfair02.jpg',
    linkedinUrl: 'https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-bangladeshinnovationfair2026-activity-7508553026446512128-zo3h',
    facebookUrl: 'https://www.facebook.com/fabinsautomation/',
  },
  {
    id: 'milestone-fair-selection',
    title: 'Bangladesh Innovation Fair 2026 — Top 50 Selection',
    description:
      'FABINS was selected among the Top 50 innovations out of 950+ submissions to showcase at the national innovation platform at Novo Theatre, Dhaka.',
    content:
      'We are honored to share that FABINS Automation has been selected to showcase at the Bangladesh Innovation Fair 2026 - a national platform for innovation organized under the ICT Division and Science Ministry.\n\nBeing selected for this national platform is a meaningful milestone for our team. We’re proud to represent Bangladeshi innovation through FABINS and take another step toward turning our technology into real-world impact.\n\n📍 Location: Novo Theatre, Dhaka\n📅 Dates: 12–14 September 2026\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Top 50 Selection',
    date: '2026-09-10',
    image: '/news_fabinsXfair01.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/fabinsautomation/',
  },
  {
    id: 'milestone-saturn-partnership',
    title: 'Strategic Partnership with Saturn R&D',
    description:
      'FABINS officially established a strategic partnership with Saturn R&D as our first client and collaborator to advance from prototype to production.',
    content:
      'A New Chapter for FABINS & NEVOLYN Technology\n\nWe are proud to announce our official strategic partnership with Saturn R&D marking an important milestone in the journey of FABINS.\n\nSaturn Textiles and Saturn R&D is not only our first client and collaborator, but also a key partner in helping us take FABINS from a working prototype toward a real-world industrial solution. Their support has given us the opportunity to continue building, testing, and improving our technology.\n\nWe are truly grateful to the Saturn Textiles Limited team for believing in our vision and supporting us from the early stage of this journey.\n\nWe are looking forward to building smarter solutions for the textile industry and creating real-world impact through AI, computer vision, and automation.\n\nFABINS — Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Strategic Partnership',
    date: '2026-07-01',
    image: '/news_fabinsXsaturn.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/nevolyn/',
  },
  {
    id: 'milestone-saturn-poc',
    title: 'First POC Demonstration at Saturn',
    description:
      'FABINS successfully completed and demonstrated its first Proof of Concept (POC) as a working industrial fabric inspection system at Saturn.',
    content:
      'A Big Milestone for FABINS!\n\nWe’re excited to share that we have successfully completed the first POC (Proof of Concept) of FABINS.\n\nWith our first prototype, we were able to prove the core concept and demonstrate FABINS as a working solution directly on industrial inspection frames at Saturn Textiles.\n\nThis is an important first step for us, and we’re now focused on improving the system and taking FABINS closer to a production-ready solution for the RMG industry.\n\nFABINS is the first product of NEVOLYN Technology, built to deliver smart automation solutions for a better future.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'POC Demonstration',
    date: '2026-06-28',
    image: '/news_poc_1.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/fabinsautomation/',
  },
]
