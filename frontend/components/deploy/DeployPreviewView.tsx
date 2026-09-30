'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Factory,
  Mail,
  Phone,
  MapPin,
  User,
  Cpu,
  Ruler,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react'
import type { DeploymentRequest } from '@/lib/api/contact'

interface DeployPreviewViewProps {
  formData: DeploymentRequest
  onBackToEdit: () => void
  onConfirmSubmit: () => void
  isSending: boolean
}

export function DeployPreviewView({
  formData,
  onBackToEdit,
  onConfirmSubmit,
  isSending,
}: DeployPreviewViewProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="mx-auto max-w-4xl px-4 sm:px-6"
    >
      <div className="rounded-3xl border border-line bg-panel/95 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="border-b border-line bg-panel-header/50 px-6 sm:px-10 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>CONFIDENTIAL ASSESSMENT PREVIEW</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                Review Your Assessment Application
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                Please verify all 8 essential mill credentials and retrofit specifications before dispatch.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/80 px-3.5 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface transition-colors print:hidden"
                title="Print or Save PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Dispatch Notice Card */}
          <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 text-accent">
              <Mail className="h-4 w-4" />
            </div>
            <div className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink">Automated Dispatch Protocol:</span> Once confirmed, this complete assessment and its official compiled PDF document will be routed directly to{' '}
              <strong className="text-accent font-semibold">fabins@nevolyn.com</strong>. An identical confirmation email with the PDF attached will be instantly delivered to your address at{' '}
              <strong className="text-ink font-semibold">{formData.email}</strong>.
            </div>
          </div>

          {/* Section 1: Factory Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-2.5">
              <Building2 className="h-4 w-4" />
              <span>Mill &amp; Facility Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mill Name */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <Factory className="h-3.5 w-3.5 text-accent" />
                  Mill / Factory Name
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink break-words">
                  {formData.millName || '—'}
                </span>
              </div>

              {/* Machine Brand */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <Cpu className="h-3.5 w-3.5 text-accent" />
                  Machine / Frame Brand
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink break-words">
                  {formData.machineBrand || '—'}
                </span>
              </div>

              {/* Location */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  Location / Zone
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink break-words">
                  {formData.location || '—'}
                </span>
              </div>

              {/* Factory Sector */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-accent" />
                  Factory Sector / Operation
                </span>
                <span className="text-sm sm:text-base font-semibold text-accent break-words">
                  {formData.factoryType || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Representative */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-2.5">
              <User className="h-4 w-4" />
              <span>Technical Representative Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Contact Name */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <User className="h-3.5 w-3.5 text-accent" />
                  Representative Name
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink break-words">
                  {formData.contactName || '—'}
                </span>
              </div>

              {/* Work Email */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <Mail className="h-3.5 w-3.5 text-accent" />
                  Work Email
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink break-words">
                  {formData.email || '—'}
                </span>
              </div>

              {/* Phone / WhatsApp */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <Phone className="h-3.5 w-3.5 text-accent" />
                  Phone / WhatsApp
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink break-words">
                  {formData.phone || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Machine & Retrofit Scope */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-2.5">
              <Ruler className="h-4 w-4" />
              <span>Machine Retrofit Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Roll / Table Width */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <Ruler className="h-3.5 w-3.5 text-accent" />
                  Roll / Table Width
                </span>
                <span className="text-sm sm:text-base font-semibold text-accent break-words">
                  {formData.rollWidth || '—'}
                </span>
              </div>

              {/* Inspection Frames Scope */}
              <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
                <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5 mb-1">
                  <Cpu className="h-3.5 w-3.5 text-accent" />
                  Target Frame Retrofit Scope
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink break-words">
                  {formData.inspectionFramesCount || '1 Frame (Pilot)'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Back to Edit or Confirm Dispatch */}
          <div className="pt-4 border-t border-line flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={isSending}
              onClick={onBackToEdit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface/90 hover:bg-surface text-ink px-6 py-3.5 text-sm font-semibold transition-all hover:border-accent/40 active:scale-[0.98] disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={onConfirmSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-fg px-8 py-3.5 text-sm font-bold shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching to fabins@nevolyn.com...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Confirm &amp; Dispatch Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
