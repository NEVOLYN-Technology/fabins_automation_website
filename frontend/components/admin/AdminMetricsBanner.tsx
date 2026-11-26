'use client'

import React from 'react'
import { Building, Clock, Cpu, Inbox, Send, CheckCircle2, PhoneCall, Archive, Users } from 'lucide-react'
import { type AdminStats } from '@/lib/api/admin'

interface AdminMetricsBannerProps {
  activeTab: 'deployments' | 'inquiries'
  stats: AdminStats
  deploymentStatusFilter: string
  inquiryStatusFilter: string
  setActiveTab: (tab: 'deployments' | 'inquiries') => void
  setDeploymentStatusFilter: (status: string) => void
  setInquiryStatusFilter: (status: string) => void
}

/**
 * KPI Metrics Banner — Context-aware, clickable executive summary cards.
 *
 * Cards switch between Deployment and Inquiry metrics based on the active tab.
 * Clicking a card switches to the relevant tab and applies that status filter.
 * Active filter cards are highlighted with a teal accent ring.
 */
export function AdminMetricsBanner({
  activeTab,
  stats,
  deploymentStatusFilter,
  inquiryStatusFilter,
  setActiveTab,
  setDeploymentStatusFilter,
  setInquiryStatusFilter,
}: AdminMetricsBannerProps) {
  // Deployment metric cards
  const deploymentCards = [
    {
      label: 'Total Deployments',
      value: stats.depTotal,
      icon: <Building className="w-4 h-4" />,
      iconBg: 'bg-cyan-50 text-accent',
      valueClass: 'text-ink',
      filter: 'ALL',
      sub: 'All mill requests',
    },
    {
      label: 'New Requests',
      value: stats.depNew,
      icon: <Clock className="w-4 h-4" />,
      iconBg: 'bg-amber-50 text-amber-600',
      valueClass: 'text-amber-600',
      filter: 'NEW',
      sub: 'Awaiting triage',
    },
    {
      label: 'Under Review',
      value: stats.depInReview,
      icon: <Cpu className="w-4 h-4" />,
      iconBg: 'bg-blue-50 text-blue-600',
      valueClass: 'text-blue-600',
      filter: 'IN_REVIEW',
      sub: 'Engineering assessment',
    },
    {
      label: 'Client Contacted',
      value: stats.depContacted,
      icon: <PhoneCall className="w-4 h-4" />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueClass: 'text-indigo-600',
      filter: 'CONTACTED',
      sub: 'In follow-up',
    },
    {
      label: 'Closed / Done',
      value: stats.depClosed,
      icon: <Archive className="w-4 h-4" />,
      iconBg: 'bg-slate-100 text-slate-500',
      valueClass: 'text-slate-500',
      filter: 'CLOSED',
      sub: 'Completed engagements',
    },
  ]

  // Inquiry metric cards
  const inquiryCards = [
    {
      label: 'Total Inquiries',
      value: stats.inqTotal,
      icon: <Inbox className="w-4 h-4" />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueClass: 'text-ink',
      filter: 'ALL',
      sub: 'All visitor messages',
    },
    {
      label: 'New Messages',
      value: stats.inqNew,
      icon: <Users className="w-4 h-4" />,
      iconBg: 'bg-rose-50 text-rose-600',
      valueClass: 'text-rose-600',
      filter: 'NEW',
      sub: 'Awaiting attention',
    },
    {
      label: 'Acknowledged',
      value: stats.inqAcknowledged,
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconBg: 'bg-sky-50 text-sky-600',
      valueClass: 'text-sky-600',
      filter: 'ACKNOWLEDGED',
      sub: 'Seen, not yet replied',
    },
    {
      label: 'Replied',
      value: stats.inqReplied,
      icon: <Send className="w-4 h-4" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueClass: 'text-emerald-600',
      filter: 'REPLIED',
      sub: 'Response sent',
    },
  ]

  const isDeploymentTab = activeTab === 'deployments'
  const cards = isDeploymentTab ? deploymentCards : inquiryCards
  const activeFilter = isDeploymentTab ? deploymentStatusFilter : inquiryStatusFilter

  const handleCardClick = (filter: string) => {
    if (isDeploymentTab) {
      setDeploymentStatusFilter(filter)
    } else {
      setInquiryStatusFilter(filter)
    }
  }

  return (
    <div className="mb-8">
      {/* KPI Cards Grid */}
      <div className={`grid gap-3 ${isDeploymentTab ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {cards.map((card) => {
          const isActive = activeFilter === card.filter
          return (
            <button
              key={card.label}
              onClick={() => handleCardClick(card.filter)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                isActive
                  ? 'bg-panel border-accent shadow-md ring-2 ring-accent/20'
                  : 'bg-panel border-line shadow-card hover:shadow-md hover:border-accent/30'
              }`}
            >
              <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
                <span className={isActive ? 'text-accent font-semibold' : ''}>{card.label}</span>
                <div className={`p-1.5 rounded-lg transition-all ${card.iconBg} ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {card.icon}
                </div>
              </div>
              <p className={`text-2xl font-bold tracking-tight ${card.valueClass}`}>{card.value}</p>
              <p className="text-[10px] text-ink-muted mt-1 font-normal">{card.sub}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
