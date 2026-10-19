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
 * Mill Deployments Data Table.
 * Renders technical retrofit applications with status controls, inspection modals, and PDF downloads.
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
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-center py-16 px-4">
        <Building className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No deployment requests found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          {searchTerm || statusFilter !== 'ALL'
            ? 'Try clearing your search query or status filter.'
            : 'Submissions from the /deploy form will appear here in real time.'}
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
              <th className="py-3 px-4">Mill / Factory</th>
              <th className="py-3 px-4">Technical Contact</th>
              <th className="py-3 px-4">Frame Brand / Specs</th>
              <th className="py-3 px-4">Status Stage</th>
              <th className="py-3 px-4">Submitted (UTC)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {deployments.map((d) => (
              <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                {/* Reference Code */}
                <td className="py-3.5 px-4 font-mono font-medium text-cyan-400">
                  <button
                    onClick={() => onCopy(d.referenceCode)}
                    className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                    title="Click to copy tracking code"
                  >
                    <span>{d.referenceCode}</span>
                    {copiedId === d.referenceCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                </td>

                {/* Mill & Location */}
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-white text-sm">{d.millName}</p>
                  <p className="text-slate-400 text-[11px]">{d.location}</p>
                </td>

                {/* Technical Representative */}
                <td className="py-3.5 px-4">
                  <p className="text-slate-200">{d.contactName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={`mailto:${d.email}`}
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{d.email}</span>
                    </a>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{d.phone}</span>
                    </span>
                  </div>
                </td>

                {/* Machine Specs */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                    {d.machineBrand || 'General Frame'}
                  </span>
                  {d.rollWidth && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Width: {d.rollWidth}</p>
                  )}
                </td>

                {/* Inline Status Mutation */}
                <td className="py-3.5 px-4">
                  <select
                    value={d.status}
                    onChange={(e) =>
                      onStatusChange(d.id, e.target.value as DeploymentRecord['status'])
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium focus:outline-none cursor-pointer ${
                      d.status === 'NEW'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                        : d.status === 'IN_REVIEW'
                        ? 'bg-blue-950/40 text-blue-300 border-blue-600/40'
                        : d.status === 'CONTACTED'
                        ? 'bg-indigo-950/40 text-indigo-300 border-indigo-600/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {DEPLOYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
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
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={getPdfDownloadUrl(d.id)}
                      target="_blank"
                      rel="noreferrer"
                      title="Download Assessment PDF"
                      className="p-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 transition-colors inline-flex items-center"
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
