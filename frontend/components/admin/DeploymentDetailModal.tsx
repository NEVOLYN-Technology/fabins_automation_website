'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Download } from 'lucide-react'
import { type DeploymentRecord, getPdfDownloadUrl } from '@/lib/api/admin'

interface DeploymentDetailModalProps {
  deployment: DeploymentRecord | null
  onClose: () => void
}

/**
 * Mill Deployment Deep-Inspection Modal — Styled in authentic FABINS theme.
 * Clean elevated dialog with crisp technical parameters and direct PDF download.
 */
export function DeploymentDetailModal({
  deployment,
  onClose,
}: DeploymentDetailModalProps) {
  return (
    <AnimatePresence>
      {deployment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-2xl bg-panel border border-line rounded-2xl shadow-lift overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-canvas/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-accent">
                    {deployment.referenceCode}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      deployment.status === 'NEW'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : deployment.status === 'IN_REVIEW'
                        ? 'bg-blue-50 text-blue-800 border border-blue-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {deployment.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink mt-1">
                  {deployment.millName}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-panel-2 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Technical Specifications */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-ink-muted font-bold mb-3">
                  Factory & Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-panel-2 border border-line">
                    <span className="text-ink-soft block mb-1 font-medium">Factory Location</span>
                    <span className="text-ink font-bold text-sm">
                      {deployment.location}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-panel-2 border border-line">
                    <span className="text-ink-soft block mb-1 font-medium">Machine / Frame Brand</span>
                    <span className="text-ink font-bold text-sm">
                      {deployment.machineBrand || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-panel-2 border border-line">
                    <span className="text-ink-soft block mb-1 font-medium">Operation Sector</span>
                    <span className="text-ink font-bold text-sm">
                      {deployment.factoryType || 'General Textile Mill'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-panel-2 border border-line">
                    <span className="text-ink-soft block mb-1 font-medium">Inspection Roll Width</span>
                    <span className="text-ink font-bold text-sm">
                      {deployment.rollWidth || 'Standard Width'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Representative Information */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-ink-muted font-bold mb-3">
                  Authorized Representative
                </h4>
                <div className="p-4 rounded-xl bg-panel-2 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink text-base">
                      {deployment.contactName}
                    </p>
                    <p className="text-ink-muted text-xs mt-0.5">{deployment.email}</p>
                    <p className="text-ink-muted text-xs">{deployment.phone}</p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`mailto:${deployment.email}`}
                      className="px-3 py-2 rounded-xl bg-accent text-white hover:bg-accent-bright text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Contact</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-ink-muted font-bold mb-2">
                  Timestamps
                </h4>
                <p className="text-xs text-ink-soft">
                  Submitted on:{' '}
                  <span className="text-ink font-medium">
                    {new Date(deployment.submittedAt).toUTCString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-line bg-canvas/60 flex items-center justify-between">
              <a
                href={getPdfDownloadUrl(deployment.id)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-panel hover:bg-panel-2 border border-line text-ink-muted hover:text-ink text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-accent" />
                <span>Download Official Assessment PDF</span>
              </a>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
