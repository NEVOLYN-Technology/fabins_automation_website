import type { Metadata } from 'next'

/**
 * ============================================================================
 * FABINS & NEVOLYN SEO CONFIGURATION & ENTITY ONTOLOGY
 * ============================================================================
 *
 * This module defines the complete search engine optimization (SEO) architecture,
 * entity relationships, Schema.org semantic graphs, and search taxonomy for
 * FABINS Automation and its parent company NEVOLYN.
 *
 * Architecture Principles:
 * 1. Strict canonical entity authority (NEVOLYN -> FABINS Automation).
 * 2. Natural language relevance without keyword stuffing or deceptive tactics.
 * 3. Deep Schema.org JSON-LD graph for knowledge graph disambiguation.
 * 4. Comprehensive typo, phonetic, and transliteration taxonomy reference.
 */

// ----------------------------------------------------------------------------
// Core Brand & Domain Constants
// ----------------------------------------------------------------------------

export const SEO_CONFIG = {
  siteUrl: 'https://fabins.nevolyn.com',
  parentUrl: 'https://nevolyn.com',
  title: 'FABINS Automation',
  description:
    'FABINS Automation is an AI-powered fabric inspection automation solution for automated fabric defect detection and quality inspection in the textile industry.',
  brandName: 'FABINS Automation',
  parentBrandName: 'NEVOLYN',
  parentCompanyLegalName: 'Nevolyn Technology',
  sponsorName: 'Saturn Textiles Limited',
  social: {
    fabinsLinkedIn: 'https://www.linkedin.com/company/fabinsautomation/',
    nevolynLinkedIn: 'https://www.linkedin.com/company/nevolyn/',
  },
  assets: {
    logo: '/fabins-logo-light-mode.png',
    logoFull: '/fabins-logo.png',
    machinePhoto: '/fabins-machine.png',
  },
} as const

// ----------------------------------------------------------------------------
// Semantic Search & Query Variation Taxonomy
// ----------------------------------------------------------------------------

/**
 * Curated taxonomy of brand terms, concepts, language variants, and search
 * patterns. This taxonomy serves as the semantic foundation for entity
 * disambiguation in search engines.
 */
