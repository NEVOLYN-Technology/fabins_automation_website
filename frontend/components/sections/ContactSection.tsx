'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Loader2,
  Rocket,
  Send,
  Sparkles,
} from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { fadeUpProps } from '@/lib/animations'
import { useContactForm } from '@/lib/hooks/useContactForm'

const LinkedInIcon = ({ className = 'w-3.5 h-3.5 fill-current shrink-0' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
)

const FacebookIcon = ({ className = 'w-3.5 h-3.5 fill-current shrink-0' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

/**
 * CONTACT SECTION — "Let's Connect" general enquiry form.
 *
 * Renders a styled contact form (name / email / subject / message) that posts
 * to `POST /api/v1/contact-inquiries` on the Spring Boot backend. Includes:
 *
 * - **Honeypot** bot protection: a hidden field that must stay empty.
 * - **Loading state**: disabled button with a spinner while the request is in
 *   flight.
 * - **Success card**: replaces the form with a tracking reference code and a
 *   "Send another" link, so the user can submit again without a page reload.
 * - **Error banner**: inline error message when the server rejects the request.
 * - **Deploy CTA**: a small callout below the form points to `/deploy` for
 *   visitors who want to submit a full RMG factory assessment instead of a
 *   general message.
 *
 * All form state and HTTP logic lives in {@link useContactForm} — this
 * component is intentionally a pure rendering layer with no fetch calls.
 */
export const ContactSection = () => {
  const { formData, setFormData, handleSubmit, isLoading, result, reset } = useContactForm()

  /** Shared input class string — extracted to avoid repetition in JSX. */
  const inputClass =
    'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft ' +
    'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors'

  return (
    <Section id="contact">
      <div className="mx-auto max-w-3xl">
        {/* ── Section header ───────────────────────────────────────────────── */}
        <div className="mb-8 text-center space-y-3">
          <motion.h2
            {...fadeUpProps(0.05)}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink flex items-center justify-center gap-3"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            LET&#39;S CONNECT
          </motion.h2>

          <motion.p
            {...fadeUpProps(0.1)}
            className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-ink-muted"
          >
            Reach out for deployments, partnerships, or general inquiries. Our team responds within 1–2 business days.
          </motion.p>

          {/* ── Quick Channels & Direct Access Hub (Clean & Refined) ───────────── */}
          <motion.div {...fadeUpProps(0.14)} className="pt-4 text-left">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* Card 1: FABINS Automation */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-panel p-4 shadow-xs transition-all duration-200 hover:border-line-strong hover:shadow-sm">
                <div>
                  <div className="mb-3.5 flex items-center justify-between">
                    <h4 className="text-sm font-bold tracking-tight text-ink">FABINS Automation</h4>
                    <span className="rounded-full border border-accent/30 bg-accent-quiet px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
                      Deployment
                    </span>
                  </div>

                  <Link
                    href="/deploy"
                    className="group flex w-full items-center justify-between gap-2 rounded-xl border border-accent/30 bg-accent-quiet px-3.5 py-2.5 text-xs font-bold text-accent transition-all duration-200 hover:bg-accent hover:text-white hover:border-accent hover:shadow-sm active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <Rocket className="h-3.5 w-3.5 shrink-0" />
                      <span>Factory Deployment Form</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="mt-3.5 flex items-center gap-1 sm:gap-1.5 border-t border-line/60 pt-3">
                  <a
                    href="https://fabins.nevolyn.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FABINS Official Website"
                    className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/35 bg-accent-quiet px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-bold text-accent transition-all duration-200 hover:border-accent hover:bg-accent hover:text-white active:scale-95 shadow-2xs"
                  >
                    <Globe className="h-3 w-3 shrink-0" />
                    <span>fabins.nevolyn.com</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/fabinsautomation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FABINS on LinkedIn"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-panel px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-semibold text-ink-muted transition-all duration-200 hover:border-[#0a66c2] hover:bg-[#0a66c2] hover:text-white active:scale-95 shadow-2xs"
                  >
                    <LinkedInIcon className="w-3 h-3 fill-[#0a66c2] group-hover:fill-white transition-colors shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.facebook.com/fabinsautomation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FABINS on Facebook"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-panel px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-semibold text-ink-muted transition-all duration-200 hover:border-[#1877f2] hover:bg-[#1877f2] hover:text-white active:scale-95 shadow-2xs"
                  >
                    <FacebookIcon className="w-3 h-3 fill-[#1877f2] group-hover:fill-white transition-colors shrink-0" />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>

              {/* Card 2: NEVOLYN Technology */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-panel p-4 shadow-xs transition-all duration-200 hover:border-line-strong hover:shadow-sm">
                <div>
                  <div className="mb-3.5 flex items-center justify-between">
                    <a
                      href="https://nevolyn.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visit NEVOLYN Technology"
                      className="text-sm font-bold tracking-tight text-ink hover:text-accent transition-colors"
                    >
                      NEVOLYN Technology
                    </a>
                  </div>

                  <a
                    href="https://nevolyn.com/join_us"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-between gap-2 rounded-xl border border-line-strong/60 bg-panel px-3.5 py-2.5 text-xs font-bold text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-sm active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span>Join NEVOLYN · Careers &amp; Team</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>

                <div className="mt-3.5 flex items-center gap-1 sm:gap-1.5 border-t border-line/60 pt-3">
                  <a
                    href="https://nevolyn.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="NEVOLYN Official Website"
                    className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0e7490]/35 bg-[#0e7490]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-bold text-[#0e7490] transition-all duration-200 hover:border-[#0e7490] hover:bg-[#0e7490] hover:text-white active:scale-95 shadow-2xs"
                  >
                    <Globe className="h-3 w-3 shrink-0" />
                    <span>nevolyn.com</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/nevolyn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="NEVOLYN on LinkedIn"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-panel px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-semibold text-ink-muted transition-all duration-200 hover:border-[#0a66c2] hover:bg-[#0a66c2] hover:text-white active:scale-95 shadow-2xs"
                  >
                    <LinkedInIcon className="w-3 h-3 fill-[#0a66c2] group-hover:fill-white transition-colors shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.facebook.com/nevolyn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="NEVOLYN on Facebook"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-panel px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-semibold text-ink-muted transition-all duration-200 hover:border-[#1877f2] hover:bg-[#1877f2] hover:text-white active:scale-95 shadow-2xs"
                  >
                    <FacebookIcon className="w-3 h-3 fill-[#1877f2] group-hover:fill-white transition-colors shrink-0" />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Form card ────────────────────────────────────────────────────── */}
        <motion.div {...fadeUpProps(0.14)} className="mt-10">
          <div className="rounded-3xl border border-line bg-panel/90 p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(8,145,178,0.12)] backdrop-blur-xl">

            {/* ── Success state ─────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {result?.ok === true ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-8 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-quiet text-accent border border-accent/30">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-ink">Message Received!</h3>
                  <p className="text-sm text-ink-muted max-w-sm">
                    Thank you for reaching out. Our R&amp;D team will reply to your message within
                    1–2 working days.
                  </p>
                  {result.referenceCode && (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-quiet px-4 py-2">
                      <span className="text-xs text-ink-muted">Reference:</span>
                      <code className="text-xs font-bold text-accent font-mono">
                        {result.referenceCode}
                      </code>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-2 text-sm font-semibold text-accent hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* ── Honeypot (invisible to real users) ─────────────────── */}
                  {/*
                   * This input is hidden with CSS and never shown or labelled.
                   * A bot that fills every visible field will also fill this one,
                   * and the backend uses that as the signal to silently fake success.
                   */}
                  <input
                    type="text"
                    name="website_url"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={formData.honeypot}
                    onChange={e => setFormData(p => ({ ...p, honeypot: e.target.value }))}
                    className="hidden"
                  />

                  {/* ── Error banner ──────────────────────────────────────── */}
                  {result?.ok === false && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {result.error}
                    </motion.div>
                  )}

                  {/* ── Name & Email row ──────────────────────────────────── */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
                        Full Name <span className="text-accent">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
                        Email Address <span className="text-accent">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="your@company.com"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* ── Subject ───────────────────────────────────────────── */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
                      Subject <span className="text-accent">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      required
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* ── Message ───────────────────────────────────────────── */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
                      Message <span className="text-accent">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* ── Submit button ─────────────────────────────────────── */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    id="contact-submit-btn"
                    className="btn btn-primary w-full justify-center !py-3.5 text-sm font-bold shadow-lg group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </Section>
  )
}