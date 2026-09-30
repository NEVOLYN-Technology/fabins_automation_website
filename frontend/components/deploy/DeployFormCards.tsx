'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  Factory,
  Mail,
  Phone,
  MapPin,
  User,
  Cpu,
  ShieldCheck,
  Send,
  CornerDownLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeploymentRequest } from '@/lib/api/contact'
import {
  FACTORY_TYPES,
  ROLL_WIDTHS,
} from '@/lib/constants/deploy'

import { FabinsLogo } from '@/components/ui/FabinsLogo'

interface DeployFormCardsProps {
  formData: DeploymentRequest
  updateField: (
    field: keyof DeploymentRequest
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  setFieldValue: (field: keyof DeploymentRequest, value: string, toggle?: boolean) => void
  selectedDefects?: string[]
  toggleDefect?: (defect: string) => void
  selectAllDefects?: () => void
  isSending: boolean
}

export function DeployFormCards({
  formData,
  updateField,
  setFieldValue,
  selectedDefects,
  toggleDefect,
  selectAllDefects,
  isSending,
}: DeployFormCardsProps) {
  const [isEditingOtherSector, setIsEditingOtherSector] = useState(false)
  const [otherSectorInput, setOtherSectorInput] = useState('')

  const [isEditingCustomWidth, setIsEditingCustomWidth] = useState(false)
  const [customWidthInput, setCustomWidthInput] = useState('')

  useEffect(() => {
    if (formData.factoryType?.startsWith('Other: ')) {
      setOtherSectorInput(formData.factoryType.slice(7))
    }
  }, [formData.factoryType])

  useEffect(() => {
    if (formData.rollWidth?.startsWith('Custom: ')) {
      setCustomWidthInput(formData.rollWidth.slice(8))
    }
  }, [formData.rollWidth])

  return (
    <fieldset disabled={isSending} className="space-y-6 sm:space-y-7">
      {/* ─────────────────────────────────────────────────────────────
          TOP MIDDLE: FABINS & NEVOLYN Official Brand Lockup
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Brand Card in Middle: horizontally spread and wider than below text in web */}
        <div className="inline-flex w-full max-w-md sm:max-w-none sm:w-auto sm:min-w-[460px] md:min-w-[500px] items-center justify-between gap-3 sm:gap-6 rounded-xl sm:rounded-2xl border border-line-strong/60 bg-surface/90 px-3.5 sm:px-6 md:px-8 py-2 sm:py-2.5 shadow-xs backdrop-blur-md">
          {/* Left: FABINS Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-left">
            <FabinsLogo className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-extrabold tracking-tight text-[15px] sm:text-base text-ink">
                FAB<span className="text-accent">INS</span>
              </span>
              <span className="mt-0.5 block font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.08em] sm:tracking-[0.10em] text-ink-soft whitespace-nowrap">
                Fabric Inspection Automation
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-7 sm:h-8 w-px bg-line-strong shrink-0" />

          {/* Right: NEVOLYN Brand with Logo, Stacked 'POWERED BY', Hyperlinked to nevolyn.com */}
          <a
            href="https://nevolyn.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit NEVOLYN Technology (nevolyn.com)"
            className="group flex flex-col items-start justify-center leading-none text-left no-underline cursor-pointer select-none shrink-0"
          >
            <span className="text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-[0.14em] text-ink-muted group-hover:text-ink transition-colors whitespace-nowrap">
              POWERED BY
            </span>
            <span className="mt-1 flex items-center gap-1 sm:gap-1.5">
              <img
                src="/nevolyn-icon.png"
                alt="NEVOLYN"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain shrink-0 transition-transform group-hover:scale-105"
              />
              <span className="font-heading font-black text-xs sm:text-sm tracking-wider text-accent group-hover:text-accent-hover transition-colors">
                NEVOLYN
              </span>
            </span>
          </a>
        </div>

        {/* Text directly below brand card: single line on mobile & web without overflowing */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] min-[380px]:text-[11px] sm:text-xs text-ink-muted font-medium max-w-full px-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="whitespace-nowrap shrink-0">
            <span className="hidden sm:inline">Official </span>
            <span>Technical Assessment</span>
          </span>
          <span className="text-line-strong shrink-0">&bull;</span>
          <span className="text-ink-soft whitespace-nowrap shrink-0">
            <span className="hidden sm:inline">Dispatch: </span>
            <strong className="text-accent font-semibold">fabins@nevolyn.com</strong>
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Mill Credentials & Representative Information
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl border border-line/90 bg-panel p-4 sm:p-6 shadow-xs">
        {/* Side-by-Side: Mill Profile & Technical Representative (1 col mobile, 2 col web) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Column 1A: Mill Profile */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-3">
              <Building2 className="h-4 w-4" />
              <span>Mill / Factory Profile</span>
            </div>

            <div className="space-y-4">
              {/* Field 1: Mill Name */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Mill / Factory Name <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.millName}
                    onChange={updateField('millName')}
                    placeholder="e.g. Apex Spinning Mills Ltd."
                    className="input-field pl-10 text-base sm:text-sm truncate placeholder:truncate"
                  />
                  <Factory className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Machine Brand */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Machine Brand <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.machineBrand || ''}
                    onChange={updateField('machineBrand')}
                    placeholder="e.g. Winda, Bianco, Lafer"
                    className="input-field pl-10 text-base sm:text-sm truncate placeholder:truncate"
                  />
                  <Cpu className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted pointer-events-none" />
                </div>
              </div>

              {/* Field 3: Factory Location */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Location / Zone <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={updateField('location')}
                    placeholder="e.g. Board Bazar, Gazipur"
                    className="input-field pl-10 text-base sm:text-sm truncate placeholder:truncate"
                  />
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Column 1B: Technical Representative */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-3">
              <User className="h-4 w-4" />
              <span>Technical Representative</span>
            </div>

            <div className="space-y-4">
              {/* Field 1: Contact Name */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Name <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={updateField('contactName')}
                    placeholder="e.g. Md. Rahim Ahmed"
                    className="input-field pl-10 text-base sm:text-sm truncate placeholder:truncate"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Work Email */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Email <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={updateField('email')}
                    placeholder="e.g. rahim@apextextiles.com"
                    className="input-field pl-10 text-base sm:text-sm truncate placeholder:truncate"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted pointer-events-none" />
                </div>
              </div>

              {/* Field 3: Direct Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Phone / WhatsApp <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={updateField('phone')}
                    placeholder="e.g. +880 1700-000000"
                    className="input-field pl-10 text-base sm:text-sm truncate placeholder:truncate"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Machine Specifications & Fabric Dimensions
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-line/90 bg-panel p-5 sm:p-6 shadow-xs">
        {/* Side-by-Side: Sector & Roll Width (1 col mobile, 2 col web) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Column 2A: Factory Sector / Operation Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-3">
              <Factory className="h-4 w-4" />
              <span>Factory / Operation Type</span>
            </div>

            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {FACTORY_TYPES.map((type) => {
                  const isOther = type === 'Other'
                  const hasCustomOther = Boolean(formData.factoryType?.startsWith('Other: '))
                  const active = isOther
                    ? Boolean(
                      formData.factoryType === 'Other' ||
                      formData.factoryType?.startsWith('Other:')
                    )
                    : formData.factoryType === type

                  if (isOther && isEditingOtherSector) {
                    return (
                      <div
                        key={type}
                        className="relative flex items-center w-full min-h-[46px] sm:min-h-[48px] rounded-xl border-2 border-accent bg-panel-2 px-2 py-1 shadow-sm ring-2 ring-accent/30"
                      >
                        <input
                          type="text"
                          value={otherSectorInput}
                          onChange={(e) => setOtherSectorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              const val = otherSectorInput.trim()
                              if (val) {
                                setFieldValue('factoryType', `Other: ${val}`, false)
                              } else {
                                setFieldValue('factoryType', '', false)
                              }
                              setIsEditingOtherSector(false)
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              setIsEditingOtherSector(false)
                            }
                          }}
                          onBlur={() => {
                            const val = otherSectorInput.trim()
                            if (val) {
                              setFieldValue('factoryType', `Other: ${val}`, false)
                            }
                            setIsEditingOtherSector(false)
                          }}
                          placeholder="Write & Enter..."
                          autoFocus
                          className="w-full bg-transparent text-[11px] sm:text-xs font-bold text-accent placeholder:text-ink-muted/50 focus:outline-hidden pr-5 truncate"
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            const val = otherSectorInput.trim()
                            if (val) {
                              setFieldValue('factoryType', `Other: ${val}`, false)
                            } else {
                              setFieldValue('factoryType', '', false)
                            }
                            setIsEditingOtherSector(false)
                          }}
                          title="Save (Press Enter)"
                          className="absolute right-1.5 flex items-center justify-center h-5 w-5 rounded-md bg-accent text-white hover:bg-accent-bright transition-colors cursor-pointer"
                        >
                          <CornerDownLeft className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        if (isOther) {
                          setOtherSectorInput(
                            formData.factoryType?.startsWith('Other: ')
                              ? formData.factoryType.slice(7)
                              : ''
                          )
                          setIsEditingOtherSector(true)
                        } else {
                          setIsEditingOtherSector(false)
                          setFieldValue('factoryType', type)
                        }
                      }}
                      className={cn(
                        'rounded-xl px-1.5 sm:px-2 py-2 text-[10.5px] min-[400px]:text-[11px] sm:text-xs font-bold transition-all border cursor-pointer active:scale-95 text-center flex items-center justify-center min-h-[46px] sm:min-h-[48px] whitespace-normal leading-tight break-words',
                        active
                          ? 'border-accent bg-accent-quiet text-accent shadow-sm ring-2 ring-accent/30'
                          : 'border-line bg-panel-2 text-ink-muted hover:border-line-strong hover:text-ink'
                      )}
                      title={isOther && active ? 'Click to edit custom sector' : undefined}
                    >
                      <span className="inline-block w-full text-center leading-tight whitespace-normal break-words">
                        {active ? '✓ ' : ''}
                        {isOther && hasCustomOther
                          ? formData.factoryType?.slice(7)
                          : type}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Column 2B: Roll / Table Width */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-3">
              <Cpu className="h-4 w-4" />
              <span>Roll / Table Width</span>
            </div>

            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {ROLL_WIDTHS.map((width) => {
                  const isCustom = width === 'Custom Width'
                  const hasCustomWidth = Boolean(formData.rollWidth?.startsWith('Custom: '))
                  const active = isCustom
                    ? Boolean(
                      formData.rollWidth === 'Custom Width' ||
                      formData.rollWidth?.startsWith('Custom:') ||
                      formData.rollWidth?.startsWith('Custom Width:')
                    )
                    : formData.rollWidth === width

                  if (isCustom && isEditingCustomWidth) {
                    return (
                      <div
                        key={width}
                        className="relative flex items-center w-full min-h-[46px] sm:min-h-[48px] rounded-xl border-2 border-accent bg-panel-2 px-2 py-1 shadow-sm ring-2 ring-accent/30"
                      >
                        <input
                          type="text"
                          value={customWidthInput}
                          onChange={(e) => setCustomWidthInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              const val = customWidthInput.trim()
                              if (val) {
                                setFieldValue('rollWidth', `Custom: ${val}`, false)
                              } else {
                                setFieldValue('rollWidth', '', false)
                              }
                              setIsEditingCustomWidth(false)
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              setIsEditingCustomWidth(false)
                            }
                          }}
                          onBlur={() => {
                            const val = customWidthInput.trim()
                            if (val) {
                              setFieldValue('rollWidth', `Custom: ${val}`, false)
                            }
                            setIsEditingCustomWidth(false)
                          }}
                          placeholder="Write & Enter..."
                          autoFocus
                          className="w-full bg-transparent text-[11px] sm:text-xs font-bold text-accent placeholder:text-ink-muted/50 focus:outline-hidden pr-5 truncate"
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            const val = customWidthInput.trim()
                            if (val) {
                              setFieldValue('rollWidth', `Custom: ${val}`, false)
                            } else {
                              setFieldValue('rollWidth', '', false)
                            }
                            setIsEditingCustomWidth(false)
                          }}
                          title="Save (Press Enter)"
                          className="absolute right-1.5 flex items-center justify-center h-5 w-5 rounded-md bg-accent text-white hover:bg-accent-bright transition-colors cursor-pointer"
                        >
                          <CornerDownLeft className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={width}
                      type="button"
                      onClick={() => {
                        if (isCustom) {
                          setCustomWidthInput(
                            formData.rollWidth?.startsWith('Custom: ')
                              ? formData.rollWidth.slice(8)
                              : ''
                          )
                          setIsEditingCustomWidth(true)
                        } else {
                          setIsEditingCustomWidth(false)
                          setFieldValue('rollWidth', width)
                        }
                      }}
                      className={cn(
                        'rounded-xl px-1.5 sm:px-2 py-2 text-[10.5px] min-[400px]:text-[11px] sm:text-xs font-bold transition-all border cursor-pointer active:scale-95 text-center flex items-center justify-center min-h-[46px] sm:min-h-[48px] whitespace-normal leading-tight break-words',
                        active
                          ? 'border-accent bg-accent-quiet text-accent shadow-sm ring-2 ring-accent/30'
                          : 'border-line bg-panel-2 text-ink-muted hover:border-line-strong hover:text-ink'
                      )}
                      title={isCustom && active ? 'Click to edit custom width' : undefined}
                    >
                      <span className="inline-block w-full text-center leading-tight whitespace-normal break-words">
                        {active ? '✓ ' : ''}
                        {isCustom && hasCustomWidth
                          ? formData.rollWidth?.slice(8)
                          : width}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Bar: same line in mobile and web */}
      <div className="pt-4 border-t border-line flex flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] min-[400px]:text-[11px] sm:text-xs text-ink-soft leading-tight">
          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
          <span>
            <span className="hidden min-[480px]:inline">Protected under mutual industrial </span>
            <span className="min-[480px]:hidden">Protected under </span>
            <span className="font-medium">NDA</span>
            <span className="hidden min-[480px]:inline"> Agreement</span>.
          </span>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className={cn(
            'btn btn-primary shrink-0 px-3.5 py-2.5 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-bold shadow-md rounded-xl cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap',
            isSending && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isSending ? (
            <>
              <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              <span>Registering...</span>
            </>
          ) : (
            <>
              <span className="hidden min-[480px]:inline">Submit Deployment Assessment</span>
              <span className="min-[480px]:hidden">Submit Assessment</span>
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            </>
          )}
        </button>
      </div>
    </fieldset>
  )
}
