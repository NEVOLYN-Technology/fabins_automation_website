/**
 * Recent News & Updates Data Store — NEVOLYN Technology & FABINS.
 *
 * Single source of truth for chronological news timeline updates.
 * Rendered in the "Latest News" section within `LatestNewsSection.tsx`.
 *
 * Strictly sorted in reverse chronological order (Newest -> Top, Oldest -> Bottom):
 * 1. 2026-09-14 — Bangladesh Innovation Fair 2026 — Award & Prize Recognition
 * 2. 2026-09-12 — Honorable Prime Minister Visits FABINS at Stall No. 15
 * 3. 2026-09-10 — Bangladesh Innovation Fair 2026 — Top 50 Selection
 * 4. 2026-09-09 — Strategic NDA Signed with Axentec PLC (A Robi Axiata Company)
 * 5. 2026-08-28 — Onboarded to Founders’ Leadership Program (FLP) Cohort 4 by NSU Startups Next
 * 6. 2026-07-28 — Exploring New Possibilities with Ontik Technology Leadership
 * 7. 2026-07-21 — First FABINS Prototype Showcased at BUET IRAB
 * 8. 2026-07-01 — Strategic Partnership with Saturn Textiles & Saturn R&D
 * 9. 2026-07-01 — Mohammad Ninad Mahmud Nobo Appointed Lead AI Software Engineer
 * 10. 2026-07-01 — Md Rahinur Rahman Appointed Lead AI Systems Engineer
 * 11. 2026-06-28 — First Working POC of FABINS Successfully Completed at Saturn
 * 12. 2026-02-24 — FABINS Project Funding & Development Capital Approved
 * 13. 2026-01-15 — FABINS AI Vision Initiative Approved & Launched
 *
 * @module lib/data/latest-news
 */

export interface NewsItem {
  /** Unique identifier — used as React list key. */
  id: string
  /** Headline title of the news item. */
  title: string
  /** Short 1-2 sentence preview description for timeline card. */
  description: string
  /** Full announcement text for detail modal or article view. */
  content: string
  /** Category tag classification. */
  category: string
  /** ISO publication date string (YYYY-MM-DD). */
  date: string
  /** Exact path to image asset in `/public`. */
  image: string
  /** Direct link to LinkedIn post or page. */
  linkedinUrl: string
  /** Direct link to Facebook post or page. */
  facebookUrl: string
}

/**
 * Chronological news update feed ordered newest-first with exact matching images from `/public`.
 */
