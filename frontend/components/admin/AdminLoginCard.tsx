'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, User, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react'
import { type AdminCredentials } from '@/lib/api/admin'

interface AdminLoginCardProps {
  authInput: AdminCredentials
  setAuthInput: (creds: AdminCredentials) => void
  onLogin: (e: React.FormEvent) => void
  authError: string | null
  isVerifying: boolean
}

/**
 * Authentication Gate Card.
 * Renders a secure, dark glassmorphic login interface when the administrator is unauthenticated.
 */
export function AdminLoginCard({
  authInput,
  setAuthInput,
  onLogin,
  authError,
  isVerifying,
}: AdminLoginCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,116,144,0.25),rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Branding Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_30px_rgba(8,145,178,0.25)]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">FABINS Deployment</h1>
          <p className="text-sm text-slate-400 mt-1">Executive Operations & Inquiries Dashboard</p>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 text-xs uppercase tracking-wider text-cyan-400 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Authentication Required</span>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </motion.div>
          )}

          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Administrator Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={authInput.username}
                  onChange={(e) => setAuthInput({ ...authInput, username: e.target.value })}
                  placeholder="admin"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={authInput.password}
                  onChange={(e) => setAuthInput({ ...authInput, password: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
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
