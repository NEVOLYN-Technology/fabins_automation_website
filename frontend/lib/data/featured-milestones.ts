/**
 * Featured Milestones Data Store — NEVOLYN Technology & FABINS.
 *
 * Single source of truth for the 4 major high-impact institutional announcements and prototype milestones.
 * Rendered in the 3D horizontal carousel within `LatestNewsSection.tsx`.
 *
 * Chronological order (latest first):
 * 1. Bangladesh Innovation Fair 2026 - Award & Prize Recognition (2026-09-14)
 * 2. Strategic NDA Signed with Axentec PLC (A Robi Axiata Company) (2026-09-09)
 * 3. First FABINS Prototype Showcased at BUET IRAB (2026-07-21)
 * 4. Strategic Partnership with Saturn Textiles & Saturn R&D (2026-07-01)
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
    title: 'Bangladesh Innovation Fair 2026 - Award & Prize Recognition',
    description:
      'FABINS was selected among the Top 50 Innovations out of 950+ innovations and celebrated at the official award-giving ceremony with prize recognition.',
    content:
      'A Proud Milestone for NEVOLYN & FABINS - Fabric Inspection Automation\n\nWe are proud to share that FABINS has been selected among the Top 50 Innovations out of 950+ innovations at the Bangladesh Innovation Fair 2026.\n\nFABINS has been showcased at the fair, and being recognized among the Top 50 innovations is a truly meaningful achievement for our team.\n\nThe Top 50 recognition was celebrated through an award-giving ceremony, marking another important step in our journey from innovation and prototype development toward real-world impact.\n\nWe are grateful for this recognition and proud to represent Bangladeshi innovation, AI, and automation through FABINS.\n\nInnovation Hub | Bangladesh Innovation Fair 2026\nTop 50 Innovations / 950+ Innovations\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Award & Prize',
    date: '2026-09-14',
    image: '/news_fabinsXfair02.jpg',
    linkedinUrl:
      'https://www.linkedin.com/posts/fabinsautomation_fabins-nevolyn-bangladeshinnovationfair2026-activity-7508526922117861377-vQti?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl: 'https://www.facebook.com/share/p/1EsgpSB4Vo/',
  },
  {
    id: 'milestone-axentec-nda',
    title: 'Strategic NDA Signed with Axentec PLC (A Robi Axiata Company)',
    description:
      'Axentec PLC signed an NDA with FABINS, opening discussions with senior technical leadership including CTOs for future collaboration.',
    content:
      'A New Step Toward Collaboration with Axentec PLC\n\nWe’re pleased to share that Axentec PLC, a Robi Axiata company, has signed a Non-Disclosure Agreement (NDA) with FABINS, opening the way for further discussions and potential future collaboration.\n\nWe had the opportunity to meet with the senior technical and business leadership teams of Robi and Axentec, including their CTOs, to discuss FABINS, its technology, and possible areas of collaboration.\n\nWe are especially grateful to Md. Adil Hossain Noble, Managing Director & CEO of Axentec PLC, for the referral and for helping connect us with the right team.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Corporate Partnership',
    date: '2026-09-09',
    image: '/news_fabinsXexentec.jpg',
    linkedinUrl:
      'https://www.linkedin.com/posts/fabinsautomation_nevolyn-fabins-fabricinspection-activity-7508459042906894336-r-Z4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl: 'https://www.facebook.com/share/p/1MgvnDq9Ds/',
  },
  {
    id: 'milestone-buet-irab',
    title: 'First FABINS Prototype Showcased at BUET IRAB',
    description:
      'First FABINS prototype provided to IRAB BUET for an exclusive one-week project showcase following request from Department of EEE, BUET.',
    content:
      'Our first FABINS prototype was provided to IRAB (Institution of Robotics and Automation, BUET) for project showcasing, following a request from the Department of EEE, BUET.\n\nThe prototype was showcased for one week, marking another meaningful step in our journey.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Academic Showcase',
    date: '2026-07-21',
    image: '/news_fabinsXbuet.jpg',
    linkedinUrl:
      'https://www.linkedin.com/posts/fabinsautomation_fabins-nevolyn-fabricinspection-activity-7508456367041675264-bXI_?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl:
      'https://www.facebook.com/fabinsautomation/posts/pfbid0aUqUDspmqSjXBWjurfCpXvUAEE7et8spKwSSTSFidqK9PWHi7CjWbsiM6kTw73bsl',
  },
  {
    id: 'milestone-saturn-partnership',
    title: 'Strategic Partnership with Saturn Textiles & Saturn R&D',
    description:
      'FABINS officially established a strategic partnership with Saturn R&D as our first client and collaborator to advance from prototype to production.',
    content:
      'A New Chapter for FABINS & NEVOLYN Technology\n\nWe are proud to announce our official strategic partnership with Saturn R&D marking an important milestone in the journey of FABINS.\n\nSaturn Textiles and Saturn R&D is not only our first client and collaborator, but also a key partner in helping us take FABINS from a working prototype toward a real-world industrial solution. Their support has given us the opportunity to continue building, testing, and improving our technology.\n\nWe are truly grateful to the Saturn Textiles Limited team for believing in our vision and supporting us from the early stage of this journey.\n\nWe are looking forward to building smarter solutions for the textile industry and creating real-world impact through AI, computer vision, and automation.\n\nFABINS — Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Strategic Partnership',
    date: '2026-07-01',
    image: '/news_fabinsXsaturn.jpg',
    linkedinUrl:
      'https://www.linkedin.com/posts/fabinsautomation_fabins-nevolyn-fabricinspection-activity-7508454084585336832-npGm?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk',
    facebookUrl: 'https://www.facebook.com/share/p/1E3tTbM17b/',
  },
]
