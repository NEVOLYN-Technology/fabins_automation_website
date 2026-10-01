/**
 * PEOPLE — the team behind FABINS.
 *
 * Single source of truth, read by `InnovatorsSection` (the cards and the
 * profile modal) and by the `Footer` (the "Innovators" column). The footer used
 * to hardcode its own copy of these names and roles; it now reads from here, so
 * editing a person in one place updates both.
 *
 * ─── TO ADD A TEAM MEMBER ───────────────────────────────────────────────────
 * Append an entry to `fabinsInnovators` below and drop their portrait into
 * `public/`. Both the card grid and the footer list pick it up automatically.
 * Note the cards render in a two-column grid, so an odd number leaves a gap.
 *
 * ─── TO REMOVE A LINK ROW FROM A PROFILE ────────────────────────────────────
 * Delete the field. Every `social` entry is optional and the modal only renders
 * rows that have a value.
 */

export interface InnovatorMember {
  /** Stable key, used as the React list key. */
  id: string
  name: string
  /** Full job title, shown on the card and in the modal header. */
  title: string
  /** Compact "role · department" line for the footer list. */
  shortRole: string
  /** One-sentence summary shown on the card. */
  bio: string
  /** Bullet list in the profile modal. */
  responsibilities: string[]
  /** Full biography, one string per paragraph. Falls back to `bio` if omitted. */
  extendedBio?: string[]
  email?: string
  /** Path relative to `public/`, e.g. `/rahin-photo.png`. */
  image?: string
  /** Every field optional — the modal renders only the rows that are present. */
  social?: {
    github?: string
    linkedin?: string
    portfolio?: string
    scholar?: string
    /** Display text for the scholar link; falls back to "Google Scholar". */
    scholarName?: string
    orcid?: string
  }
}


export const fabinsInnovators: InnovatorMember[] = [
  {
    id: 'rahin',
    name: 'Md Rahinur Rahman',
    title: 'AI Systems Engineer',
    shortRole: 'AI Systems Engineer · EEE, BUET',
    bio: 'Design and development of industrial automation and AI systems for FABINS at NEVOLYN.',
    extendedBio: [
      'Design and development of AI-powered industrial automation solutions at NEVOLYN, specializing in computer vision, intelligent manufacturing systems, and production-ready AI technologies.',
      'He graduated in Electrical and Electronic Engineering (EEE) from Bangladesh University of Engineering and Technology (BUET), one of Bangladesh\'s top engineering schools, with a specialization in Communication and Signal Processing (CSP). His academic foundation provided a solid basis in digital signal processing, mathematical modeling, and pattern recognition, bridging deep engineering theory with practical AI systems.',
      'Throughout his academic and research work, he explored advanced signal analysis, embedded systems, and computer vision algorithms for real-world problems. His hands-on research in hardware-software co-design and intelligent imaging built the technical foundation for his current work in industrial automation, edge AI, and real-time inspection systems.'
    ],
    email: 'rahin.rahman11@gmail.com',
    responsibilities: [
      'AI architecture and industrial automation initiatives',
      'Computer vision and deep learning model development for FABINS',
      'Industrial camera integration & zero-latency trigger pipelines',
      'Industrial imaging systems and smart manufacturing transformation at NEVOLYN Technology'
    ],
    social: {
      github: 'https://github.com/rahin11',
      linkedin: 'https://www.linkedin.com/in/rahin-rahman-94a8a0246',
      scholar: 'https://scholar.google.com/citations?user=Jq0HF_kAAAAJ',
      scholarName: 'Md Rahinur Rahman'
    },
    image: '/rahin-photo.png',
  },
  {
    id: 'ninad',
    name: 'Mohammad Ninad Mahmud Nobo',
    title: 'AI Software Engineer',
    shortRole: 'AI Software Engineer · CSE, BUET',
    bio: 'Full-stack web development and machine learning model integration for FABINS at NEVOLYN.',
    extendedBio: [
      'Full-stack web application development, production deployment, and machine learning model contributions for FABINS (Fabric Inspection System) at NEVOLYN Technology. His work integrates computer vision pipelines, interactive web dashboards, industrial camera controls, and scalable REST API architectures to modernize textile manufacturing.',
      'He graduated in Computer Science and Engineering from Bangladesh University of Engineering and Technology (BUET), one of Bangladesh\'s top engineering schools. There, he explored how AI could tackle complex, real-world challenges, from automated software testing to medical image analysis to Bangla speech processing. That foundation of rigorous research and hands-on building led him to industrial AI, where the software challenges are just as demanding, but the impact is immediate and visible on the factory floor.',
      'His research includes AutoTestGenX, a multi-agent system that writes and executes software tests autonomously, and MedCAR, which resolves conflicting AI readings of chest X-rays. Beyond FABINS, he has built impactful AI applications including MindTrace, providing caregivers simple tools for dementia support, and GemmaVetCare, delivering edge AI livestock health guidance for low-connectivity environments.'
    ],
    email: 'mninadmnobo@gmail.com',
    responsibilities: [
      'Full-stack development of NEVOLYN & FABINS web applications',
      'Image processing, computer vision model training for FABINS',
      'ML pipeline architecture & production deployment',
      'API design, software quality standards, & DevOps automation'
    ],
    social: {
      portfolio: 'https://mninadmnobo.github.io',
      github: 'https://github.com/mninadmnobo',
      linkedin: 'https://www.linkedin.com/in/mninadmnobo',
      scholar: 'https://scholar.google.com/citations?user=y5-A2oAAAAAJ&hl=en&oi=ao',
      scholarName: 'M Ninad M Nobo',
      orcid: 'https://orcid.org/0009-0006-2781-6693'
    },
    image: '/ninad-photo.png',
  },
]
