'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, FileCheck2, Zap, Copy, Check, Download, Printer, Mail, ShieldCheck, Loader2 } from 'lucide-react'
import type { DeploymentRequest } from '@/lib/api/contact'
import { fetchDeploymentPreviewPdfBlob, downloadBlob } from '@/lib/api/contact'

interface DeploySuccessViewProps {
  referenceCode: string
  copiedCode: boolean
  onCopyCode: () => void
  onResetForm: () => void
  senderEmail?: string
  formData?: DeploymentRequest
}

export function DeploySuccessView({
  referenceCode,
  copiedCode,
  onCopyCode,
  onResetForm,
  senderEmail,
  formData,
}: DeploySuccessViewProps) {
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)

  const handleDownloadPdf = async () => {
    if (!formData) return
    setIsProcessingPdf(true)
    const res = await fetchDeploymentPreviewPdfBlob(formData)
    setIsProcessingPdf(false)
    if (res.ok) {
      downloadBlob(res.blob, `FABINS_Deployment_Assessment-${referenceCode}.pdf`)
    }
  }

  const handlePrintPdf = async () => {
    if (!formData) {
      if (typeof window !== 'undefined') window.print()
      return
    }
    setIsProcessingPdf(true)
    const res = await fetchDeploymentPreviewPdfBlob(formData)
    setIsProcessingPdf(false)
    if (res.ok) {
      const url = window.URL.createObjectURL(res.blob)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.focus()
      }
    }
  }

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="mx-auto max-w-3xl rounded-3xl border border-accent/40 bg-panel/95 p-6 sm:p-12 shadow-[0_25px_60px_-15px_rgba(8,145,178,0.35)] backdrop-blur-xl"
    >
      {/* Header Icon */}
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-accent ring-8 ring-accent/10 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>

        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-ink font-heading">
          Assessment Registered &amp; Dispatched!
        </h2>
        <p className="mt-2 text-sm text-ink-muted max-w-lg mx-auto">
          Your mill specifications have been logged in the FABINS Industrial Register of NEVOLYN Technology.
        </p>
      </div>

      {/* Official Reference Receipt Card */}
      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-quiet/40 p-5 sm:p-6 text-center shadow-xs">
        <span className="text-[11px] font-mono uppercase tracking-widest text-ink-soft font-bold block mb-1">
          Tracking Reference Code
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-accent select-all">
            {referenceCode}
          </span>
          <button
            onClick={onCopyCode}
            type="button"
            title="Copy Reference Code"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all text-xs font-bold active:scale-95 shadow-2xs cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Email Delivery Confirmation Card */}
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-500 mt-0.5">
          <Mail className="h-4 w-4" />
        </div>
        <div className="text-xs sm:text-sm text-ink leading-relaxed">
          <strong className="block font-bold text-emerald-500 text-sm mb-0.5">
            PDF Assessment Delivered to Both Parties
          </strong>
          <span>
            An identical confirmation email with the official <strong>PDF copy of this assessment</strong> attached has been dispatched to both{' '}
            <strong className="text-accent font-semibold">fabins@nevolyn.com</strong> and{' '}
            <strong className="text-ink font-semibold">{senderEmail || 'your email'}</strong>.
          </span>
        </div>
      </div>

      {/* Next Steps Information */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="flex gap-3.5 rounded-2xl border border-line bg-panel-2 p-4.5">
          <FileCheck2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <strong className="block text-ink text-sm font-bold">Engineering Review Queue</strong>
            <span className="text-xs text-ink-muted leading-relaxed">
              Your retrofitting requirements and machine brand specifications are actively queued with the NEVOLYN automation desk.
            </span>
          </div>
        </div>

        <div className="flex gap-3.5 rounded-2xl border border-line bg-panel-2 p-4.5">
          <Zap className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <strong className="block text-ink text-sm font-bold">24-Hour Follow-Up</strong>
            <span className="text-xs text-ink-muted leading-relaxed">
              A dedicated vision engineer will reach out directly to coordinate optical frame mounting specs and scheduling.
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 print:hidden flex-wrap">
        <button
          type="button"
          disabled={isProcessingPdf}
          onClick={handleDownloadPdf}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-accent/25 transition-all active:scale-[0.98] w-full sm:w-auto disabled:opacity-60 cursor-pointer"
        >
          {isProcessingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Download Official Assessment PDF</span>
        </button>

        <button
          type="button"
          disabled={isProcessingPdf}
          onClick={handlePrintPdf}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface/90 hover:bg-surface text-ink px-6 py-3 text-xs sm:text-sm font-bold transition-all hover:border-accent/40 active:scale-[0.98] w-full sm:w-auto disabled:opacity-60 cursor-pointer"
        >
          <Printer className="h-4 w-4 text-accent" />
          <span>Print / Open PDF</span>
        </button>

        <button
          type="button"
          onClick={onResetForm}
          className="btn btn-secondary w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold rounded-xl"
        >
          Submit Another Assessment
        </button>

        <Link
          href="/"
          className="btn btn-secondary w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-bold rounded-xl text-center"
        >
          Return to Homepage
        </Link>
      </div>
    </motion.div>
  )
}
