'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Send } from 'lucide-react'
import { type InquiryRecord } from '@/lib/api/admin'

interface InquiryDetailModalProps {
  inquiry: InquiryRecord | null
  onClose: () => void
}

/**
 * General Inquiry Detail Modal.
 * Shows complete message text, sender details, status tag, and a direct email reply trigger.
 */
export function InquiryDetailModal({
  inquiry,
  onClose,
}: InquiryDetailModalProps) {
  return (
    <AnimatePresence>
      {inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-cyan-400">
                    {inquiry.referenceCode}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      inquiry.status === 'NEW'
                        ? 'bg-rose-950/50 text-rose-300 border border-rose-600/30'
                        : 'bg-emerald-950/50 text-emerald-300 border border-emerald-600/30'
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {inquiry.subject}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{inquiry.name}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(inquiry.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>{inquiry.email}</span>
                </a>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Message Body
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                  {inquiry.message || 'No message content provided.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <a
                href={`mailto:${inquiry.email}?subject=RE: ${encodeURIComponent(inquiry.subject)} [Ref: ${inquiry.referenceCode}]`}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply via Email Client</span>
              </a>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
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