export const SEO_TAXONOMY = {
  /** Core English brand and product concepts */
  coreConcepts: [
    'FABINS',
    'FABINS Automation',
    'Fabric Inspection',
    'Fabric Inspection Automation',
    'AI-Powered Fabric Inspection',
    'Fabric Defect Detection',
    'Fabric Automation',
    'Textile Automation',
    'RMG Automation',
    'Industrial Automation',
    'Bangladesh Automation',
    'Bangladeshi Automation',
  ],

  /** NEVOLYN parent entity brand variations */
  nevolynEnglishVariations: [
    'NEVOLYN',
    'Nevolyn',
    'nevolyn',
    'NEVOLYN Technology',
    'Nevolyn Technology',
    'nevolyn technology',
    'NEVOLYN Automation',
    'Nevolyn Automation',
    'nevolyn automation',
    'NEVOLYN Inspection',
    'Nevolyn Inspection',
    'nevolyn inspection',
    'NEVOLYN Industrial Automation',
    'Nevolyn Industrial Automation',
    'nevolyn industrial automation',
    'NEVOLYN Bangladesh',
    'Nevolyn Bangladesh',
    'nevolyn bangladesh',
    'NEVOLYN Technology Bangladesh',
    'Nevolyn Technology Bangladesh',
    'NEVOLYN Automation Bangladesh',
    'Nevolyn Automation Bangladesh',
    'NEVOLYN Industrial Automation Bangladesh',
    'Nevolyn Industrial Automation Bangladesh',
    'NEVOLYN AI',
    'Nevolyn AI',
    'NEVOLYN AI Automation',
    'Nevolyn AI Automation',
    'NEVOLYN Textile Automation',
    'Nevolyn Textile Automation',
    'NEVOLYN Fabric Automation',
    'Nevolyn Fabric Automation',
    'NEVOLYN Fabric Inspection',
    'Nevolyn Fabric Inspection',
    'NEVOLYN Fabric Inspection Automation',
    'Nevolyn Fabric Inspection Automation',
  ],

  /** NEVOLYN + FABINS co-occurrence combinations */
  parentProductCombinations: [
    'NEVOLYN FABINS',
    'Nevolyn FABINS',
    'nevolyn fabins',
    'NEVOLYN FABINS Automation',
    'Nevolyn FABINS Automation',
    'NEVOLYN Fabric Inspection',
    'NEVOLYN Fabric Inspection Automation',
    'NEVOLYN Automation FABINS',
    'NEVOLYN AI FABINS',
    'NEVOLYN AI Automation',
    'NEVOLYN Textile Automation',
    'NEVOLYN Fabric Automation',
    'NEVOLYN Industrial Automation',
    'FABINS by NEVOLYN',
    'FABINS Automation by NEVOLYN',
    'FABINS from NEVOLYN',
    'FABINS product by NEVOLYN',
    'FABINS developed by NEVOLYN',
    'FABINS NEVOLYN',
    "NEVOLYN's FABINS",
    'NEVOLYN FABINS Automation',
    'NEVOLYN fabric inspection automation',
    'NEVOLYN textile automation',
    'NEVOLYN industrial automation',
    'NEVOLYN Bangladesh automation',
    'NEVOLYN AI automation',
    'NEVOLYN automation Bangladesh',
    'FABINS automation Bangladesh by NEVOLYN',
    'fabric inspection automation by NEVOLYN',
    'AI fabric inspection by NEVOLYN',
    'fabric inspection automation Bangladesh NEVOLYN',
    'FABINS Automation NEVOLYN',
    'Fabric Inspection NEVOLYN',
    'Fabric Inspection Automation NEVOLYN',
    'Industrial Automation NEVOLYN',
    'Textile Automation NEVOLYN',
    'NEVOLYN Bangladesh',
    'Bangladesh NEVOLYN',
    'NEVOLYN FABINS Bangladesh',
    'FABINS Bangladesh NEVOLYN',
    'FABINS Automation Bangladesh NEVOLYN',
    'Fabric Inspection Automation Bangladesh NEVOLYN',
  ],

  /** Bengali script brand representations */
  bengaliVariations: [
    'নেভোলিন',
    'নেভোলিন টেকনোলজি',
    'নেভোলিন অটোমেশন',
    'নেভোলিন ইন্সপেকশন',
    'নেভোলিন ইন্ডাস্ট্রিয়াল অটোমেশন',
    'নেভোলিন বাংলাদেশ',
    'নেভোলিন টেকনোলজি বাংলাদেশ',
    'নেভোলিন অটোমেশন বাংলাদেশ',
    'নেভোলিন ফ্যাবিনস',
    'নেভোলিন ফ্যাবিন্স',
    'নেভোলিন ফ্যাবিনস অটোমেশন',
    'নেভোলিন ফ্যাবিন্স অটোমেশন',
    'নেভোলিন ফ্যাব্রিক ইন্সপেকশন',
    'নেভোলিন ফ্যাব্রিক ইন্সপেকশন অটোমেশন',
    'নেভোলিন ফ্যাব্রিক অটোমেশন',
    'নেভোলিন টেক্সটাইল অটোমেশন',
    'নেভোলিন এআই অটোমেশন',
    'নেভোলিন শিল্প অটোমেশন',
    'নেভোলিন ইন্ডাস্ট্রিয়াল অটোমেশন বাংলাদেশ',
    'নেভলিন',
    'নেভলিন টেকনোলজি',
    'নেভলিন অটোমেশন',
    'নেভলিন ইন্সপেকশন',
    'নেভলিন ফ্যাবিনস',
    'ফ্যাবিনস',
    'ফ্যাবিন্স',
    'ফ্যাবিনস অটোমেশন',
    'ফ্যাবিন্স অটোমেশন',
    'ফ্যাব্রিক ইন্সপেকশন',
    'ফ্যাব্রিক ইন্সপেকশন অটোমেশন',
    'বস্ত্র শিল্প অটোমেশন',
    'স্বয়ংক্রিয় ফ্যাব্রিক পরিদর্শন',
  ],

  /** Mixed Bengali and English queries */
  mixedLanguageVariations: [
    'নেভোলিন Automation',
    'নেভোলিন Technology',
    'নেভোলিন Industrial Automation',
    'নেভোলিন Fabric Inspection',
    'নেভোলিন Fabric Inspection Automation',
    'নেভোলিন Fabric Automation',
    'নেভোলিন Textile Automation',
    'নেভোলিন AI Automation',
    'নেভোলিন FABINS',
    'FABINS নেভোলিন',
    'ফ্যাবিনস নেভোলিন',
    'ফ্যাবিন্স নেভোলিন',
    'নেভোলিনের FABINS',
    'নেভোলিনের ফ্যাবিনস',
    'নেভোলিনের ফ্যাবিন্স',
    'নেভোলিন অটোমেশন',
    'নেভোলিনের Automation',
    'নেভোলিনের Fabric Inspection',
    'নেভোলিনের Fabric Inspection Automation',
    'বাংলাদেশে নেভোলিন',
    'বাংলাদেশে নেভোলিন অটোমেশন',
    'বাংলাদেশে নেভোলিন ফ্যাবিনস',
    'বাংলাদেশে নেভোলিন ফ্যাব্রিক ইন্সপেকশন',
  ],

  /**
   * ==========================================================================
   * COMPREHENSIVE TYPO, PHONETIC, KEYBOARD & INTENT TAXONOMY
   * ==========================================================================
   * Internal reference taxonomy modeling how human users search, mistype,
   * transliterate, and express search intent.
   *
   * Architectural Rule:
   * This taxonomy serves as the internal semantic mapping & natural-language
   * intent layer. It is NOT dumped into Schema.org alternateName, page titles,
   * meta tags, or visible text blocks, maintaining strict white-hat SEO purity.
   */
  typoTaxonomy: {
    /** 1. Keyboard-neighbor mistakes (pressing adjacent keys on standard keyboards) */
    keyboardNeighborMistakes: [
      'FABIMS', // N -> M
      'FABIPS', // O/P drift
      'DABINS', // F -> D
      'GABINS', // F -> G
      'RABINS', // F -> R
      'FWBINS', // A -> W
      'FSBINS', // A -> S
      'FABONS', // I -> O
      'FABKNS', // I -> K
      'FABIBS', // N -> B
      'FABIJS', // N -> J
      'FABINE', // S -> E
      'FABINA', // S -> A
      'FABIND', // S -> D
      'FABINW', // S -> W
    ],

    /** 2. QWERTY-specific layout substitutions (finger drift across rows) */
    qwertySubstitutions: [
      'FAVINS', // B -> V
      'FAGINS', // B -> G
      'FACINS', // B -> C
      'FABJNS', // I -> J
      'FABUNS', // I -> U
      'FABINX', // S -> X
      'FABINC', // S -> C
      'FABINZ', // S -> Z
    ],

    /** 3. Repeated-character mistakes (stuck key / rapid typing duplications) */
    repeatedCharacters: [
      'FFABINS',
      'FAABINS',
      'FAAABINS',
      'FABBINS',
      'FABBBINS',
      'FABIINS',
      'FABINNS',
      'FABINSS',
      'FABINSSS',
      'FABBINS',
      'FABBINSS',
      'FFAABBIINNSS',
    ],

    /** 4. Missing consecutive characters (dropped letters / fast typing omission) */
    missingCharacters: [
      'FABNS', // Missing I
      'FABIS', // Missing N
      'FABS', // Missing IN
      'FABN', // Missing IS
      'FBINS', // Missing A
      'ABINS', // Missing F
      'AINS', // Missing FB
      'BINS', // Missing FA
      'FAB', // Missing INS
    ],

    /** 5. Wrong character order / multiple transpositions (inversions) */
    characterTranspositions: [
      'FABNIS', // Swap I-N
      'FBAINS', // Swap A-B
      'FABISN', // Swap N-S
      'FABI NS', // Accidental space insertion
      'FBAISN', // Double swap (A-B and N-S)
      'AFBINS', // Swap F-A
      'FAIBNS', // Swap B-I
      'FNAIBS', // Scrambled interior
      'FABNSI', // End inversion
      'IBAFNS', // Full scrambled input
    ],

    /** 6. Prefix & suffix attachments (brand affixed with common tags or extensions) */
    affixAttachments: [
      'myfabins',
      'getfabins',
      'thefabins',
      'fabinsbd',
      'fabinsbd.com',
      'fabinsai',
      'fabinsapp',
      'fabinstextile',
      'fabinsautomationbd',
      'fabinsbangladesh',
      'nevolynfabins',
      'fabinstech',
    ],

    /** 7. Plural / singular confusion */
    grammaticalNumber: [
      'FABIN', // Dropped plural S
      'FABIN Automation',
      'FABINS Automations',
      'Fabric Inspections',
      'Fabric Defects Detection',
      'Fabric Inspection Systems',
      'FABINS Machine',
      'FABINS Machines',
    ],

    /** 8. Grammar & phrasing form variations */
    phrasingVariations: [
      'FABINS Automation',
      'FABINS Automated Inspection',
      'FABINS Fabric Inspection',
      'Fabric Inspection by FABINS',
      'FABINS for Fabric Inspection',
      'FABINS Defect Inspection',
      'Automated Inspection FABINS',
      'AI Inspection with FABINS',
      'FABINS Inspection System',
    ],

    /** 9. Word-order permutations */
    wordOrderPermutations: [
      'FABINS Fabric Inspection',
      'Fabric Inspection FABINS',
      'Automation FABINS',
      'FABINS Automation Fabric Inspection',
      'Fabric Inspection Automation FABINS',
      'Inspection Fabric FABINS',
      'Defect Detection FABINS',
      'FABINS Defect Detection',
      'Bangladesh Fabric Inspection FABINS',
      'NEVOLYN FABINS Automation',
      'FABINS NEVOLYN Automation',
      'Fabric Inspection NEVOLYN FABINS',
    ],

    /** 10. Abbreviation and acronym-like searches */
    acronymsAndAbbreviations: [
      'FAB INS',
      'FAB-INS',
      'FAB_INS',
      'FAB INS Automation',
      'FI Automation FABINS',
      'F.A.B.I.N.S.',
      'FAB-INS-BD',
      'FIA FABINS',
      'FABINS AI',
      'F-INS',
    ],

    /** 11. Domain, URL & search-bar direct inputs */
    domainSearchBarInputs: [
      'fabins.nevolyn',
      'fabinsnevolyn',
      'fabins nevolyn',
      'fabins.nevolyn.com',
      'fabins.com',
      'fabins com',
      'fabins nevolyn com',
      'fabins dot nevolyn dot com',
      'nevolyn.com/fabins',
      'nevolyn fabins',
      'http fabins nevolyn com',
      'https fabins nevolyn com',
    ],

    /** 12. Bengali phonetic & dialect variations */
    bengaliPhoneticVariations: [
      'ফ্যাবিন',
      'ফ্যাবিনস',
      'ফ্যাবিন্স',
      'ফেবিন',
      'ফেবিনস',
      'ফেবিন্স',
      'ফ্যাবীনস',
      'ফ্যাবীন্স',
      'ফ্যাবিন্স অটোমেশন',
      'ফ্যাব্রিক ইনস্পেকশন',
      'ফ্যাব্রিক ইন্সপেকশন অটোমেশন',
      'ফ্যাব্রিক অটোমেসন',
      'ফ্যাব্রিক ডিসপেকশন',
      'নেভলিন ফ্যাবিনস',
      'নেভোলিন ফেবিন্স',
    ],

    /** 13. Bangla-English phonetic code-switching / mixed queries */
    banglaEnglishMixed: [
      'ফ্যাবিনস automation',
      'fabins অটোমেশন',
      'ফ্যাবিনস fabric inspection',
      'নেভোলিন fabins',
      'নেভলিন ফ্যাবিনস',
      'fabins বাংলাদেশ',
      'fabins টেকনোলজি',
      'fabins defect inspection',
      'নেভোলিন fabric inspection automation',
      'ফ্যাবিনস AI machine',
      'বাংলাদেশে fabins inspection',
      'ফ্যাবিনস nevolyn technology',
    ],

    /** 14. Multiple simultaneous errors (compound typo + spacing + wrong grammar + entity) */
    multipleSimultaneousErrors: [
      'Febin Automtion Banglades',
      'Fabins Fabric Inspecion Automtion',
      'Febins fabric inspecton by nevolyn',
      'FAB INS Automtion Bangladesh',
      'ফেবিনস ফ্যাব্রিক ইন্সপেকশন অটোমেশন',
      'Febin Inspecion Automtion Nevolyn',
      'Fabin Automashon Bangladesh',
      'Fabins Automaton Nevolin',
      'FAB INS fabrick inspecion',
      'febins automtion bd nevolyn',
      'faben fabric inspecton machine',
      'fabn inspecion automashon',
      'Fabbins textile automtion bangladesh',
      'Fabins automtion by nevolin tech',
      'Febins ai fabric inspecton',
    ],

    /** 15. Common unbranded search-intent queries (problem/solution queries in Bangladesh) */
    searchIntentProblemSolution: [
      'AI fabric inspection machine Bangladesh',
      'fabric defect detection Bangladesh',
      'automated fabric inspection machine',
      'textile inspection automation Bangladesh',
      'RMG fabric inspection AI',
      'fabric inspection software Bangladesh',
      'automatic fabric fault detector machine',
      'fabric roll inspection machine retrofit',
      'Four point inspection software Bangladesh',
      'camera based fabric defect detection textile',
      'AI retrofit for fabric inspection frame',
      'knit fabric defect inspection system BD',
    ],
  },
} as const

