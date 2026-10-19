'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'
import {
  type DeploymentRecord,
  type InquiryRecord,
  type AdminCredentials,
  verifyAdminCredentials,
  fetchDeployments,
  updateDeploymentStatus,
  fetchInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '@/lib/api/admin'
import { AdminLoginCard } from '@/components/admin/AdminLoginCard'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminMetricsBanner } from '@/components/admin/AdminMetricsBanner'
import { AdminFilterToolbar } from '@/components/admin/AdminFilterToolbar'
import { DeploymentsTable } from '@/components/admin/DeploymentsTable'
import { InquiriesTable } from '@/components/admin/InquiriesTable'
import { DeploymentDetailModal } from '@/components/admin/DeploymentDetailModal'
import { InquiryDetailModal } from '@/components/admin/InquiryDetailModal'

/**
 * FABINS Operations & Executive Control Center.
 * Route: /admin
 *
 * Orchestrates secure authentication, real-time data synchronization with Spring Boot REST API,
 * dynamic search & filtering, inline status workflows, and detailed record inspections.
 */
export default function AdminDashboardPage() {
  // ── 1. Authentication State ───────────────────────────────────────────────
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null)
  const [authInput, setAuthInput] = useState<AdminCredentials>({ username: '', password: '' })
  const [authError, setAuthError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)

  // ── 2. Data & Tab State ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'deployments' | 'inquiries'>('deployments')
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([])
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── 3. Search & Filter State ──────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [deploymentStatusFilter, setDeploymentStatusFilter] = useState<string>('ALL')
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('ALL')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // ── 4. Inspection Modals & Clipboard State ────────────────────────────────
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRecord | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ── 5. Lifecycle & Session Storage ────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'FABINS Deployment - Executive Operations & Inquiries Dashboard'
      const savedAuth = sessionStorage.getItem('fabins_admin_auth')
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth)
          if (parsed.username && parsed.password) {
            setCredentials(parsed)
          }
        } catch {
          sessionStorage.removeItem('fabins_admin_auth')
        }
      }
    }
  }, [])

  // Auto-dismiss feedback toast messages after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // ── 6. Authentication Actions ─────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsVerifying(true)

    const valid = await verifyAdminCredentials(authInput)
    setIsVerifying(false)

    if (valid) {
      setCredentials(authInput)
      sessionStorage.setItem('fabins_admin_auth', JSON.stringify(authInput))
    } else {
      setAuthError('Invalid administrator credentials. Access refused.')
    }
  }

  const handleLogout = () => {
    setCredentials(null)
    sessionStorage.removeItem('fabins_admin_auth')
    setDeployments([])
    setInquiries([])
  }

  // ── 7. Data Synchronization ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!credentials) return
    setIsLoading(true)

    try {
      const [depRes, inqRes] = await Promise.all([
        fetchDeployments(credentials, { size: 100 }),
        fetchInquiries(credentials, { size: 100 }),
      ])
      setDeployments(depRes.content || [])
      setInquiries(inqRes.content || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to synchronize with server'
      setToastMessage({ type: 'error', text: msg })
    } finally {
      setIsLoading(false)
    }
  }, [credentials])

  useEffect(() => {
    if (credentials) {
      loadData()
    }
  }, [credentials, loadData])

  // ── 8. Status Mutations & Item Deletion ────────────────────────────────────
  const handleDeploymentStatusChange = async (id: string, newStatus: DeploymentRecord['status']) => {
    if (!credentials) return
    try {
      const updated = await updateDeploymentStatus(credentials, id, newStatus)
      setDeployments((prev) => prev.map((item) => (item.id === id ? updated : item)))
      if (selectedDeployment?.id === id) setSelectedDeployment(updated)
      setToastMessage({ type: 'success', text: `Deployment ${updated.referenceCode} moved to ${newStatus}` })
    } catch {
      setToastMessage({ type: 'error', text: 'Could not update status. Please try again.' })
    }
  }

  const handleInquiryStatusChange = async (id: string, newStatus: InquiryRecord['status']) => {
    if (!credentials) return
    try {
      const updated = await updateInquiryStatus(credentials, id, newStatus)
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)))
      if (selectedInquiry?.id === id) setSelectedInquiry(updated)
      setToastMessage({ type: 'success', text: `Inquiry ${updated.referenceCode} updated to ${newStatus}` })
    } catch {
      setToastMessage({ type: 'error', text: 'Could not update inquiry status.' })
    }
  }

  const handleDeleteInquiry = async (id: string, ref: string) => {
    if (!credentials) return
    if (!window.confirm(`Are you sure you want to permanently delete inquiry ${ref}?`)) return

    try {
      await deleteInquiry(credentials, id)
      setInquiries((prev) => prev.filter((item) => item.id !== id))
      if (selectedInquiry?.id === id) setSelectedInquiry(null)
      setToastMessage({ type: 'success', text: `Inquiry ${ref} deleted.` })
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to delete inquiry.' })
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── 9. Filter & Sort Memoization ──────────────────────────────────────────
  const filteredDeployments = useMemo(() => {
    return deployments
      .filter((d) => {
        const matchesStatus = deploymentStatusFilter === 'ALL' || d.status === deploymentStatusFilter
        const q = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !q ||
          d.referenceCode.toLowerCase().includes(q) ||
          d.millName.toLowerCase().includes(q) ||
          d.contactName.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.phone.toLowerCase().includes(q) ||
          (d.machineBrand && d.machineBrand.toLowerCase().includes(q)) ||
          d.location.toLowerCase().includes(q)
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        const tA = new Date(a.submittedAt).getTime()
        const tB = new Date(b.submittedAt).getTime()
        return sortOrder === 'desc' ? tB - tA : tA - tB
      })
  }, [deployments, deploymentStatusFilter, searchTerm, sortOrder])

  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter((i) => {
        const matchesStatus = inquiryStatusFilter === 'ALL' || i.status === inquiryStatusFilter
        const q = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !q ||
          i.referenceCode.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q) ||
          (i.message && i.message.toLowerCase().includes(q))
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        const tA = new Date(a.createdAt).getTime()
        const tB = new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? tB - tA : tA - tB
      })
  }, [inquiries, inquiryStatusFilter, searchTerm, sortOrder])

  // Summary Metrics
  const metrics = useMemo(() => ({
    depTotal: deployments.length,
    depNew: deployments.filter((d) => d.status === 'NEW').length,
    depInReview: deployments.filter((d) => d.status === 'IN_REVIEW').length,
    inqTotal: inquiries.length,
    inqNew: inquiries.filter((i) => i.status === 'NEW').length,
  }), [deployments, inquiries])

  // ── 10. Render Auth Barrier or Dashboard ───────────────────────────────────
  if (!credentials) {
    return (
      <AdminLoginCard
        authInput={authInput}
        setAuthInput={setAuthInput}
        onLogin={handleLogin}
        authError={authError}
        isVerifying={isVerifying}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20">
      {/* Toast Feedback Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm flex items-center gap-2.5 backdrop-blur-md ${toastMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/80 border-red-500/40 text-red-200'
              }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <AdminHeader
        username={credentials.username}
        isLoading={isLoading}
        onRefresh={loadData}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* KPI Metrics */}
        <AdminMetricsBanner metrics={metrics} />

        {/* Tab & Filter Toolbar */}
        <AdminFilterToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          deploymentsCount={deployments.length}
          inquiriesCount={inquiries.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          deploymentStatusFilter={deploymentStatusFilter}
          setDeploymentStatusFilter={setDeploymentStatusFilter}
          inquiryStatusFilter={inquiryStatusFilter}
          setInquiryStatusFilter={setInquiryStatusFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Active Tab Data Table */}
        {activeTab === 'deployments' ? (
          <DeploymentsTable
            deployments={filteredDeployments}
            searchTerm={searchTerm}
            statusFilter={deploymentStatusFilter}
            copiedId={copiedId}
            onCopy={handleCopyCode}
            onStatusChange={handleDeploymentStatusChange}
            onSelect={setSelectedDeployment}
          />
        ) : (
          <InquiriesTable
            inquiries={filteredInquiries}
            searchTerm={searchTerm}
            statusFilter={inquiryStatusFilter}
            copiedId={copiedId}
            onCopy={handleCopyCode}
            onStatusChange={handleInquiryStatusChange}
            onSelect={setSelectedInquiry}
            onDelete={handleDeleteInquiry}
          />
        )}
      </main>

      {/* Detail Inspection Modals */}
      <DeploymentDetailModal
        deployment={selectedDeployment}
        onClose={() => setSelectedDeployment(null)}
      />

      <InquiryDetailModal
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
      />
    </div>
  )
}
