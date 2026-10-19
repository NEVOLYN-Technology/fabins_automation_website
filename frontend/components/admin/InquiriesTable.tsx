'use client'

import React from 'react'
import { Inbox, Copy, Check, Mail, Eye, Send, Trash2 } from 'lucide-react'
import { type InquiryRecord } from '@/lib/api/admin'

const INQUIRY_STATUS_OPTIONS: Array<InquiryRecord['status']> = ['NEW', 'REPLIED']

interface InquiriesTableProps {
  inquiries: InquiryRecord[]
  searchTerm: string
  statusFilter: string
  copiedId: string | null
  onCopy: (code: string) => void
  onStatusChange: (id: string, newStatus: InquiryRecord['status']) => void
  onSelect: (record: InquiryRecord) => void
  onDelete: (id: string, ref: string) => void
}

/**
 * General Inquiries Data Table — Styled in authentic FABINS theme.
 * Clean, readable white table with colored status indicators and quick-action buttons.
 */
export function InquiriesTable({
  inquiries,
  searchTerm,
  statusFilter,
  copiedId,
  onCopy,
  onStatusChange,
  onSelect,
  onDelete,
}: InquiriesTableProps) {
  if (inquiries.length === 0) {
    return (
      <div className="bg-panel border border-line rounded-2xl overflow-hidden shadow-card text-center py-16 px-4">
        <div className="w-12 h-12 rounded-2xl bg-panel-2 border border-line flex items-center justify-center mx-auto mb-3 text-ink-soft">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-ink">No contact inquiries found</h3>
        <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1">
          {searchTerm || statusFilter !== 'ALL'
            ? 'Try clearing your search query or status filter.'
            : 'Submissions from the "Let\'s Connect" form will appear here.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-panel border border-line rounded-2xl overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas-alt/70 text-ink-muted font-semibold">
              <th className="py-3 px-4">Tracking Ref</th>
              <th className="py-3 px-4">Visitor Name</th>
              <th className="py-3 px-4">Subject & Excerpt</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Received (UTC)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {inquiries.map((i) => (
              <tr key={i.id} className="hover:bg-canvas/60 transition-colors">
                {/* Reference Code */}
                <td className="py-3.5 px-4 font-mono font-semibold text-accent whitespace-nowrap">
                  <button
                    onClick={() => onCopy(i.referenceCode)}
                    className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                    title="Click to copy tracking code"
                  >
                    <span>{i.referenceCode}</span>
                    {copiedId === i.referenceCode ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-ink-soft hover:text-ink-muted" />
                    )}
                  </button>
                </td>

                {/* Submitter Details */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <p className="font-bold text-ink text-sm">{i.name}</p>
                  <a
                    href={`mailto:${i.email}`}
                    className="text-accent hover:underline flex items-center gap-1 text-[11px] font-medium mt-0.5"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{i.email}</span>
                  </a>
                </td>

                {/* Subject & Excerpt */}
                <td className="py-3.5 px-4 max-w-md">
                  <p className="font-semibold text-ink">{i.subject}</p>
                  <p className="text-ink-muted text-[11px] line-clamp-1 mt-0.5 font-normal">
                    {i.message}
                  </p>
                </td>

                {/* Status Selector */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <select
                    value={i.status}
                    onChange={(e) =>
                      onStatusChange(i.id, e.target.value as InquiryRecord['status'])
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold focus:outline-none cursor-pointer transition-colors ${
                      i.status === 'NEW'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {INQUIRY_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-panel text-ink">
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 text-ink-soft whitespace-nowrap font-medium">
                  {new Date(i.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onSelect(i)}
                      title="Read Full Inquiry Message"
                      className="p-1.5 rounded-lg bg-panel hover:bg-panel-2 border border-line text-ink-muted hover:text-ink transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`mailto:${i.email}?subject=RE: ${encodeURIComponent(i.subject)} [Ref: ${i.referenceCode}]`}
                      title="Reply via Email Client"
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-colors inline-flex items-center shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onDelete(i.id, i.referenceCode)}
                      title="Delete Inquiry"
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
