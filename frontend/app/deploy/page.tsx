'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Cpu,
  Factory,
  Layers,
  MapPin,
  Send,
  Sparkles,
  Sliders,
  User,
  Zap,
  FileCheck2,
  Phone,
  Mail,
  Briefcase,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { submitDeploymentRequest, type DeploymentRequest } from '@/lib/api/contact'
import { cn } from '@/lib/utils'

type FormStatus = 'editing' | 'sending' | 'submitted'

const EMPTY_FORM: DeploymentRequest = {
  millName: '',
  contactName: '',
  designation: '',
  email: '',
  phone: '',
  location: '',
  factoryType: '',
  inspectionFramesCount: '',
  fabricTypes: '',
  dailyProductionVolume: '',
  inspectionSpeed: '',
  rollWidth: '',
  defectTypes: '',
  erpIntegrationNeeded: '',
  targetTimeline: '',
  message: '',
}

const FACTORY_TYPES = [
  'Knit Fabric Mill',
  'Woven Textile Mill',
  'Denim Manufacturing',
  'Dyeing & Finishing Unit',
  'Garments Facility',
  'Other',
]

const FRAME_COUNTS = [
  '1 Frame (Pilot)',
  '2 - 5 Frames',
  '6 - 10 Frames',
  '10+ Frames (Full Mill)',
]

const ROLL_WIDTHS = [
  '60 inches (152 cm)',
  '72 inches (182 cm)',
  '90 inches (228 cm)',
  '120+ inches',
  'Custom Width',
]

const SPEED_OPTIONS = [
  '15 - 25 m/min',
  '25 - 35 m/min',
  '35 - 50 m/min',
  '50+ m/min',
]

const TIMELINE_OPTIONS = [
  'Immediate (< 30 Days)',
  '1 - 3 Months',
  '3 - 6 Months',
  'Planning Stage',
]

const ERP_OPTIONS = [
  'FastReact / Coats Digital',
  'SAP S/4HANA',
  'Oracle NetSuite',
  'In-House ERP',
  'None / Standalone',
]

const COMMON_DEFECTS = [
  'Holes & Tears',
  'Oil & Dirt Stains',
  'Slubs & Thick Threads',
  'Yarn Breaks / Drop Stitches',
  'Shade & Color Spots',
  'Missing Warp / Weft',
  'Crease Marks',
]

