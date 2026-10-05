'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '@/components/layout/PageShell'
import { submitDeploymentRequest, type DeploymentRequest } from '@/lib/api/contact'
import {
  EMPTY_FORM,
  type FormStatus,
} from '@/lib/constants/deploy'
import { DeployHeaderTracker } from '@/components/deploy/DeployHeaderTracker'
import { DeployFormCards } from '@/components/deploy/DeployFormCards'
import { DeployPreviewView } from '@/components/deploy/DeployPreviewView'
import { DeploySuccessView } from '@/components/deploy/DeploySuccessView'

export default function DeployPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const [fromSource, setFromSource] = useState<string>('')
  const [status, setStatus] = useState<FormStatus>('editing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<DeploymentRequest>(EMPTY_FORM)
  const [referenceCode, setReferenceCode] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  // Set browser tab title & track routing origin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'FABINS Deployment'
      const params = new URLSearchParams(window.location.search)
      const from = params.get('from')
      if (from) {
        setFromSource(from)
      } else if (
        document.referrer &&
        (document.referrer.includes('#contact') || document.referrer.includes('contact'))
      ) {
        setFromSource('contact')
      }
    }
  }, [])

  // Page routing handler: goes back to exactly where the user came from
  const handleBack = () => {
    if (status === 'previewing') {
      setStatus('editing')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Prevent leaving to external domain if opened from outside
      if (document.referrer && !document.referrer.includes(window.location.host)) {
        router.push('/')
        return
      }
      router.back()
      return
    }

    if (fromSource === 'contact') {
      router.push('/#contact')
      return
    }

    router.push('/')
  }

  const updateField =
    (field: keyof DeploymentRequest) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const setFieldValue = (field: keyof DeploymentRequest, value: string, toggle = true) => {
    setFormData((prev) => ({
      ...prev,
      [field]: toggle && prev[field] === value ? '' : value,
    }))
  }

  const copyTrackingCode = async () => {
    if (!referenceCode) return
    try {
      await navigator.clipboard.writeText(referenceCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      // fallback
    }
  }

  // Email format validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handle Initial Form Submission -> Validates all 8 credentials and moves to Preview
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!formData.millName?.trim()) {
      setErrorMessage('Please enter Mill / Factory Name.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!formData.machineBrand?.trim()) {
      setErrorMessage('Please enter Machine / Frame Brand (e.g. Bianco, Lafer, Santex, Local Frame).')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!formData.location?.trim()) {
      setErrorMessage('Please enter Factory Location / Zone.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!formData.contactName?.trim()) {
      setErrorMessage('Please enter Technical Representative Name.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!formData.email?.trim() || !isValidEmail(formData.email.trim())) {
      setErrorMessage('Please enter a valid Work Email Address for receiving confirmation & PDF copy.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!formData.phone?.trim() || formData.phone.trim().length < 5) {
      setErrorMessage('Please enter a valid Phone or WhatsApp Number.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!formData.factoryType || !formData.factoryType.trim()) {
      setErrorMessage('Please select a Factory Sector / Operation Type.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (formData.factoryType.startsWith('Other') && formData.factoryType.trim() === 'Other:') {
      setErrorMessage('Please enter your custom Factory Sector or choose one from the list.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!formData.rollWidth || !formData.rollWidth.trim()) {
      setErrorMessage('Please select Fabric Roll / Table Width.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (formData.rollWidth.startsWith('Custom') && formData.rollWidth.trim() === 'Custom:') {
      setErrorMessage('Please enter your custom Roll / Table Width or choose one from the list.')
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // All 8 credentials validated: transition to preview
    setStatus('previewing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Final Confirmed Dispatch from Preview View to fabins@nevolyn.com and sender
  const handleConfirmSubmit = async () => {
    setErrorMessage(null)
    setStatus('sending')

    const result = await submitDeploymentRequest(formData)

    if (result.ok) {
      setReferenceCode(
        result.referenceCode ||
          `FAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      )
      setStatus('submitted')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setStatus('previewing')
      setErrorMessage(result.error)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isSending = status === 'sending'

  return (
    <PageShell>
      <div className="relative pt-8 sm:pt-12 pb-20 overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-accent/15 blur-[140px]" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[600px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 relative z-10">
          {/* Header Bar: Back Button & Title */}
          <DeployHeaderTracker onBack={handleBack} />
        </div>

        {/* Dynamic Multi-State Container */}
        <AnimatePresence mode="wait">
          {status === 'submitted' ? (
            <DeploySuccessView
              referenceCode={referenceCode}
              copiedCode={copiedCode}
              onCopyCode={copyTrackingCode}
              senderEmail={formData.email}
              formData={formData}
              onResetForm={() => {
                setStatus('editing')
                setFormData(EMPTY_FORM)
              }}
            />
          ) : status === 'previewing' || status === 'sending' ? (
            <div className="space-y-6 pt-4 sm:pt-6">
              {/* Error Banner if submission had an issue */}
              {errorMessage && (
                <div className="mx-auto max-w-4xl px-5 sm:px-6">
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs sm:text-sm font-semibold text-rose-500 flex items-center gap-3 animate-shake">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <DeployPreviewView
                formData={formData}
                onBackToEdit={() => {
                  setStatus('editing')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onConfirmSubmit={handleConfirmSubmit}
                isSending={isSending}
              />
            </div>
          ) : (
            <div className="mx-auto max-w-4xl px-5 sm:px-6">
              <motion.form
                ref={formRef}
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="w-full rounded-2xl sm:rounded-3xl border border-line bg-panel/95 shadow-2xl backdrop-blur-xl overflow-hidden"
              >
                <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7">
                  {/* Validation Error Banner */}
                  {errorMessage && (
                    <div
                      ref={errorRef}
                      className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs sm:text-sm font-semibold text-rose-500 flex items-center gap-3 animate-shake"
                    >
                      <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Form Cards (Card 1, Card 2 & Submit Bar) */}
                  <DeployFormCards
                    formData={formData}
                    updateField={updateField}
                    setFieldValue={setFieldValue}
                    isSending={isSending}
                  />
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}
