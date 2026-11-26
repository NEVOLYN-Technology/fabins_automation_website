import type { DeploymentRequest } from '@/lib/api/contact'

export type FormStatus = 'editing' | 'previewing' | 'sending' | 'submitted'

export const EMPTY_FORM: DeploymentRequest = {
  millName: '',
  machineBrand: '',
  location: '',
  contactName: '',
  email: '',
  phone: '',
  factoryType: '',
  rollWidth: '',
}

export const FACTORY_TYPES = [
  'Knit Fabric Mill',
  'Woven Textile Mill',
  'Denim Manufacturing',
  'Dyeing & Finishing',
  'Garments Facility',
  'Other',
] as const

export const ROLL_WIDTHS = [
  '60 inches (152 cm)',
  '72 inches (182 cm)',
  '90 inches (228 cm)',
  '120+ inches',
  'Custom Width',
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

export function formatWidthSummary(val?: string): string {
  if (!val) return 'Not Set'
  if (val === 'Custom Width') return 'Custom'
  if (val.startsWith('Custom: ') && val.length > 8) return val.slice(8)
  return val.replace(' inches', '"').replace(' cm', 'cm')
}
