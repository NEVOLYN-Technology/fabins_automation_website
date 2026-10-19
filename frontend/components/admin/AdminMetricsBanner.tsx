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
 * KPI Statistics Banner — Styled in authentic FABINS theme.
 * Clean, elevated white metric cards with soft icons and contrasting counters.
 */
export function AdminMetricsBanner({ metrics }: AdminMetricsBannerProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
      {/* Total Deployments */}
      <div className="p-4 rounded-2xl bg-panel border border-line shadow-card">
        <div className="flex items-center justify-between text-ink-soft text-xs mb-1.5 font-medium">
          <span>Total Deployments</span>
          <div className="p-1.5 rounded-lg bg-cyan-50 text-accent">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-ink tracking-tight">{metrics.depTotal}</p>
      </div>

      {/* New Requests Pending */}
      <div className="p-4 rounded-2xl bg-panel border border-line shadow-card">
        <div className="flex items-center justify-between text-ink-soft text-xs mb-1.5 font-medium">
          <span>New Mill Requests</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-600 tracking-tight">{metrics.depNew}</p>
      </div>

      {/* Under Engineering Review */}
      <div className="p-4 rounded-2xl bg-panel border border-line shadow-card">
        <div className="flex items-center justify-between text-ink-soft text-xs mb-1.5 font-medium">
          <span>Under Review</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-blue-600 tracking-tight">{metrics.depInReview}</p>
      </div>

      {/* Total Inquiries */}
      <div className="p-4 rounded-2xl bg-panel border border-line shadow-card">
        <div className="flex items-center justify-between text-ink-soft text-xs mb-1.5 font-medium">
          <span>Total Inquiries</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Inbox className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-ink tracking-tight">{metrics.inqTotal}</p>
      </div>

      {/* Awaiting Reply */}
      <div className="p-4 rounded-2xl bg-panel border border-line shadow-card col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-ink-soft text-xs mb-1.5 font-medium">
          <span>Awaiting Reply</span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <Send className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-rose-600 tracking-tight">{metrics.inqNew}</p>
      </div>
    </div>
  )
}
