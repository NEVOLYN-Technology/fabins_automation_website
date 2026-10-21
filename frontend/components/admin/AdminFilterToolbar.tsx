'use client'

import React from 'react'
import { Building, Inbox, ArrowUpDown, Search, Filter, X } from 'lucide-react'
import { type DeploymentRecord, type InquiryRecord } from '@/lib/api/admin'

const DEPLOYMENT_STATUS_OPTIONS: Array<DeploymentRecord['status']> = [
  'NEW',
  'IN_REVIEW',
  'CONTACTED',
  'CLOSED',
]

const INQUIRY_STATUS_OPTIONS: Array<InquiryRecord['status']> = ['NEW', 'ACKNOWLEDGED', 'REPLIED']

interface AdminFilterToolbarProps {
  activeTab: 'deployments' | 'inquiries'
  setActiveTab: (tab: 'deployments' | 'inquiries') => void
  deploymentsCount: number
  inquiriesCount: number
  filteredDeploymentCount: number
  filteredInquiryCount: number
  searchTerm: string
  setSearchTerm: (q: string) => void
  deploymentStatusFilter: string
  setDeploymentStatusFilter: (status: string) => void
  inquiryStatusFilter: string
  setInquiryStatusFilter: (status: string) => void
  sortOrder: 'desc' | 'asc'
  setSortOrder: (order: 'desc' | 'asc') => void
}

/**
 * Filter & Search Toolbar — Styled in authentic FABINS theme.
 * Clean segmented tab bar, light input controls, and crisp status chips.
 */
export function AdminFilterToolbar({
  activeTab,
  setActiveTab,
  deploymentsCount,
  inquiriesCount,
  filteredDeploymentCount,
  filteredInquiryCount,
  searchTerm,
  setSearchTerm,
  deploymentStatusFilter,
  setDeploymentStatusFilter,
  inquiryStatusFilter,
  setInquiryStatusFilter,
  sortOrder,
  setSortOrder,
}: AdminFilterToolbarProps) {
  const filteredCount = activeTab === 'deployments' ? filteredDeploymentCount : filteredInquiryCount
  const totalCount = activeTab === 'deployments' ? deploymentsCount : inquiriesCount
  return (
    <>
      {/* Tab Navigation & Sorter */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4 mb-6">
        <div className="flex items-center gap-1.5 bg-panel-2 p-1 rounded-2xl border border-line">
          <button
            onClick={() => {
              setActiveTab('deployments')
              setSearchTerm('')
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deployments'
                ? 'bg-panel text-ink shadow-sm border border-line/60'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Building className={`w-3.5 h-3.5 ${activeTab === 'deployments' ? 'text-accent' : 'text-ink-soft'}`} />
            <span>Mill Deployments</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                activeTab === 'deployments' ? 'bg-accent-quiet text-accent' : 'bg-canvas text-ink-soft'
              }`}
            >
              {deploymentsCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inquiries')
              setSearchTerm('')
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-panel text-ink shadow-sm border border-line/60'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Inbox className={`w-3.5 h-3.5 ${activeTab === 'inquiries' ? 'text-accent' : 'text-ink-soft'}`} />
            <span>General Inquiries</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                activeTab === 'inquiries' ? 'bg-accent-quiet text-accent' : 'bg-canvas text-ink-soft'
              }`}
            >
              {inquiriesCount}
            </span>
          </button>
        </div>

        {/* Result Count + Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-soft hidden sm:block">
            <span className="font-semibold text-ink">{filteredCount}</span>
            {filteredCount !== totalCount && (
              <span> of {totalCount}</span>
            )}
            {activeTab === 'deployments' ? ' deployments' : ' inquiries'}
          </span>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3.5 py-2 rounded-xl bg-panel border border-line text-xs font-medium text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Search Input & Status Filter Chips */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        {/* Real-time search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'deployments'
                ? 'Search mill, contact, email, reference code, machine brand...'
                : 'Search visitor name, email, subject, message content...'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-panel border border-line rounded-xl text-xs sm:text-sm text-ink placeholder-ink-soft focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-ink-soft flex items-center gap-1 mr-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {activeTab === 'deployments' ? (
            ['ALL', ...DEPLOYMENT_STATUS_OPTIONS].map((st) => (
              <button
                key={st}
                onClick={() => setDeploymentStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  deploymentStatusFilter === st
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-panel text-ink-muted border border-line hover:text-ink hover:border-line-strong'
                }`}
              >
                {st}
              </button>
            ))
          ) : (
            ['ALL', ...INQUIRY_STATUS_OPTIONS].map((st) => (
              <button
                key={st}
                onClick={() => setInquiryStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  inquiryStatusFilter === st
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-panel text-ink-muted border border-line hover:text-ink hover:border-line-strong'
                }`}
              >
                {st}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}
