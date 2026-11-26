'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  Mail,
  Loader2,
} from 'lucide-react'
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
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

  // Clean up Object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
      }
    }
  }, [pdfBlobUrl])

  const loadPdf = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!formData) return null
    if (pdfBlob && pdfBlobUrl) {
      return { blob: pdfBlob, url: pdfBlobUrl }
    }

    setIsProcessingPdf(true)
    const res = await fetchDeploymentPreviewPdfBlob(formData)
    setIsProcessingPdf(false)

    if (res.ok) {
      const url = URL.createObjectURL(res.blob)
      setPdfBlob(res.blob)
      setPdfBlobUrl(url)
      return { blob: res.blob, url }
    }
    return null
  }

  const handleDownloadPdf = async () => {
    if (!formData) return
    const loaded = await loadPdf()
    if (loaded) {
      downloadBlob(loaded.blob, `FABINS_Deployment_Assessment-${referenceCode}.pdf`)
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
      {/* Header Icon & Title */}
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-accent ring-8 ring-accent/10 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>

        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-ink font-heading">
          Assessment Registered &amp; Dispatched!
        </h2>
      </div>

      {/* Official Reference Receipt & PDF Download Card */}
      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-quiet/40 p-6 sm:p-7 text-center shadow-xs">
        <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted font-bold block mb-1.5">
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
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="my-5 border-t border-accent/20 w-full max-w-sm mx-auto" />

        {/* Download Action Inside Card */}
        <div className="flex justify-center print:hidden">
          <button
            type="button"
            disabled={isProcessingPdf}
            onClick={handleDownloadPdf}
            className="btn btn-primary w-full sm:w-auto !rounded-xl !px-8 !py-3 text-sm font-bold text-white shadow-md shadow-accent/25 hover:shadow-lg disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            title="Download Official Assessment PDF"
          >
            {isProcessingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
                <span className="text-white">Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white">Download Assessment PDF</span>
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

      {/* Secondary Navigation Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl mx-auto print:hidden">
        <button
          type="button"
          onClick={onResetForm}
          className="btn btn-secondary w-full sm:w-1/2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl"
        >
          Submit Another Assessment
        </button>

        <Link
          href="/"
          className="btn btn-secondary w-full sm:w-1/2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-center"
        >
          Return to Homepage
        </Link>
      </div>
    </motion.div>
  )
}
