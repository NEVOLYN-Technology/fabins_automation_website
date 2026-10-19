'use client'

import React from 'react'
import { Building, Copy, Check, Mail, Phone, Eye, Download } from 'lucide-react'
import { type DeploymentRecord, getPdfDownloadUrl } from '@/lib/api/admin'

const DEPLOYMENT_STATUS_OPTIONS: Array<DeploymentRecord['status']> = [
  'NEW',
  'IN_REVIEW',
  'CONTACTED',
  'CLOSED',
]

interface DeploymentsTableProps {
  deployments: DeploymentRecord[]
  searchTerm: string
  statusFilter: string
  copiedId: string | null
  onCopy: (code: string) => void
  onStatusChange: (id: string, newStatus: DeploymentRecord['status']) => void
  onSelect: (record: DeploymentRecord) => void
}

/**
 * Mill Deployments Data Table — Styled in authentic FABINS theme.
 * Crisp white panel, elegant status badges, and subtle borders.
 */
export function DeploymentsTable({
  deployments,
  searchTerm,
  statusFilter,
  copiedId,
  onCopy,
  onStatusChange,
  onSelect,
}: DeploymentsTableProps) {
  if (deployments.length === 0) {
    return (
      <div className="bg-panel border border-line rounded-2xl overflow-hidden shadow-card text-center py-16 px-4">
        <div className="w-12 h-12 rounded-2xl bg-panel-2 border border-line flex items-center justify-center mx-auto mb-3 text-ink-soft">
          <Building className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-ink">No deployment requests found</h3>
        <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1">
          {searchTerm || statusFilter !== 'ALL'
            ? 'Try clearing your search query or status filter.'
            : 'Submissions from the /deploy form will appear here in real time.'}
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
              <th className="py-3 px-4">Mill / Factory</th>
              <th className="py-3 px-4">Technical Contact</th>
              <th className="py-3 px-4">Frame Brand / Specs</th>
              <th className="py-3 px-4">Status Stage</th>
              <th className="py-3 px-4">Submitted (UTC)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {deployments.map((d) => (
              <tr key={d.id} className="hover:bg-canvas/60 transition-colors">
                {/* Reference Code */}
                <td className="py-3.5 px-4 font-mono font-semibold text-accent">
                  <button
                    onClick={() => onCopy(d.referenceCode)}
                    className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                    title="Click to copy tracking code"
                  >
                    <span>{d.referenceCode}</span>
                    {copiedId === d.referenceCode ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-ink-soft hover:text-ink-muted" />
                    )}
                  </button>
                </td>

                {/* Mill & Location */}
                <td className="py-3.5 px-4">
                  <p className="font-bold text-ink text-sm">{d.millName}</p>
                  <p className="text-ink-soft text-[11px] font-medium">{d.location}</p>
                </td>

                {/* Technical Representative */}
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-ink">{d.contactName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={`mailto:${d.email}`}
                      className="text-accent hover:underline flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{d.email}</span>
                    </a>
                    <span className="text-line-strong">•</span>
                    <span className="text-ink-soft text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{d.phone}</span>
                    </span>
                  </div>
                </td>

                {/* Machine Specs */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-panel-2 border border-line text-ink-muted font-medium text-[11px]">
                    {d.machineBrand || 'General Frame'}
                  </span>
                  {d.rollWidth && (
                    <p className="text-[11px] text-ink-soft mt-0.5">Width: {d.rollWidth}</p>
                  )}
                </td>

                {/* Inline Status Mutation */}
                <td className="py-3.5 px-4">
                  <select
                    value={d.status}
                    onChange={(e) =>
                      onStatusChange(d.id, e.target.value as DeploymentRecord['status'])
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold focus:outline-none cursor-pointer transition-colors ${
                      d.status === 'NEW'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : d.status === 'IN_REVIEW'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : d.status === 'CONTACTED'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {DEPLOYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-panel text-ink">
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 text-ink-soft whitespace-nowrap font-medium">
                  {new Date(d.submittedAt).toLocaleDateString('en-GB', {
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
                      onClick={() => onSelect(d)}
                      title="Inspect Full Details"
                      className="p-1.5 rounded-lg bg-panel hover:bg-panel-2 border border-line text-ink-muted hover:text-ink transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={getPdfDownloadUrl(d.id)}
                      target="_blank"
                      rel="noreferrer"
                      title="Download Assessment PDF"
                      className="p-1.5 rounded-lg bg-accent-quiet hover:bg-cyan-100 border border-accent/20 text-accent transition-colors inline-flex items-center shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
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