export const news: NewsItem[] = [
  {
    id: 'news-fair-award-top50',
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
    id: 'news-pm-visit-stall-15',
    title: 'Honorable Prime Minister Visits FABINS at Stall No. 15 | Bangladesh Innovation Fair 2026',
    description:
      'The Honorable Prime Minister visited our Stall No. 15 at Novo Theatre, Dhaka, discussing AI vision and smart RMG manufacturing.',
    content:
      'A Proud Moment at Bangladesh Innovation Fair 2026\n\nA truly proud moment for FABINS Automation and NEVOLYN Technology as the Honorable Prime Minister visited our Stall No. 15, at Bangladesh Innovation Fair 2026.\n\nWe had the pleasure of showcasing FABINS and engaging in an insightful conversation about our technology, innovation, and vision for smarter manufacturing. We missed our very own co-founder Rahin Rahman. Unfortunately he could not attend the fair due to medical emergency. We are very thankful to him for the immense support and instruction.\n\nBeing able to present our work at such a national innovation platform and receive this valuable attention is a meaningful achievement for our entire team. We are proud to see FABINS representing Bangladeshi innovation and taking another step forward.\n\n📍 Innovation Hub - Booth No. 15 | Novo Theatre, Dhaka\n📅 12–14 September 2026\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'VIP Exhibition',
    date: '2026-09-12',
    image: '/news_fabinsXfair03.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/nevolyn/posts/pfbid026g26dBiiZdigVc8PNq1ck3XnzwfpCc2dDjLtoSzZnJxo44hrhWBERdSviNsSNU6cl',
  },
  {
    id: 'news-fair-selection-top50',
    title: 'Bangladesh Innovation Fair 2026 — Top 50 Selection & Showcase',
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
    id: 'news-axentec-nda',
    title: 'Strategic NDA Signed with Axentec PLC (A Robi Axiata Company)',
    description:
      'Axentec PLC signed an NDA with FABINS, opening discussions with senior technical leadership including CTOs for future collaboration.',
    content:
      'A New Step Toward Collaboration with Axentec PLC\n\nWe’re pleased to share that Axentec PLC, a Robi Axiata company, has signed a Non-Disclosure Agreement (NDA) with FABINS, opening the way for further discussions and potential future collaboration.\n\nWe had the opportunity to meet with the senior technical and business leadership teams of Robi and Axentec, including their CTOs, to discuss FABINS, its technology, and possible areas of collaboration.\n\nWe are especially grateful to Md. Adil Hossain Noble, Managing Director & CEO of Axentec PLC, for the referral and for helping connect us with the right team.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Corporate Partnership',
    date: '2026-09-09',
    image: '/news_fabinsXexentec.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/fabinsautomation/',
  },
  {
    id: 'news-nsu-startups-next',
    title: 'Onboarded to Founders’ Leadership Program (FLP) Cohort 4 by NSU Startups Next',
    description:
      'FABINS was onboarded to the Founders’ Leadership Program (FLP) — Cohort 4 by NSU Startups Next, establishing a dynamic connection for startup growth.',
    content:
      'A New Chapter with NSU Startups Next\n\nWe’re excited to share that FABINS has been onboarded to the Founders’ Leadership Program (FLP) — Cohort 4 by NSU Startups Next.\n\nThis marks a meaningful new connection between NSU Startups Next, NEVOLYN, and FABINS. A big thank you to NSU Startups Next for welcoming NEVOLYN and FABINS into this journey—we’re excited to learn, connect, and grow together through FLP Cohort 4.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Accelerator Program',
    date: '2026-08-28',
    image: '/news_fabinsXnsu.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/fabinsautomation/',
  },
  {
    id: 'news-ontik-technology',
    title: 'Exploring New Possibilities with Ontik Technology Leadership',
    description:
      'Engaged in an insightful discussion with Farjad Ahmed (CEO) and S.M. Mohiuddin Milton (CSO) of Ontik Technology to explore technology synergy.',
    content:
      'Exploring New Possibilities with Ontik Technology\n\nWe’re grateful to have had the opportunity to meet and have an insightful discussion with Farjad Ahmed, Chief Executive Officer (CEO), and S.M. Mohiuddin Milton, Chief Strategy Officer (CSO) of Ontik Technology.\n\nWe look forward to exploring how we can work together and create meaningful impact through technology and innovation.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Industry Dialogue',
    date: '2026-07-28',
    image: '/news_fabinsXontik.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/fabinsautomation/',
  },
  {
    id: 'news-buet-irab-showcase',
    title: 'First FABINS Prototype Showcased at BUET IRAB',
    description:
      'First FABINS prototype provided to IRAB BUET for an exclusive one-week project showcase following request from Department of EEE, BUET.',
    content:
      'Our first FABINS prototype was provided to IRAB (Institution of Robotics and Automation, BUET) for project showcasing, following a request from the Department of EEE, BUET.\n\nThe prototype was showcased for one week, marking another meaningful step in our journey.\n\nFABINS - Fabric Inspection Automation\nWebsite: https://fabins.nevolyn.com\nEmail: fabins@nevolyn.com\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Academic Showcase',
    date: '2026-07-21',
    image: '/news_fabinsXbuet.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/fabinsautomation/',
    facebookUrl: 'https://www.facebook.com/fabinsautomation/',
  },
  {
    id: 'news-saturn-partnership',
    title: 'Strategic Partnership with Saturn Textiles & Saturn R&D',
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
    id: 'news-nobo-appointment',
    title: 'Mohammad Ninad Mahmud Nobo Appointed as Lead AI Software Engineer',
    description:
      'NEVOLYN Technology officially appointed Mohammad Ninad Mahmud Nobo as Lead AI Software Engineer to lead core software execution and industrial AI vision deployment.',
    content:
      'Leadership Appointment at NEVOLYN Technology\n\nNEVOLYN Technology expanded its engineering leadership through the official appointment of Mohammad Ninad Mahmud Nobo as Lead AI Software Engineer.\n\nIn this role, Mohammad Ninad Mahmud Nobo leads the technical software execution, edge inference pipelines, camera synchronization, and deep learning model deployment for FABINS. His leadership on the ground has been instrumental in taking FABINS from an experimental concept to live factory inspection frames and national recognition at the Bangladesh Innovation Fair 2026.\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Leadership Appointment',
    date: '2026-07-01',
    image: '/ninad-photo.png',
    linkedinUrl: 'https://www.linkedin.com/company/nevolyn/',
    facebookUrl: 'https://www.facebook.com/nevolyn/',
  },
  {
    id: 'news-rahin-appointment',
    title: 'Md Rahinur Rahman Appointed as Lead AI Systems Engineer',
    description:
      'NEVOLYN Technology officially appointed Md Rahinur Rahman as Lead AI Systems Engineer to guide intelligent architecture, hardware-software integration, and R&D.',
    content:
      'Leadership Appointment at NEVOLYN Technology\n\nNEVOLYN Technology expanded its technical architecture leadership with the official appointment of Md Rahinur Rahman as Lead AI Systems Engineer.\n\nAs co-founder and systems architect, Md Rahinur Rahman spearheads overall intelligent systems architecture, deep learning algorithms, optical sensor hardware design, and institutional R&D. His technical guidance has set the foundation for NEVOLYN’s proprietary automated fabric defect detection platform.\n\nNEVOLYN Technology\nWebsite: https://nevolyn.com\nEmail: info@nevolyn.com',
    category: 'Leadership Appointment',
    date: '2026-07-01',
    image: '/rahin-photo.png',
    linkedinUrl: 'https://www.linkedin.com/company/nevolyn/',
    facebookUrl: 'https://www.facebook.com/nevolyn/',
  },
  {
    id: 'news-saturn-poc',
    title: 'First POC Demonstration of FABINS Successfully Completed at Saturn',
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
  {
    id: 'news-funding-approved',
    title: 'FABINS Project Funding & Development Capital Approved',
    description:
      'Executive leadership approved full financial allocation, enabling NEVOLYN to initiate hardware assembly and software platform development.',
    content:
      'NEVOLYN Technology officially approved and signed the funding allocation for the FABINS project.\n\nWith the required financial and organizational support in place, the engineering team formally commenced development of the AI-powered fabric inspection platform.',
    category: 'Project Funding',
    date: '2026-02-24',
    image: '/news_poc_2.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/nevolyn/',
    facebookUrl: 'https://www.facebook.com/nevolyn/',
  },
  {
    id: 'news-vision-launched',
    title: 'FABINS AI Vision Initiative Approved & Launched',
    description:
      'Md Rahinur Rahman presented the FABINS concept to Managing Director Amanullah Chagla, securing formal executive approval to launch the AI inspection initiative.',
    content:
      'Md Rahinur Rahman presented the FABINS concept to Managing Director Amanullah Chagla.\n\nFollowing executive approval, NEVOLYN Technology officially launched the industrial AI initiative to modernize fabric quality inspection using computer vision.',
    category: 'Strategic Vision',
    date: '2026-01-15',
    image: '/news_fabinsXfair04.jpg',
    linkedinUrl: 'https://www.linkedin.com/company/nevolyn/',
    facebookUrl: 'https://www.facebook.com/nevolyn/',
  },
]
