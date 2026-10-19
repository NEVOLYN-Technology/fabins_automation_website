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
 * Mill Deployment Deep-Inspection Modal.
 * Displays all factory technical parameters, roll widths, representative contacts, and PDF actions.
 */
export function DeploymentDetailModal({
  deployment,
  onClose,
}: DeploymentDetailModalProps) {
  return (
    <AnimatePresence>
      {deployment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-cyan-400">
                    {deployment.referenceCode}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      deployment.status === 'NEW'
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-600/30'
                        : deployment.status === 'IN_REVIEW'
                        ? 'bg-blue-950/50 text-blue-300 border border-blue-600/30'
                        : 'bg-emerald-950/50 text-emerald-300 border border-emerald-600/30'
                    }`}
                  >
                    {deployment.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {deployment.millName}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Technical Specifications */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Factory & Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block mb-1">Factory Location</span>
                    <span className="text-slate-200 font-medium text-sm">
                      {deployment.location}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block mb-1">Machine / Frame Brand</span>
                    <span className="text-slate-200 font-medium text-sm">
                      {deployment.machineBrand || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block mb-1">Operation Sector</span>
                    <span className="text-slate-200 font-medium text-sm">
                      {deployment.factoryType || 'General Textile Mill'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block mb-1">Inspection Roll Width</span>
                    <span className="text-slate-200 font-medium text-sm">
                      {deployment.rollWidth || 'Standard Width'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Representative Information */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Authorized Representative
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white text-base">
                      {deployment.contactName}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">{deployment.email}</p>
                    <p className="text-slate-400 text-xs">{deployment.phone}</p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`mailto:${deployment.email}`}
                      className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Contact</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Timestamps
                </h4>
                <p className="text-xs text-slate-400">
                  Submitted on:{' '}
                  <span className="text-slate-200">
                    {new Date(deployment.submittedAt).toUTCString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <a
                href={getPdfDownloadUrl(deployment.id)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official Assessment PDF</span>
              </a>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors cursor-pointer"
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