export default function DeployPage() {
  const router = useRouter()
  const [status, setStatus] = useState<FormStatus>('editing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<DeploymentRequest>(EMPTY_FORM)
  const [factoryEmail, setFactoryEmail] = useState<string>('')
  const [factoryPhone, setFactoryPhone] = useState<string>('')
  const [referenceCode, setReferenceCode] = useState<string>('')
  const [selectedDefects, setSelectedDefects] = useState<string[]>([])

  const updateField =
    (field: keyof DeploymentRequest) =>
      (
        event: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) =>
        setFormData((prev) => ({ ...prev, [field]: event.target.value }))

  const setFieldValue = (field: keyof DeploymentRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] === value ? '' : value,
    }))
  }

  const toggleDefect = (defect: string) => {
    setSelectedDefects((prev) => {
      const next = prev.includes(defect)
        ? prev.filter((d) => d !== defect)
        : [...prev, defect]
      setFormData((f) => ({ ...f, defectTypes: next.join(', ') }))
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!formData.millName?.trim()) {
      setErrorMessage('Please enter your Mill / Factory Name.')
      return
    }
    if (!factoryEmail?.trim()) {
      setErrorMessage('Please enter the Factory Official Email Address.')
      return
    }
    if (!factoryPhone?.trim()) {
      setErrorMessage('Please enter the Factory Phone / Landline Number.')
      return
    }
    if (!formData.location?.trim()) {
      setErrorMessage('Please enter the Factory Physical Address & Location.')
      return
    }
    if (!formData.contactName?.trim()) {
      setErrorMessage('Please enter Contact Person Name.')
      return
    }
    if (!formData.designation?.trim()) {
      setErrorMessage('Please enter Designation / Job Role.')
      return
    }
    if (!formData.email?.trim()) {
      setErrorMessage('Please enter Personal Work Email Address.')
      return
    }
    if (!formData.phone?.trim()) {
      setErrorMessage('Please enter Direct Phone / WhatsApp Number.')
      return
    }
    if (!formData.factoryType) {
      setErrorMessage('Please select a Factory Sector / Operation Type.')
      return
    }
    if (!formData.rollWidth) {
      setErrorMessage('Please select Roll / Table Width.')
      return
    }
    if (!formData.inspectionSpeed) {
      setErrorMessage('Please select Target Inspection Speed.')
      return
    }
    if (selectedDefects.length === 0) {
      setErrorMessage('Please select at least one Priority Defect Category.')
      return
    }
    if (!formData.targetTimeline) {
      setErrorMessage('Please select a Target Implementation Timeline.')
      return
    }
    if (!formData.message?.trim()) {
      setErrorMessage('Please provide General Instructions & Requirements.')
      return
    }

    setStatus('sending')

    const finalLocation = [
      formData.location,
      factoryEmail ? `Factory Email: ${factoryEmail}` : '',
      factoryPhone ? `Factory Phone: ${factoryPhone}` : '',
    ]
      .filter(Boolean)
      .join(' | ')

    const payload: DeploymentRequest = {
      ...formData,
      location: finalLocation,
      defectTypes: selectedDefects.join(', '),
    }

    const result = await submitDeploymentRequest(payload)

    if (result.ok) {
      setReferenceCode(result.referenceCode || 'FAB-2026-REGISTERED')
      setStatus('submitted')
      setFormData(EMPTY_FORM)
      setFactoryEmail('')
      setFactoryPhone('')
    } else {
      setStatus('editing')
      setErrorMessage(result.error)
    }
  }

  const isSending = status === 'sending'

  return (
    <PageShell>
      <div className="relative pt-24 pb-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2.5 rounded-full border border-line-strong/60 bg-panel px-5 py-2.5 text-sm font-bold text-ink transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-md mb-8 group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Go Back</span>
          </button>

          {/* Page Banner Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-quiet px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-4">
              <Sparkles className="h-4 w-4" />
              Deploy <span className="text-gradient">FABINS</span> in Your Mill
            </div>
            <p className="mt-4 text-sm sm:text-base text-ink-muted leading-relaxed max-w-xl mx-auto">
              Complete this technical assessment form. Our engineering team will evaluate your frame specifications and follow up with a deployment plan.
            </p>
          </div>

          {/* Form Container / Submitted State */}
          <AnimatePresence mode="wait">
            {status === 'submitted' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="mx-auto max-w-2xl rounded-3xl border border-accent/40 bg-panel/90 p-8 sm:p-12 shadow-[0_25px_60px_-15px_rgba(8,145,178,0.3)] text-center backdrop-blur-xl"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent ring-8 ring-accent/10">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-ink font-heading">
                  Assessment Request Registered!
                </h2>

                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-quiet px-4 py-2 text-sm font-mono font-bold text-accent">
                  Tracking Reference: {referenceCode}
                </div>

                <p className="mt-6 text-sm leading-relaxed text-ink-muted">
                  Thank you for submitting your mill specifications. Your request has been queued in Saturn R&amp;D Laboratory.
                  An engineering specialist will review your frame counts, fabric speeds, and inspection table dimensions.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left rounded-2xl border border-line bg-panel-2 p-5 text-xs text-ink-soft">
                  <div className="flex gap-3">
                    <FileCheck2 className="h-5 w-5 text-accent shrink-0" />
                    <div>
                      <strong className="block text-ink font-semibold">Confirmation Dispatched</strong>
                      A confirmation email with your request details has been sent to your inbox.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-accent shrink-0" />
                    <div>
                      <strong className="block text-ink font-semibold">Technical Follow-up</strong>
                      Our engineers will contact you within 24-48 hours.
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setStatus('editing')}
                    className="btn btn-secondary text-sm"
                  >
                    Submit Another Request
                  </button>
                  <Link href="/" className="btn btn-primary text-sm">
                    Return to Homepage
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="rounded-3xl border border-line bg-panel/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8"
              >
                <fieldset disabled={isSending} className="space-y-8">
                  {/* CARD 1: Mill Credentials & Representative Information */}
                  <div className="rounded-2xl border border-line bg-panel p-6 space-y-6 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-line pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-quiet text-accent border border-accent/20">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink font-heading">
                          1. Factory &amp; Representative Credentials
                        </h3>
                        <p className="text-xs text-ink-muted">
                          Official factory information and technical representative contact details.
                        </p>
                      </div>
                    </div>

                    {/* Side-by-side grid on desktop (lg:grid-cols-2), single column on mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* SUB-SECTION 1A: Factory Information (4 Fields) */}
                      <div className="space-y-4 rounded-xl border border-line/60 bg-surface/60 p-4.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line/50 pb-2">
                          <Factory className="h-4 w-4" />
                          <span>Factory &amp; Organization Details</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3.5">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Mill / Factory Name <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={formData.millName}
                                onChange={updateField('millName')}
                                placeholder="e.g. Apex Spinning & Knitting Mills Ltd."
                                className="input-field pl-10 text-sm"
                              />
                              <Factory className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Factory Official Email Address <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                required
                                value={factoryEmail}
                                onChange={(e) => setFactoryEmail(e.target.value)}
                                placeholder="e.g. info@apextextiles.com"
                                className="input-field pl-10 text-sm"
                              />
                              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Factory Desk / Landline Phone <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                required
                                value={factoryPhone}
                                onChange={(e) => setFactoryPhone(e.target.value)}
                                placeholder="e.g. +880 2-9900000 / PABX"
                                className="input-field pl-10 text-sm"
                              />
                              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Factory Physical Address &amp; Location <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={formData.location || ''}
                                onChange={updateField('location')}
                                placeholder="e.g. Plot 42, Board Bazar, Gazipur, Dhaka"
                                className="input-field pl-10 text-sm"
                              />
                              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SUB-SECTION 1B: Contact Representative Details (4 Fields) */}
                      <div className="space-y-4 rounded-xl border border-line/60 bg-surface/60 p-4.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line/50 pb-2">
                          <User className="h-4 w-4" />
                          <span>Technical Representative Contact Person</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3.5">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Contact Person Name <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={formData.contactName}
                                onChange={updateField('contactName')}
                                placeholder="e.g. Engr. Md. Rahim Ahmed"
                                className="input-field pl-10 text-sm"
                              />
                              <User className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Designation / Job Role <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={formData.designation || ''}
                                onChange={updateField('designation')}
                                placeholder="e.g. General Manager, QA / Director"
                                className="input-field pl-10 text-sm"
                              />
                              <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Email Address <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={updateField('email')}
                                placeholder="e.g. rahim.qa@apextextiles.com"
                                className="input-field pl-10 text-sm"
                              />
                              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                              Phone Number <span className="text-accent">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                required
                                value={formData.phone || ''}
                                onChange={updateField('phone')}
                                placeholder="e.g. +880 1700-000000"
                                className="input-field pl-10 text-sm"
                              />
                              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Operations & Frame Setup */}
                  <div className="rounded-2xl border border-line/80 bg-surface/50 p-6 space-y-5">
                    <div className="flex items-center gap-3 border-b border-line pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-quiet text-accent border border-accent/20">
                        <Sliders className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink font-heading">
                          2. Mill Operations &amp; Machine Setup
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Select your machine layout and operational parameters.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Operation Type Pills */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                          Factory Sector / Operation Type <span className="text-accent">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {FACTORY_TYPES.map((type) => {
                            const active = formData.factoryType === type
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFieldValue('factoryType', type)}
                                className={cn(
                                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border cursor-pointer',
                                  active
                                    ? 'border-accent bg-accent-quiet text-accent shadow-sm ring-1 ring-accent/30'
                                    : 'border-line bg-panel-2 text-ink-muted hover:border-line-strong hover:text-ink'
                                )}
                              >
                                {active ? '✓ ' : ''}{type}
                              </button>
                            )
                          })}
                        </div>
                      </div>


                      {/* Roll Width & Inspection Speed Pills */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                            Roll / Table Width <span className="text-accent">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {ROLL_WIDTHS.map((width) => {
                              const active = formData.rollWidth === width
                              return (
                                <button
                                  key={width}
                                  type="button"
                                  onClick={() => setFieldValue('rollWidth', width)}
                                  className={cn(
                                    'rounded-full px-3 py-1 text-xs font-semibold transition-all border cursor-pointer',
                                    active
                                      ? 'border-accent bg-accent-quiet text-accent shadow-sm ring-1 ring-accent/30'
                                      : 'border-line bg-panel-2 text-ink-muted hover:border-line-strong hover:text-ink'
                                  )}
                                >
                                  {active ? '✓ ' : ''}{width}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                            Target Inspection Speed <span className="text-accent">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {SPEED_OPTIONS.map((spd) => {
                              const active = formData.inspectionSpeed === spd
                              return (
                                <button
                                  key={spd}
                                  type="button"
                                  onClick={() => setFieldValue('inspectionSpeed', spd)}
                                  className={cn(
                                    'rounded-full px-3 py-1 text-xs font-semibold transition-all border cursor-pointer',
                                    active
                                      ? 'border-accent bg-accent-quiet text-accent shadow-sm ring-1 ring-accent/30'
                                      : 'border-line bg-panel-2 text-ink-muted hover:border-line-strong hover:text-ink'
                                  )}
                                >
                                  {active ? '✓ ' : ''}{spd}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* CARD 3: Inspection Focus & Software Integration */}
                  <div className="rounded-2xl border border-line/80 bg-surface/50 p-6 space-y-5">
                    <div className="flex items-center gap-3 border-b border-line pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-quiet text-accent border border-accent/20">
                        <Cpu className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink font-heading">
                          3. Defect Priorities &amp; Timeline
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Select priority defect categories and your target implementation schedule.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Defect Categories */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                          Priority Defect Categories to Detect <span className="text-accent">*</span> (Select all that apply)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_DEFECTS.map((defect) => {
                            const isSelected = selectedDefects.includes(defect)
                            return (
                              <button
                                key={defect}
                                type="button"
                                onClick={() => toggleDefect(defect)}
                                className={cn(
                                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border cursor-pointer',
                                  isSelected
                                    ? 'border-accent bg-accent-quiet text-accent shadow-sm ring-1 ring-accent/30'
                                    : 'border-line bg-panel-2 text-ink-muted hover:border-line-strong'
                                )}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {defect}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Implementation Timeline Pills */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                          Target Implementation Timeline <span className="text-accent">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TIMELINE_OPTIONS.map((tl) => {
                            const active = formData.targetTimeline === tl
                            return (
                              <button
                                key={tl}
                                type="button"
                                onClick={() => setFieldValue('targetTimeline', tl)}
                                className={cn(
                                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border cursor-pointer',
                                  active
                                    ? 'border-accent bg-accent-quiet text-accent shadow-sm ring-1 ring-accent/30'
                                    : 'border-line bg-panel-2 text-ink-muted hover:border-line-strong hover:text-ink'
                                )}
                              >
                                {active ? '✓ ' : ''}{tl}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 4: Additional Notes / Frame Setup */}
                  <div className="rounded-2xl border border-line/80 bg-surface/50 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-line pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-quiet text-accent border border-accent/20">
                        <Layers className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink font-heading">
                          4. General Instructions &amp; Requirements <span className="text-accent">*</span>
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Provide general instructions, custom requests, or operational notes for our engineering team.
                        </p>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      required
                      value={formData.message || ''}
                      onChange={updateField('message')}
                      placeholder="Enter any general instructions, mill notes, lighting preferences, or custom requirements..."
                      className="input-field text-sm leading-relaxed resize-y"
                    />
                  </div>

                  {/* Error display */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-400"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-ink-soft">
                      Submitting triggers reference registration and automated R&amp;D team notification.
                    </p>

                    <button
                      type="submit"
                      disabled={isSending}
                      className={cn(
                        'btn btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold shadow-md',
                        isSending && 'opacity-70 cursor-not-allowed'
                      )}
                    >
                      {isSending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting Request...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Submit Request
                          <Send className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  </div>
                </fieldset>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  )
}
