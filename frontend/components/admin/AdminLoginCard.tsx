'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, User, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react'
import { type AdminCredentials } from '@/lib/api/admin'
import { FabinsLogo } from '@/components/ui/FabinsLogo'

interface AdminLoginCardProps {
  authInput: AdminCredentials
  setAuthInput: (creds: AdminCredentials) => void
  onLogin: (e: React.FormEvent) => void
  authError: string | null
  isVerifying: boolean
}

/**
 * Authentication Gate Card — Styled in authentic FABINS light aesthetic.
 * Renders an executive card with engineering grid background, crisp contrast, and brand accents.
 */
export function AdminLoginCard({
  authInput,
  setAuthInput,
  onLogin,
  authError,
  isVerifying,
}: AdminLoginCardProps) {
  return (
    <div className="relative min-h-screen bg-canvas text-ink flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* Engineering grid & glow background matching PageShell */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-a) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[380px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-b) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <FabinsLogo className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">FABINS Deployment</h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">Executive Operations & Inquiries Dashboard</p>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-6 text-xs uppercase tracking-wider text-accent font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Authentication Required</span>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </motion.div>
          )}

          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                Administrator Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={authInput.username}
                  onChange={(e) => setAuthInput({ ...authInput, username: e.target.value })}
                  placeholder="admin"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-panel-2 border border-line rounded-xl text-ink placeholder-ink-soft text-sm focus:outline-none focus:border-accent focus:bg-panel transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={authInput.password}
                  onChange={(e) => setAuthInput({ ...authInput, password: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-panel-2 border border-line rounded-xl text-ink placeholder-ink-soft text-sm focus:outline-none focus:border-accent focus:bg-panel transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-[var(--btn-from)] to-[var(--btn-to)] hover:brightness-105 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Access Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-line text-center">
            <Link
              href="/"
              className="text-xs text-ink-soft hover:text-accent transition-colors inline-flex items-center gap-1.5"
            >
              <span>Return to Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
