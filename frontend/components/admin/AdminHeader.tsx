'use client'

import React from 'react'
import Link from 'next/link'
import { RefreshCw, ExternalLink, LogOut, CheckCircle, Building2 } from 'lucide-react'
import { FabinsLogo } from '@/components/ui/FabinsLogo'

interface AdminHeaderProps {
  username: string
  isLoading: boolean
  onRefresh: () => void
  onLogout: () => void
}

/**
 * Top Administrative Bar — Styled in authentic FABINS theme.
 * Clean frosted panel with FabinsLogo lockup, live site shortcut, and session controls.
 */
export function AdminHeader({
  username,
  isLoading,
  onRefresh,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-panel/90 backdrop-blur-md border-b border-line shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-85">
            <FabinsLogo className="h-9 w-auto" />
          </Link>
          <div className="h-5 w-[1px] bg-line hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-md bg-accent-quiet border border-accent/20 text-accent font-mono font-semibold">
              ADMIN CONTROL
            </span>
            <span className="text-xs text-ink-soft hidden md:inline">
              Operations & Inquiries
            </span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Server Data"
            className="p-2 rounded-xl bg-panel hover:bg-panel-2 border border-line text-ink-muted hover:text-ink transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-accent' : ''}`} />
          </button>

          <a
            href="https://nevolyn.com/office/login"
            target="_blank"
            rel="noopener noreferrer"
            title="Open NEVOLYN Office & HRM Management Portal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 to-teal-50/80 hover:from-emerald-500 hover:to-teal-600 hover:border-transparent transition-all shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>Office Portal</span>
            <ExternalLink className="w-3 h-3 opacity-80 hidden sm:inline shrink-0" />
          </a>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink px-3 py-1.5 rounded-xl border border-line bg-panel hover:bg-panel-2 transition-colors shadow-xs"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3 text-ink-soft" />
          </Link>

          <div className="h-5 w-[1px] bg-line hidden sm:block" />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-ink leading-tight">{username}</p>
              <p className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Authorized
              </p>
            </div>

            <button
              onClick={onLogout}
              title="Log Out Session"
              className="p-2 rounded-xl bg-panel hover:bg-red-50 border border-line hover:border-red-200 text-ink-soft hover:text-red-600 transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
