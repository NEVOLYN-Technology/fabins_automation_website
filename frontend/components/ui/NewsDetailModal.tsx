'use client'

import type { JSX } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, ExternalLink, Globe, Mail, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useModalHistory } from '@/lib/hooks/useModalHistory'

export interface NewsModalItem {
  id: string
  title: string
  description?: string
  content: string
  category: string
  date: string
  image?: string
  linkedinUrl?: string
  facebookUrl?: string
}

interface NewsDetailModalProps {
  item: NewsModalItem | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Helper to auto-link plain URLs and email addresses in regular text paragraphs
 */
function renderInlineLinks(text: string): (string | JSX.Element)[] {
  const urlOrEmailRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  const parts = text.split(urlOrEmailRegex)

  return parts.map((part, idx) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-800 underline underline-offset-2 transition-colors break-all"
        >
          <span>{part.replace(/^https?:\/\//, '')}</span>
          <ExternalLink size={12} className="shrink-0" />
        </a>
      )
    }
    if (part.includes('@') && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
      return (
        <a
          key={idx}
          href={`mailto:${part}`}
          className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2 transition-colors"
        >
          <Mail size={12} className="shrink-0" />
          <span>{part}</span>
        </a>
      )
    }
    return part
  })
}

/**
 * Checks if a paragraph is a contact/organization signature block
 */
function parseContactBlock(text: string) {
  const lower = text.toLowerCase()
  const hasWebsite = lower.includes('website:') || lower.includes('http://') || lower.includes('https://')
  const hasEmail = lower.includes('email:') || lower.includes('@nevolyn.com') || lower.includes('@')

  if (!hasWebsite && !hasEmail) return null

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  let name = lines[0] || 'Official Portal'
  let website = ''
  let email = ''

  for (const line of lines) {
    const webMatch = line.match(/https?:\/\/[^\s]+/i)
    if (webMatch) website = webMatch[0]

    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i)
    if (emailMatch) email = emailMatch[0]
  }

  if (name.toLowerCase().startsWith('website:') || name.toLowerCase().startsWith('email:')) {
    name = 'Official Portal'
  }

  return { name, website, email }
}

/**
 * Premium pop-up modal window displaying the full news details, photo,
 * and direct links to LinkedIn and Facebook.
 * Includes mobile-first back navigation (physical back button, swipe back, and prominent on-screen buttons).
 */
export function NewsDetailModal({ item, isOpen, onClose }: NewsDetailModalProps): JSX.Element | null {
  // Integrates browser history so phone back button / edge swipe closes the modal smoothly
  const { handleClose } = useModalHistory({
    isOpen: Boolean(isOpen && item),
    onClose,
    modalId: 'news-detail',
  })

  if (!item) return null

  // Check if image is a portrait photo to style container appropriately
  const isPortrait = item.image?.includes('photo')

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 lg:p-8 overscroll-contain">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm sm:backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-3xl bg-white shadow-2xl border-0 sm:border border-slate-200/90 overflow-hidden z-10 overscroll-contain"
          >
            {/* Sticky Top Navigation Bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
              {/* Category pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{item.category}</span>
              </span>

              {/* Prominent Close Button */}
              <button
                onClick={handleClose}
                type="button"
                aria-label="Close dialog"
                className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto no-scrollbar flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Hero Banner Header */}
              {item.image && (
                <div className={`relative w-full overflow-hidden ${isPortrait ? 'h-60 sm:h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950' : 'h-52 sm:h-72 bg-slate-900'}`}>
                  {/* Ambient background blur for portraits */}
                  {isPortrait && (
                    <img
                      src={item.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-125 pointer-events-none"
                    />
                  )}

                  <img
                    src={item.image}
                    alt={item.title}
                    className={`relative z-10 w-full h-full transition-transform duration-700 hover:scale-105 ${
                      isPortrait ? 'object-contain py-3' : 'object-cover object-center'
                    }`}
                  />

                  {/* Gradient shadow for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none z-10" />
                </div>
              )}

              {/* Main Body Content */}
              <div className="p-5 sm:p-8">
                {/* Meta details */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-semibold mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <Calendar size={14} className="text-sky-500" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  id="modal-title"
                  className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-4"
                >
                  {item.title}
                </h3>

                {/* Short preview highlight box */}
                {item.description && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50/90 to-indigo-50/60 border border-sky-100/90 text-slate-800 text-sm sm:text-base font-semibold leading-relaxed mb-6 shadow-xs">
                    {item.description}
                  </div>
                )}

                {/* Full Detailed Content with Hyperlinked Portals & Contact Cards */}
                <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
                  {item.content.split('\n\n').map((paragraph, index) => {
                    const contact = parseContactBlock(paragraph)
                    if (contact && (contact.website || contact.email)) {
                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/60 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-sky-300"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                              {contact.name}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {contact.website && (
                              <a
                                href={contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-sky-200/90 text-sky-700 hover:text-white hover:bg-sky-600 hover:border-transparent font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-95 group"
                              >
                                <Globe size={15} className="text-sky-500 group-hover:text-white transition-colors" />
                                <span>{contact.website.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink size={13} className="opacity-70 group-hover:text-white" />
                              </a>
                            )}
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-emerald-200/90 text-emerald-700 hover:text-white hover:bg-emerald-600 hover:border-transparent font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-95 group"
                              >
                                <Mail size={15} className="text-emerald-500 group-hover:text-white transition-colors" />
                                <span>{contact.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <p key={index} className="leading-relaxed whitespace-pre-line">
                        {renderInlineLinks(paragraph)}
                      </p>
                    )
                  })}
                </div>

                {/* Bottom Action Toolbar: Back Button & Social Links */}
                <div className="pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {item.linkedinUrl && (
                      <a
                        href={item.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-[#0a66c2] border border-[#0a66c2]/30 hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] active:bg-[#084e96] active:text-white transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span className="hidden sm:inline">View on </span>
                        <span>LinkedIn</span>
                        <ExternalLink size={13} className="hidden sm:inline opacity-80" />
                      </a>
                    )}

                    {item.facebookUrl && (
                      <a
                        href={item.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-[#1877f2] border border-[#1877f2]/30 hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] active:bg-[#0c63d4] active:text-white transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="hidden sm:inline">View on </span>
                        <span>Facebook</span>
                        <ExternalLink size={13} className="hidden sm:inline opacity-80" />
                      </a>
                    )}
                  </div>

                  {/* Back Button */}
                  <button
                    onClick={handleClose}
                    type="button"
                    className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md hover:shadow-slate-900/20 active:bg-black active:text-white transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0"
                  >
                    <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
                    <span className="hidden sm:inline">Back to Updates</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