// ----------------------------------------------------------------------------
// Schema.org Structured Data (JSON-LD)
// ----------------------------------------------------------------------------

/**
 * Builds the Schema.org Graph establishing the exact parent-entity relationship
 * between NEVOLYN and FABINS Automation.
 */
export function buildSchemaGraph() {
  const { siteUrl, parentUrl, title, description, brandName, parentBrandName, social, assets } =
    SEO_CONFIG

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Parent Organization: NEVOLYN
      {
        '@type': 'Organization',
        '@id': `${parentUrl}/#organization`,
        name: parentBrandName,
        alternateName: [
          'Nevolyn',
          'nevolyn',
          'NEVOLYN Technology',
          'Nevolyn Technology',
          'nevolyn technology',
          'NEVOLYN Automation',
          'Nevolyn Automation',
          'নেভোলিন',
          'নেভোলিন টেকনোলজি',
          'নেভলিন',
          'নেভলিন টেকনোলজি',
        ],
        url: `${parentUrl}/`,
        disambiguatingDescription:
          'NEVOLYN (Nevolyn Technology) is an industrial technology and automation company in Bangladesh, creator and parent organization of FABINS fabric inspection automation.',
        knowsAbout: [
          'Industrial Automation',
          'AI and Computer Vision',
          'Fabric Inspection Systems',
          'Textile Automation Bangladesh',
          'RMG Automation',
        ],
        sameAs: [social.nevolynLinkedIn],
      },

      // 2. Sub-Brand / Product Organization: FABINS Automation
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: brandName,
        alternateName: [
          'FABINS',
          'fabins',
          'Fabric Inspection Automation',
          'AI-Powered Fabric Inspection Automation',
          'নেভোলিন ফ্যাবিনস',
          'ফ্যাবিনস',
          'ফ্যাবিন্স',
          'ফ্যাবিনস অটোমেশন',
          'ফ্যাবিন্স অটোমেশন',
        ],
        url: `${siteUrl}/`,
        logo: `${siteUrl}${assets.logo}`,
        image: `${siteUrl}${assets.machinePhoto}`,
        description,
        slogan: 'AI-Powered Fabric Inspection Automation',
        disambiguatingDescription:
          'FABINS Automation (also known as FABINS) is an AI-powered fabric defect inspection and quality automation system developed by Nevolyn Technology for textile and RMG mills.',
        knowsAbout: [
          'Fabric Inspection Automation',
          'AI Fabric Defect Detection',
          'Textile Quality Control',
          'ASTM D5430 Four-Point Inspection',
          'RMG Industrial Automation',
          'Computer Vision Defect Detection',
          'Bangladesh Textile Automation',
        ],
        parentOrganization: {
          '@id': `${parentUrl}/#organization`,
        },
        sameAs: [social.fabinsLinkedIn],
      },

      // 3. Product / Software Application
      {
        '@type': ['Product', 'SoftwareApplication'],
        '@id': `${siteUrl}/#product`,
        name: brandName,
        alternateName: [
          'FABINS',
          'AI-Powered Fabric Inspection Automation',
          'Fabric Inspection Automation',
          'FABINS AI Fabric Inspection',
          'ফ্যাবিনস অটোমেশন',
          'নেভোলিন ফ্যাবিনস অটোমেশন',
        ],
        description,
        category: 'Fabric Inspection Automation System',
        disambiguatingDescription:
          'AI-driven fabric defect detection and roll quality inspection retrofit system engineered by Nevolyn Technology for textile manufacturing.',
        url: `${siteUrl}/`,
        image: `${siteUrl}${assets.machinePhoto}`,
        brand: {
          '@id': `${siteUrl}/#organization`,
        },
        manufacturer: {
          '@id': `${parentUrl}/#organization`,
        },
        applicationCategory: 'Industrial Automation / Quality Inspection',
      },

      // 4. WebSite Entity
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: title,
        alternateName: ['FABINS', 'FABINS Automation', 'নেভোলিন ফ্যাবিনস'],
        description,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        isPartOf: {
          '@id': `${parentUrl}/#organization`,
        },
        inLanguage: ['en', 'bn'],
      },

      // 5. Primary WebPage Entity
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: title,
        description,
        isPartOf: {
          '@id': `${siteUrl}/#website`,
        },
        about: {
          '@id': `${siteUrl}/#product`,
        },
        inLanguage: ['en', 'bn'],
      },
    ],
  }
}

// ----------------------------------------------------------------------------
// Next.js Root Metadata
// ----------------------------------------------------------------------------

export const rootSiteMetadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: SEO_CONFIG.title,
  description: SEO_CONFIG.description,
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${SEO_CONFIG.siteUrl}/`,
    siteName: SEO_CONFIG.brandName,
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    images: [
      {
        url: SEO_CONFIG.assets.machinePhoto,
        width: 1254,
        height: 1254,
        alt: 'FABINS Automation - AI-Powered Fabric Inspection Automation Rig',
      },
      {
        url: SEO_CONFIG.assets.logo,
        width: 500,
        height: 500,
        alt: 'FABINS Automation Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    images: [SEO_CONFIG.assets.machinePhoto],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: SEO_CONFIG.assets.logo, type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: SEO_CONFIG.assets.logo,
    apple: SEO_CONFIG.assets.logo,
  },
}
