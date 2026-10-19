'use client'

import React from 'react'
import { Building, Clock, Cpu, Inbox, Send } from 'lucide-react'

interface AdminMetricsBannerProps {
  metrics: {
    depTotal: number
    depNew: number
    depInReview: number
    inqTotal: number
    inqNew: number
  }
}

/**
 * KPI Statistics Banner.
 * Summarizes operational volumes across mill assessments and general contact messages.
 */
export function AdminMetricsBanner({ metrics }: AdminMetricsBannerProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
      {/* Total Deployments */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
          <span>Total Deployments</span>
          <Building className="w-4 h-4 text-cyan-400" />
        </div>
        <p className="text-2xl font-bold text-white">{metrics.depTotal}</p>
      </div>

      {/* New Requests Pending */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
          <span>New Mill Requests</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-2xl font-bold text-amber-400">{metrics.depNew}</p>
      </div>

      {/* Under Engineering Review */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
          <span>Under Review</span>
          <Cpu className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-2xl font-bold text-blue-400">{metrics.depInReview}</p>
      </div>

      {/* Total Inquiries */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
          <span>Total Inquiries</span>
          <Inbox className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-2xl font-bold text-white">{metrics.inqTotal}</p>
      </div>

      {/* Awaiting Reply */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
          <span>Awaiting Reply</span>
          <Send className="w-4 h-4 text-rose-400" />
        </div>
        <p className="text-2xl font-bold text-rose-400">{metrics.inqNew}</p>
      </div>
    </div>
  )
}
