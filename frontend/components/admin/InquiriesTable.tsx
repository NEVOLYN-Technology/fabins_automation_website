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
 * General Inquiries Data Table.
 * Renders visitor inquiries with quick status toggle, message modal, mailto reply, and deletion.
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
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-center py-16 px-4">
        <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No contact inquiries found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          {searchTerm || statusFilter !== 'ALL'
            ? 'Try clearing your search query or status filter.'
            : 'Submissions from the "Let\'s Connect" form will appear here.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-medium">
              <th className="py-3 px-4">Tracking Ref</th>
              <th className="py-3 px-4">Visitor Name</th>
              <th className="py-3 px-4">Subject & Excerpt</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Received (UTC)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {inquiries.map((i) => (
              <tr key={i.id} className="hover:bg-slate-800/30 transition-colors">
                {/* Reference Code */}
                <td className="py-3.5 px-4 font-mono font-medium text-cyan-400 whitespace-nowrap">
                  <button
                    onClick={() => onCopy(i.referenceCode)}
                    className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                    title="Click to copy tracking code"
                  >
                    <span>{i.referenceCode}</span>
                    {copiedId === i.referenceCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                </td>

                {/* Submitter Details */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <p className="font-semibold text-white text-sm">{i.name}</p>
                  <a
                    href={`mailto:${i.email}`}
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] mt-0.5"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{i.email}</span>
                  </a>
                </td>

                {/* Subject & Excerpt */}
                <td className="py-3.5 px-4 max-w-md">
                  <p className="font-medium text-slate-200">{i.subject}</p>
                  <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
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
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium focus:outline-none cursor-pointer ${
                      i.status === 'NEW'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-600/40'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                    }`}
                  >
                    {INQUIRY_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
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
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`mailto:${i.email}?subject=RE: ${encodeURIComponent(i.subject)} [Ref: ${i.referenceCode}]`}
                      title="Reply via Email Client"
                      className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-300 transition-colors inline-flex items-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onDelete(i.id, i.referenceCode)}
                      title="Delete Inquiry"
                      className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 text-red-400 transition-colors cursor-pointer"
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
