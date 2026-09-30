/**
 * PRODUCT CONTENT — every claim the site makes about FABINS.
 *
 * This is the single source of truth for the marketing and technical copy in
 * the page sections. Components read from it; nothing here imports a component,
 * an icon, or a CSS class, which keeps the content portable if it later moves
 * behind the API.
 *
 * ─── WHICH SECTION READS WHAT ───────────────────────────────────────────────
 *   ProblemSection    → problemItems      (the four cards)
 *                       marketDrivers     (written, not currently rendered)
 *   AboutSection      → aboutComparisons  (the comparison table rows)
 *   SystemSection     → pipelineSteps     (the carousel)
 *                       hardwarePillars   (the four cards below it)
 *   StandardsSection  → standardsRules    (the four penalty cards)
 *                       standardsDefects  (the interactive defect list)
 *                       gradeThresholds   (the pass/reject scale)
 *                       rollCalculation   (the worked example)
 *
 * ─── TO EDIT COPY ───────────────────────────────────────────────────────────
 * Change the strings below. No component edit is needed — every list is mapped
 * over, so adding or removing an entry is picked up automatically.
 *
 * ─── TWO RULES WHEN ADDING FIELDS ───────────────────────────────────────────
 *   1. No Tailwind classes. Use a semantic `tone` (see `Tone` below) and let
 *      the section decide how to paint it. Colours are a design decision, and
 *      keeping them out of here means a rebrand touches one file, not five.
 *   2. No icon components. Reference an icon by name; the section maps the name
 *      to a component. See `ProblemIconName` below for how that stays type-safe.
 */

/* ────────────────────────────────────────────────────────────────────────────
   SHARED TYPES
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Semantic colour for a badge or tag.
 *
 * Sections translate these into Tailwind classes — see `TONE_CLASSES` in
 * `components/sections/StandardsSection.tsx`. Adding a tone here without adding
 * it there is a compile error, so the two cannot drift apart.
 */
export type Tone = 'blue' | 'amber' | 'orange' | 'red' | 'purple' | 'cyan' | 'emerald'

/**
 * Icons available to `problemItems`.
 *
 * Declared as a union rather than a loose `string` so that `ProblemSection`'s
 * icon map is forced by the type checker to cover every name. Add a value here
 * and the build fails until the section supplies a matching icon — which is the
 * point: a missing icon is caught at compile time, not as a gap on the page.
 */
export type ProblemIconName =
  | 'UserX'
  | 'Clock'
  | 'BarChart2'
  | 'Database'
  | 'Zap'
  | 'Globe'
  | 'ShieldAlert'
  | 'Cpu'

/**
 * The four hardware pillars, identified by name rather than by position.
 *
 * `SystemSection` looks up each pillar's icon by this id. It used to look them
 * up by array index, which meant reordering `hardwarePillars` below silently
 * gave every card the wrong icon. Adding an id here is a compile error until
 * the section supplies a matching icon.
 */
export type HardwarePillarId = 'camera' | 'encoder' | 'lighting' | 'software'

/* ────────────────────────────────────────────────────────────────────────────
   SECTION DATA TYPES
   ──────────────────────────────────────────────────────────────────────────── */

/** A card in the "human limit at the inspection frame" grid. */
export interface ProblemItem {
  /** Stable key. Also used as the React list key — never reuse or renumber. */
  id: string
  title: string
  description: string
  iconName: ProblemIconName
}

/** One row of the conventional-machine vs FABINS-retrofit comparison table. */
export interface AboutComparison {
  /** Row label, e.g. "Investment". */
  dimension: string
  /** Short verdict for the conventional column. */
  conventional: string
  /** Supporting sentence under the conventional verdict. */
  conventionalDetail: string
  /** Short verdict for the FABINS column. */
  fabins: string
  /** Supporting sentence under the FABINS verdict. */
  fabinsDetail: string
}

/** One card in the inspection-pipeline carousel. */
export interface SystemPipelineStep {
  /** 1-based position, rendered as "Step 01". Keep sequential and gap-free. */
  stepNumber: number
  title: string
  description: string
}

