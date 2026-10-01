'use client'

import type { JSX } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, ExternalLink, Globe, Mail, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useModalHistory } from '@/lib/hooks/useModalHistory'
import { ImageLightboxModal } from './ImageLightboxModal'

export interface NewsModalItem {
  id: string
  title: string
  description?: string
  content: string
  category: string
  date: string
  /** Main show card image */
  image?: string
  /** Secondary image in detail view */
  secondaryImage?: string
  /** Complete gallery list in deterministic order: [main, secondary1, secondary2, ...] */
  images?: string[]
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
          className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2 transition-colors break-all"
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
 * Premium pop-up modal window displaying the full news details, multi-image hero carousel,
 * event gallery grid, full body content, and direct social links.
 * Includes mobile-first back navigation and zero-lag photo lightbox integration.
 */
export function NewsDetailModal({ item, isOpen, onClose }: NewsDetailModalProps): JSX.Element | null {
  // Integrates browser history so phone back button / edge swipe closes the modal smoothly
  const { handleClose } = useModalHistory({
    isOpen: Boolean(isOpen && item),
    onClose,
    modalId: 'news-detail',
  })

  // Full-screen zero-lag lightbox state
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const heroScrollRef = useRef<HTMLDivElement>(null)

  // Construct complete gallery list in deterministic order: [main, secondary1, secondary2, ...]
  const modalImages: string[] = item
    ? item.images && item.images.length > 0
      ? item.images
      : [item.image, item.secondaryImage].filter((img): img is string => Boolean(img))
    : []

  // Reset to first photo whenever opened or item changes
  useEffect(() => {
    setActiveImageIndex(0)
    const el = heroScrollRef.current
    if (el) {
      el.scrollLeft = 0
    }
  }, [item?.id, isOpen])

  // Real-time horizontal scroll tracking for hero banner
  const handleHeroScroll = useCallback(() => {
    const el = heroScrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width)
      if (newIndex >= 0 && newIndex < modalImages.length && newIndex !== activeImageIndex) {
        setActiveImageIndex(newIndex)
      }
    }
  }, [modalImages.length, activeImageIndex])

  // Scroll hero track to a target index smoothly
  const scrollToHeroIndex = useCallback((index: number) => {
    const el = heroScrollRef.current
    if (!el) return
    const targetLeft = index * el.clientWidth
    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
    setActiveImageIndex(index)
  }, [])

  if (!item) return null

  const isMultiple = modalImages.length > 1

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-8 overscroll-contain">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm lg:backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Modal Container: Fullscreen on mobile & iPad vertical, floating centered dialog on iPad horizontal & web */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full h-[100dvh] lg:h-auto lg:max-w-2xl lg:max-h-[92vh] flex flex-col rounded-none lg:rounded-3xl bg-white shadow-2xl border-0 lg:border border-slate-200/90 overflow-hidden z-10 overscroll-contain"
            >
              {/* Sticky Top Navigation Bar */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-2.5 lg:py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
                {/* Category pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] lg:text-xs font-black tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span className="truncate max-w-[200px] lg:max-w-xs">{item.category}</span>
                </span>

                {/* Prominent Close Button */}
                <button
                  onClick={handleClose}
                  type="button"
                  aria-label="Close dialog"
                  className="p-1.5 lg:p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <X className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.2} />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div
                className="overflow-y-auto overflow-x-hidden no-scrollbar flex-1 overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* ================================================================= */}
                {/* 3. Detail Modal Hero Banner with Horizontal Scroll Snap          */}
                {/* ================================================================= */}
                {modalImages.length > 0 && (
                  <div className="relative w-full h-56 lg:h-72 bg-slate-900 overflow-hidden group/hero select-none">
                    {/* CSS Scroll Snapping Viewport */}
                    <div
                      ref={heroScrollRef}
                      onScroll={handleHeroScroll}
                      className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth"
                    >
                      {modalImages.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveImageIndex(idx)
                            setIsPhotoOpen(true)
                          }}
                          className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center cursor-zoom-in relative"
                        >
                          <img
                            src={imgSrc}
                            alt={`${item.title} — Photo ${idx + 1}`}
                            className="w-full h-full object-contain p-2 sm:p-3 pointer-events-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Gradient shadows */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Floating Zoom-In Hint / Photo Badge */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
                      {isMultiple && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs shadow-xs">
                          Photo {activeImageIndex + 1} of {modalImages.length}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/50 text-white/90 backdrop-blur-xs shadow-xs">
                        <ZoomIn size={12} />
                        <span>Click to expand</span>
                      </span>
                    </div>

                    {/* Floating Navigation Arrows */}
                    {isMultiple && activeImageIndex > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          scrollToHeroIndex(activeImageIndex - 1)
                        }}
                        aria-label="Previous photo"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/55 hover:bg-black/85 text-white/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}

                    {isMultiple && activeImageIndex < modalImages.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          scrollToHeroIndex(activeImageIndex + 1)
                        }}
                        aria-label="Next photo"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/55 hover:bg-black/85 text-white/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}

                    {/* Interactive Pill Dots */}
                    {isMultiple && (
                      <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
                        {modalImages.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              scrollToHeroIndex(idx)
                            }}
                            aria-label={`Go to photo ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === activeImageIndex
                                ? 'w-3.5 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                                : 'w-1.5 bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Body Content */}
                <div className="p-4 sm:p-8">
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
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50/90 to-indigo-50/60 border border-sky-100/90 text-slate-800 text-sm sm:text-base font-semibold leading-relaxed mb-6 shadow-xs select-text cursor-default">
                      {item.description}
                    </div>
                  )}

                  {/* Event Gallery Grid (when item has multiple images) */}
                  {isMultiple && (
                    <div className="mb-6 pt-1">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <span>Event Gallery</span>
                          <span className="text-[11px] text-slate-500 font-semibold lowercase">
                            ({modalImages.length} photos)
                          </span>
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          Click photo to expand
                        </span>
                      </div>

                      <div
                        className={`grid gap-2 sm:gap-3 ${
                          modalImages.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
                        }`}
                      >
                        {modalImages.map((imgSrc, idx) => {
                          const isActive = idx === activeImageIndex
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setActiveImageIndex(idx)
                                scrollToHeroIndex(idx)
                                setIsPhotoOpen(true)
                              }}
                              className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-zoom-in border-2 transition-all duration-200 bg-slate-900 shadow-xs ${
                                isActive
                                  ? 'border-sky-500 ring-2 ring-sky-400/40 shadow-md'
                                  : 'border-slate-200 hover:border-sky-400'
                              }`}
                            >
                              <img
                                src={imgSrc}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                              />
                              <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs ${
                                    idx === 0 ? 'bg-sky-500 text-white' : 'bg-black/60 text-white'
                                  }`}
                                >
                                  {idx === 0 ? 'Photo 1 • Main' : `Photo ${idx + 1}`}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Full Detailed Content with Hyperlinked Portals & Contact Cards */}
                  <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 mb-8 select-text cursor-default">
                    {item.content.split('\n\n').map((paragraph, index) => {
                      const contact = parseContactBlock(paragraph)
                      if (contact && (contact.website || contact.email)) {
                        return (
                          <div
                            key={index}
                            className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/60 p-3 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-sky-300 w-full overflow-hidden"
                          >
                            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse shrink-0" />
                              <h4 className="font-extrabold text-slate-900 text-xs sm:text-base tracking-tight truncate">
                                {contact.name}
                              </h4>
                            </div>

                            <div
                              className={`grid gap-1.5 sm:gap-2.5 w-full ${
                                contact.website && contact.email ? 'grid-cols-2' : 'grid-cols-1'
                              }`}
                            >
                              {/* Email on LEFT */}
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  title={contact.email}
                                  onClick={(e) => e.stopPropagation()}
                                  className="min-w-0 w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-xl bg-white border border-emerald-200/90 text-emerald-700 hover:text-white hover:bg-emerald-600 hover:border-transparent font-bold text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm shadow-xs transition-all duration-200 active:scale-95 group overflow-hidden"
                                >
                                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-500 group-hover:text-white transition-colors" />
                                  <span className="truncate">{contact.email}</span>
                                </a>
                              )}

                              {/* Website on RIGHT */}
                              {contact.website && (
                                <a
                                  href={contact.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={contact.website}
                                  onClick={(e) => e.stopPropagation()}
                                  className="min-w-0 w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-xl bg-white border border-sky-200/90 text-sky-700 hover:text-white hover:bg-sky-600 hover:border-transparent font-bold text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm shadow-xs transition-all duration-200 active:scale-95 group overflow-hidden"
                                >
                                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-sky-500 group-hover:text-white transition-colors" />
                                  <span className="truncate">{contact.website.replace(/^https?:\/\//, '')}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:text-white hidden min-[440px]:inline-block sm:inline-block" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <p key={index} className="leading-relaxed whitespace-pre-line text-justify">
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
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View on LinkedIn"
                          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#0a66c2] bg-white border border-[#0a66c2]/30 shadow-xs hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] active:bg-[#084e96] active:text-white transition-all duration-200 active:scale-95 shrink-0"
                        >
                          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          <span className="hidden lg:inline">LinkedIn</span>
                        </a>
                      )}

                      {item.facebookUrl && (
                        <a
                          href={item.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View on Facebook"
                          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#1877f2] bg-white border border-[#1877f2]/30 shadow-xs hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] active:bg-[#145dbf] active:text-white transition-all duration-200 active:scale-95 shrink-0"
                        >
                          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span className="hidden lg:inline">Facebook</span>
                        </a>
                      )}
                    </div>

                    {/* Back Button */}
                    <button
                      onClick={handleClose}
                      type="button"
                      className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md hover:shadow-slate-900/20 active:bg-black active:text-white transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0"
                    >
                      <ArrowLeft
                        size={16}
                        className="transition-transform duration-200 group-hover:-translate-x-1 shrink-0"
                      />
                      <span className="hidden lg:inline">Back to Updates</span>
                      <span className="lg:hidden">Back</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zero-Lag Fullscreen Photo Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        title={item.title}
        images={modalImages}
        initialIndex={activeImageIndex}
        onIndexChange={(newIdx) => {
          setActiveImageIndex(newIdx)
          scrollToHeroIndex(newIdx)
        }}
      />
    </>
  )
}
