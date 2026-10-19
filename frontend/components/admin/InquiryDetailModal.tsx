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
 * General Inquiry Detail Modal — Styled in authentic FABINS theme.
 * Clean dialog with legible message card and one-click email reply button.
 */
export function InquiryDetailModal({
  inquiry,
  onClose,
}: InquiryDetailModalProps) {
  return (
    <AnimatePresence>
      {inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-xl bg-panel border border-line rounded-2xl shadow-lift overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-canvas/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-accent">
                    {inquiry.referenceCode}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      inquiry.status === 'NEW'
                        ? 'bg-rose-50 text-rose-800 border border-rose-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink mt-1">
                  {inquiry.subject}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-panel-2 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-panel-2 border border-line">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-ink text-sm">{inquiry.name}</span>
                  <span className="text-xs text-ink-soft font-medium">
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
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{inquiry.email}</span>
                </a>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-2">
                  Message Body
                </label>
                <div className="p-4 rounded-xl bg-panel-2 border border-line text-ink text-xs leading-relaxed whitespace-pre-wrap font-normal">
                  {inquiry.message || 'No message content provided.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-line bg-canvas/60 flex items-center justify-between">
              <a
                href={`mailto:${inquiry.email}?subject=RE: ${encodeURIComponent(inquiry.subject)} [Ref: ${inquiry.referenceCode}]`}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply via Email Client</span>
              </a>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-panel hover:bg-panel-2 border border-line text-ink-muted hover:text-ink text-xs font-semibold transition-colors cursor-pointer shadow-xs"
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