/** One of the four hardware capability cards. */
export interface SystemHardwarePillar {
  /**
   * Stable key. `SystemSection` maps this id to an icon, so renaming it
   * requires updating `PILLAR_ICONS` there — the type checker will tell you.
   */
  id: HardwarePillarId
  title: string
  /** Accent-coloured line under the title. */
  headline: string
  /** Short spec shown in the chip, e.g. "8192px Line Rate". */
  spec: string
  description: string
}

/** A Four-Point penalty band. */
export interface StandardsRule {
  /** Penalty awarded, e.g. "2 Points". */
  points: string
  /** Defect length band this penalty applies to. */
  size: string
  desc: string
  tone: Tone
}

/** An entry in the interactive defect explainer. */
export interface StandardsDefectExplanation {
  id: string
  name: string
  /** How this defect scores, e.g. "4 Points (Fixed Override)". */
  scoring: string
  /** Plain-language definition, always visible. */
  whatIsIt: string
  /** Measurement method — revealed only when the entry is selected. */
  howCalculated: string
  tone: Tone
}

/** A buyer acceptance band in the grading scale. */
export interface GradeThreshold {
  /** Points-per-100yd² band, e.g. "21 – 40 Pts". */
  range: string
  /** Verdict for the band, e.g. "Grade B (Pass)". */
  label: string
  /** Conventionally `emerald` for pass, `amber` for marginal, `red` for reject. */
  tone: Tone
}

/** One line of the worked roll-scoring example. */
export interface CalculationRow {
  label: string
  value: string
  /**
   * Emphasis for the value. Unlike `Tone` these are semantic weights rather
   * than palette colours — see `CALCULATION_TONES` in `StandardsSection.tsx`.
   */
  emphasis: 'neutral' | 'warning' | 'accent' | 'success'
}

/* ────────────────────────────────────────────────────────────────────────────
   CONTENT
   ──────────────────────────────────────────────────────────────────────────── */

