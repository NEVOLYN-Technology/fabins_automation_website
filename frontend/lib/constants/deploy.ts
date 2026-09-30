import type { DeploymentRequest } from '@/lib/api/contact'

export type FormStatus = 'editing' | 'previewing' | 'sending' | 'submitted'

export const EMPTY_FORM: DeploymentRequest = {
  millName: '',
  contactName: '',
  designation: '',
  email: '',
  phone: '',
  location: '',
  machineBrand: '',
  factoryType: '',
  inspectionFramesCount: '1 Frame (Pilot)',
  fabricTypes: '',
  dailyProductionVolume: '',
  inspectionSpeed: '',
  rollWidth: '',
  defectTypes: '',
  erpIntegrationNeeded: '',
  targetTimeline: '',
  message: '',
}

export const FACTORY_TYPES = [
  'Knit Fabric Mill',
  'Woven Textile Mill',
  'Denim Manufacturing',
  'Dyeing & Finishing',
  'Garments Facility',
  'Other',
] as const

export const FRAME_COUNTS = [
  '1 Frame (Pilot)',
  '2 - 5 Frames',
  '6 - 10 Frames',
  '10+ Frames (Full Mill)',
] as const

export const ROLL_WIDTHS = [
  '60 inches (152 cm)',
  '72 inches (182 cm)',
  '90 inches (228 cm)',
  '120+ inches',
  'Custom Width',
] as const

export const SPEED_OPTIONS = [
  '15 - 25 m/min',
  '25 - 35 m/min',
  '35 - 50 m/min',
  '50+ m/min',
] as const

export const TIMELINE_OPTIONS = [
  'Immediate (< 30 Days)',
  '1 - 3 Months',
  '3 - 6 Months',
  'Planning Stage',
] as const

export const ERP_OPTIONS = [
  'FastReact / Coats Digital',
  'SAP S/4HANA',
  'Oracle NetSuite',
  'In-House ERP',
  'None / Standalone',
] as const

export const COMMON_DEFECTS = [
  'Holes & Tears',
  'Oil & Dirt Stains',
  'Slubs & Thick Threads',
  'Yarn Breaks / Drop Stitches',
  'Shade & Color Spots',
  'Missing Warp / Weft',
  'Crease Marks',
] as const

export const QUICK_INSTRUCTIONS = [
  'Need night-shift deployment window',
  'High Lycra / elastane tension variation',
  'Existing frames equipped with rotary encoder',
  'Require direct FastReact ERP data feed',
] as const

export function formatSectorSummary(val?: string): string {
  if (!val) return 'Pending'
  if (val.startsWith('Other: ') && val.length > 7) return val.slice(7)
  if (val.includes('Knit')) return 'Knit Mill'
  if (val.includes('Woven')) return 'Woven Mill'
  if (val.includes('Denim')) return 'Denim'
  if (val.includes('Dyeing')) return 'Dyeing & Finish'
  if (val.includes('Garments')) return 'Garments'
  return val
}

export function formatFrameSummary(val?: string): string {
  if (!val) return '1 Frame'
  return val.replace(' (Pilot)', '').replace(' (Full Mill)', '')
}

export function formatWidthSummary(val?: string): string {
  if (!val) return 'Not Set'
  if (val === 'Custom Width') return 'Custom'
  if (val.startsWith('Custom: ') && val.length > 8) return val.slice(8)
  return val.replace(' inches', '"').replace(' cm', 'cm')
}

export function formatSpeedSummary(val?: string): string {
  if (!val) return 'Not Set'
  return val.replace(' - ', '-')
}
