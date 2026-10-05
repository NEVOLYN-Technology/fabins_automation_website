'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  FileText,
  Printer,
  ShieldCheck,
  Send,
  Loader2,
  Eye,
  Download,
  ExternalLink,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import type { DeploymentRequest } from '@/lib/api/contact'
import { fetchDeploymentPreviewPdfBlob, downloadBlob } from '@/lib/api/contact'

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
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Clean up Object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
      }
    }
  }, [pdfBlobUrl])

  const loadPdf = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (pdfBlob && pdfBlobUrl) {
      return { blob: pdfBlob, url: pdfBlobUrl }
    }

    setIsLoadingPdf(true)
    setPdfError(null)

    const res = await fetchDeploymentPreviewPdfBlob(formData)
    setIsLoadingPdf(false)

    if (res.ok) {
      const url = URL.createObjectURL(res.blob)
      setPdfBlob(res.blob)
      setPdfBlobUrl(url)
      return { blob: res.blob, url }
    } else {
      setPdfError(res.error)
      return null
    }
  }

  const handleOpenPdfPreview = async () => {
    setShowPdfModal(true)
    await loadPdf()
  }

  const handleDownloadPdf = async () => {
    const loaded = await loadPdf()
    if (loaded) {
      const sanitizedMill = (formData.millName || 'Mill').replace(/[^a-zA-Z0-9]/g, '_')
      downloadBlob(loaded.blob, `FABINS-Assessment-Preview-${sanitizedMill}.pdf`)
    }
  }

  const handlePrintPdf = async () => {
    const loaded = await loadPdf()
    if (loaded) {
      const printWindow = window.open(loaded.url, '_blank')
      if (printWindow) {
        printWindow.focus()
      }
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

            <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
              <button
                type="button"
                onClick={handleOpenPdfPreview}
                disabled={isLoadingPdf}
                className="inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/15 hover:bg-accent hover:text-accent-fg text-accent px-3.5 py-2 text-xs font-semibold transition-all shadow-xs active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                title="Preview the authentic PDF assessment document"
              >
                {isLoadingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                <span>Live PDF Preview</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isLoadingPdf}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/80 hover:bg-surface text-ink px-3.5 py-2 text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                title="Download the generated PDF file"
              >
                <Download className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPdf}
                disabled={isLoadingPdf}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/80 hover:bg-surface text-ink px-3.5 py-2 text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                title="Print or view generated PDF report"
              >
                <Printer className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline">Print</span>
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

          {/* Section 2: Technical Representative & Machinery Specifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-line pb-2.5">
              <User className="h-4 w-4" />
              <span>Technical Representative &amp; Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* PDF Live Preview Modal */}
      <AnimatePresence>
        {showPdfModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md print:hidden"
            onClick={() => setShowPdfModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-3xl border border-line bg-panel shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-line bg-panel-header/90 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-ink">
                      Official Assessment Report (PDF)
                    </h3>
                    <p className="text-[11px] text-ink-muted hidden sm:block">
                      Publication-quality report generated for {formData.millName || 'Your Mill'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pdfBlobUrl && (
                    <>
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/80 hover:bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:text-accent transition-colors cursor-pointer"
                        title="Download Generated PDF"
                      >
                        <Download className="h-3.5 w-3.5 text-accent" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintPdf}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/80 hover:bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:text-accent transition-colors cursor-pointer"
                        title="Print PDF"
                      >
                        <Printer className="h-3.5 w-3.5 text-accent" />
                        <span className="hidden sm:inline">Print</span>
                      </button>
                      <a
                        href={pdfBlobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/80 hover:bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:text-accent transition-colors"
                        title="Open PDF in Browser Tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-accent" />
                        <span className="hidden sm:inline">New Tab</span>
                      </a>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPdfModal(false)}
                    className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                    title="Close Preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 bg-surface/50 overflow-hidden relative flex items-center justify-center">
                {isLoadingPdf ? (
                  <div className="text-center p-8 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
                    <p className="text-sm font-semibold text-ink">
                      Compiling Official Assessment PDF...
                    </p>
                    <p className="text-xs text-ink-muted">
                      Formatting mill profile and technical specifications into a formal PDF report
                    </p>
                  </div>
                ) : pdfError ? (
                  <div className="text-center p-8 max-w-md space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-rose-500">{pdfError}</p>
                    <button
                      type="button"
                      onClick={loadPdf}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-fg hover:bg-accent-hover transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Retry Generation</span>
                    </button>
                  </div>
                ) : pdfBlobUrl ? (
                  <iframe
                    src={pdfBlobUrl}
                    className="w-full h-full border-none"
                    title="Official FABINS Deployment Assessment PDF"
                  />
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