export const FABINS_SYSTEM_DATA = {
  /**
   * ProblemSection — the four cards describing why manual inspection fails.
   * The section renders every entry, so adding a fifth changes the grid. The
   * layout is built for a multiple of four (`lg:grid-cols-4`).
   */
  problemItems: [
    {
      id: 'manual',
      title: 'Manual, Person-Dependent',
      description:
        "Grading still relies on an inspector's eye at the frame - not on installed machine capacity.",
      iconName: 'UserX',
    },
    {
      id: 'fatigue',
      title: 'Fatigue & Monotony',
      description:
        'Long shifts watching moving cloth degrade attention which is a physiological limit, not a discipline issue.',
      iconName: 'Clock',
    },
    {
      id: 'inconsistent',
      title: 'Inconsistent Quality',
      description:
        'Two or more inspectors grade the same roll differently where human error is unavoidable.',
      iconName: 'BarChart2',
    },
    {
      id: 'no-data',
      title: 'Almost No Usable Data',
      description:
        'A tally sheet, not a defect map which is nothing to trace faults back to a machine or batch.',
      iconName: 'Database',
    },
  ] as ProblemItem[],

  /**
   * Written but NOT currently rendered anywhere.
   *
   * These four "why now" points used to sit in `problemItems`, where the section
   * silently dropped them with `.slice(0, 4)` — the copy existed but no visitor
   * ever saw it. They are kept here, separated and labelled, so the intent is
   * explicit rather than hidden behind a slice.
   *
   * TO PUBLISH THEM: render a second grid in `ProblemSection` mapping over
   * `marketDrivers` exactly as it maps over `problemItems`. TO DROP THEM: delete
   * this array — nothing imports it.
   */
  marketDrivers: [
    {
      id: 'global-shift',
      title: 'Global Shift to AI Inspection',
      description: 'Textile manufacturing worldwide is automating quality control with machine vision.',
      iconName: 'Zap',
    },
    {
      id: 'china-moved',
      title: 'China Has Already Moved',
      description: 'Competing manufacturing hubs are already deploying automated inspection at scale.',
      iconName: 'Globe',
    },
    {
      id: 'rmg-pillar',
      title: 'RMG Is a National Pillar',
      description:
        "Ready-made garments are one of Bangladesh's largest export and employment sectors.",
      iconName: 'ShieldAlert',
    },
    {
      id: 'smart-manufacturing',
      title: 'Smart Manufacturing Is Required',
      description: 'To keep global buyers, Bangladesh must adopt AI-driven inspection at pace.',
      iconName: 'Cpu',
    },
  ] as ProblemItem[],

  /** AboutSection — comparison table. Rows render in this order. */
  aboutComparisons: [
    {
      dimension: 'Approach',
      conventional: 'Replace',
      conventionalDetail: 'Replace the complete inspection machine outright',
      fabins: 'Upgrade',
      fabinsDetail: 'Upgrade the existing inspection machine as a retrofit',
    },
    {
      dimension: 'Investment',
      conventional: 'High Capital',
      conventionalDetail: 'New machine purchased outright at high foreign cost',
      fabins: 'Low-Cost Retrofit',
      fabinsDetail: 'Low-cost retrofit integration into existing mill hardware',
    },
    {
      dimension: 'Installation',
      conventional: 'Long Downtime',
      conventionalDetail: 'Long changeover and extended factory commissioning',
      fabins: 'Fast Deployment',
      fabinsDetail: 'Fast deployment with minimal production disruption',
    },
    {
      dimension: 'Support & Fit',
      conventional: 'Vendor-Dependent',
      conventionalDetail: 'Overseas service with high barrier for mid-sized mills',
      fabins: 'Locally Engineered',
      fabinsDetail: 'Locally engineered & supported for local fabrics and specs',
    },
  ] as AboutComparison[],

  /**
   * SystemSection — the pipeline carousel, capture through reporting.
   * Cards are generated from this array, including the "Phase n of N" counter,
   * so adding a step needs no component change.
   */
  pipelineSteps: [
    {
      stepNumber: 1,
      title: 'Camera Captures',
      description: 'High-speed industrial camera captures the full fabric width as it moves.',
    },
    {
      stepNumber: 2,
      title: 'Image Acquisition',
      description:
        'Rotary encoder triggers every image line from actual fabric travel for precise sync.',
    },
    {
      stepNumber: 3,
      title: 'AI Defect Detection',
      description:
        'Deep learning vision model resolves sub-millimeter defects on moving fabric in real time.',
    },
    {
      stepNumber: 4,
      title: 'Classify & Measure (mm)',
      description:
        'Distinguishes holes, joints, oil spots, and measures exact physical size in millimeters.',
    },
    {
      stepNumber: 5,
      title: 'Four-Point Grading',
      description:
        'Applies Four-Point penalty rules automatically, including fixed hole penalty overrides.',
    },
    {
      stepNumber: 6,
      title: 'Report & Dashboard',
      description:
        "Issues mill's own official inspection report format, signed and ready for sign-off.",
    },
  ] as SystemPipelineStep[],

  /**
   * SystemSection — hardware cards.
   * Each `id` must have an icon in `PILLAR_ICONS` in `SystemSection.tsx`.
   */
  hardwarePillars: [
    {
      id: 'camera',
      title: 'Industrial Camera',
      headline: 'High-Resolution Color Sensor',
      spec: 'Industrial Grade',
      description:
        'Industrial high-resolution camera capturing the full fabric width with precise optical clarity.',
    },
    {
      id: 'encoder',
      title: 'Lens & Encoder',
      headline: 'Encoder-Triggered Sync',
      spec: 'Rotary Hardware Pulse',
      description:
        'Calibrated optics and rotary hardware encoder synchronized to real-time fabric roll speed.',
    },
    {
      id: 'lighting',
      title: 'Lighting & Conveyor',
      headline: 'Controlled Illumination Rig',
      spec: 'Uniform High-CRI LED',
      description:
        'Uniform high-CRI lighting assembly over a continuous fabric transport rig, eliminating shadows.',
    },
    {
      id: 'software',
      title: 'AI Software & Dashboard',
      headline: 'Browser Operator Interface',
      spec: 'Real-Time Pipeline',
      description:
        'Real-time defect scoring and digital audit reporting with live operator dashboards.',
    },
  ] as SystemHardwarePillar[],

  /** StandardsSection — the four ASTM D5430 penalty bands. */
  standardsRules: [
    {
      points: '1 Point',
      size: 'Up to 3 inches (75 mm)',
      desc: 'Minor defect or short localized yarn imperfection.',
      tone: 'blue',
    },
    {
      points: '2 Points',
      size: '3 to 6 inches (75 – 150 mm)',
      desc: 'Medium imperfection extending across several warp/weft yarns.',
      tone: 'amber',
    },
    {
      points: '3 Points',
      size: '6 to 9 inches (150 – 230 mm)',
      desc: 'Major imperfection affecting fabric appearance or strength.',
      tone: 'orange',
    },
    {
      points: '4 Points',
      size: 'Over 9 inches (230 mm+) or Holes',
      desc: 'Critical defect or any physical hole/tear regardless of size.',
      tone: 'red',
    },
  ] as StandardsRule[],

  /**
   * StandardsSection — the interactive defect list.
   * The first entry is selected on load.
   */
  standardsDefects: [
    {
      id: 'hole',
      name: 'Hole / Physical Tear',
      scoring: '4 Points (Fixed Override)',
      whatIsIt:
        'A rupture or missing warp/weft yarns caused by needle breakage, sharp objects, or loom friction.',
      howCalculated:
        'Under ASTM D5430, any physical hole or tear automatically receives a maximum 4-point penalty, regardless of how small its diameter is.',
      tone: 'red',
    },
    {
      id: 'slub',
      name: 'Yarn Slub / Thick Place',
      scoring: '1 – 2 Points (By Length)',
      whatIsIt:
        'An abnormal yarn thickening or lump that creates a visible streak across the woven or knitted surface.',
      howCalculated:
        'Sized in millimeters by high-speed vision cameras. Slubs under 75mm score 1 point; slubs between 75mm–150mm score 2 points.',
      tone: 'amber',
    },
    {
      id: 'oil',
      name: 'Machine Oil Stain',
      scoring: '1 – 3 Points (By Size)',
      whatIsIt:
        'Dark lubricant drops transferred onto the cloth from high-speed loom bearings or weaving machinery.',
      howCalculated:
        'Evaluated by physical area and contrast under calibrated high-CRI lighting. Small spots score 1 point; larger streaks score 2–3 points.',
      tone: 'orange',
    },
    {
      id: 'shading',
      name: 'Color Shade Variation',
      scoring: '3 Points (Per Meter)',
      whatIsIt:
        'Uneven dye absorption or tone banding resulting in visible side-to-center or end-to-end color mismatch.',
      howCalculated:
        'Detected via multispectral camera sensors. Assigned 3 points per affected meter of fabric roll length.',
      tone: 'purple',
    },
    {
      id: 'needle',
      name: 'Needle Line / Drop Stitch',
      scoring: '2 – 4 Points (Continuous)',
      whatIsIt:
        'A continuous vertical stripe or missing loop caused by a bent or broken needle on knitting cylinders.',
      howCalculated:
        'Measured along the continuous defect run. Scored per linear segment according to length thresholds.',
      tone: 'cyan',
    },
  ] as StandardsDefectExplanation[],

  /**
   * StandardsSection — buyer acceptance scale.
   * Rendered as a three-column strip, so keep this at three entries unless you
   * also change `grid-cols-3` in the section.
   */
  gradeThresholds: [
    { range: '0 – 20 Pts', label: 'Grade A (Pass)', tone: 'emerald' },
    { range: '21 – 40 Pts', label: 'Grade B (Pass)', tone: 'amber' },
    { range: '> 40 Pts', label: 'REJECT / Cut', tone: 'red' },
  ] as GradeThreshold[],

  /**
   * StandardsSection — the worked example shown under the formula.
   *
   * These numbers are illustrative but must stay internally consistent:
   * (7 points × 3,600) ÷ (100 yd × 60 in) = 4.2, which passes the 40-point
   * limit set by `gradeThresholds` above. If you change the roll spec or the
   * defect count, recompute the last two rows by hand — nothing validates them.
   *
   * The final row is rendered without a separator, so keep the conclusion last.
   */
  rollCalculation: [
    {
      label: 'Fabric Roll Spec:',
      value: '100 Yards Length × 60 Inches Width',
      emphasis: 'neutral',
    },
    {
      label: 'Defects Found:',
      value: '3 Slubs (3 pts) + 1 Hole (4 pts) = 7 Pts',
      emphasis: 'warning',
    },
    {
      label: 'Formula Output:',
      value: '(7 × 3,600) ÷ (100 × 60) = 4.2 Pts',
      emphasis: 'accent',
    },
    {
      label: 'Acceptance Result:',
      value: 'PASS (Grade A · Limit: 40 pts)',
      emphasis: 'success',
    },
  ] as CalculationRow[],
}