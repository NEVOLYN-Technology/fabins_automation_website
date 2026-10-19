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

const INQUIRY_STATUS_OPTIONS: Array<InquiryRecord['status']> = ['NEW', 'REPLIED']

interface AdminFilterToolbarProps {
  activeTab: 'deployments' | 'inquiries'
  setActiveTab: (tab: 'deployments' | 'inquiries') => void
  deploymentsCount: number
  inquiriesCount: number
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
 * Filter & Search Toolbar.
 * Provides tab switching, keyword search, status filtering chips, and chronological sorting.
 */
export function AdminFilterToolbar({
  activeTab,
  setActiveTab,
  deploymentsCount,
  inquiriesCount,
  searchTerm,
  setSearchTerm,
  deploymentStatusFilter,
  setDeploymentStatusFilter,
  inquiryStatusFilter,
  setInquiryStatusFilter,
  sortOrder,
  setSortOrder,
}: AdminFilterToolbarProps) {
  return (
    <>
      {/* Tab Navigation & Sorter */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('deployments')
              setSearchTerm('')
            }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deployments'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Mill Deployments</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'deployments' ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-800 text-slate-300'
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
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>General Inquiries</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'inquiries' ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {inquiriesCount}
            </span>
          </button>
        </div>

        {/* Date Sort Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Search Input & Status Filter Chips */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        {/* Real-time search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'deployments'
                ? 'Search by mill name, contact, email, reference code, brand...'
                : 'Search by visitor name, email, subject, keyword...'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          {activeTab === 'deployments' ? (
            ['ALL', ...DEPLOYMENT_STATUS_OPTIONS].map((st) => (
              <button
                key={st}
                onClick={() => setDeploymentStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  deploymentStatusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  inquiryStatusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
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
