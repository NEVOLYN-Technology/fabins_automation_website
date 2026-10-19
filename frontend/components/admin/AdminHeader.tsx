'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, RefreshCw, ExternalLink, LogOut } from 'lucide-react'

interface AdminHeaderProps {
  username: string
  isLoading: boolean
  onRefresh: () => void
  onLogout: () => void
}

/**
 * Top Administrative Bar.
 * Provides system status, live site access, data refresh, and session logout controls.
 */
export function AdminHeader({
  username,
  isLoading,
  onRefresh,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">FABINS</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-mono font-medium">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5">Deployment & Inquiry Control Center</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Server Data"
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-white">{username}</p>
              <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Authenticated
              </p>
            </div>

            <button
              onClick={onLogout}
              title="Log Out Session"
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-red-950/40 border border-slate-700/60 hover:border-red-500/30 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
