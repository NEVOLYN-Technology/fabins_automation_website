/**
 * LatestNewsSection — Featured Milestones (4 major institutional milestones in 3D carousel) and
 * Latest News (vertical scroll timeline showing 4 news at once, scrolling row-by-row).
 *
 * Ordering:
 * - Featured Milestones: Newest (Award/Prize) -> Earliest (First POC at Saturn)
 * - Latest News: Reverse chronological order (Newest -> Top, Oldest -> Bottom)
 *   with vertical row-by-row scrolling (4 news visible at once).
 *
 * @module components/sections/LatestNewsSection
 */
'use client'

import type { JSX } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Star, Eye, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { featuredMilestones } from '@/lib/data/featured-milestones'
import { news, type NewsItem } from '@/lib/data/latest-news'
import { fadeLeftProps, fadeUpProps } from '@/lib/animations'
import { formatDate, cn } from '@/lib/utils'
import { SectionHeader, GradText } from '@/components/ui/SectionHeader'
import { SECTION_BG } from '@/lib/constants/theme'
import { NewsDetailModal, type NewsModalItem } from '@/components/ui/NewsDetailModal'

/**
 * News timeline section rendering featured project announcements in a 3D carousel and
 * recent updates in a smooth vertical row-by-row scroll stage.
 *
 * @returns Rendered news section component
 */
export const LatestNewsSection = (): JSX.Element => {
  // Active selected item for the "View Details" pop-up modal
  const [selectedNews, setSelectedNews] = useState<NewsModalItem | null>(null)

  // Ref for the vertical scroll feed
  const verticalScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(true)

  // Sort complete objects strictly by date descending: Newest -> Top/First, Oldest -> Bottom/Last
  const sortedFeatured = [...featuredMilestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const sortedNews = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // ── Featured Milestones Carousel (SystemSection scroll behavior) ──────────
  const [centeredIndex, setCenteredIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  /** Finds the milestone card closest to the container's horizontal centre */
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const containerCenter = container.scrollLeft + container.clientWidth / 2

    let minDistance = Infinity
    let closestIndex = 0

    container.querySelectorAll<HTMLElement>('[data-milestone-index]').forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(containerCenter - cardCenter)

      if (distance < minDistance) {
        minDistance = distance
        closestIndex = Number(card.getAttribute('data-milestone-index'))
      }
    })

    setCenteredIndex(closestIndex)
  }, [])

  /** Scrolls the milestone card at `index` to the centre of the track */
  const scrollToCard = useCallback((index: number) => {
    const container = scrollContainerRef.current
    if (!container) return

    const targetCard = container.querySelectorAll<HTMLElement>('[data-milestone-index]')[index]
    if (!targetCard) return

    const targetLeft = targetCard.offsetLeft - container.clientWidth / 2 + targetCard.offsetWidth / 2
    container.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Set initial centred card

    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const activeIndex = Math.min(Math.max(0, centeredIndex), Math.max(0, sortedFeatured.length - 1))

  // Both arrows wrap around smoothly with no dead ends
  const handlePrev = () => scrollToCard(activeIndex > 0 ? activeIndex - 1 : sortedFeatured.length - 1)
  const handleNext = () => scrollToCard(activeIndex < sortedFeatured.length - 1 ? activeIndex + 1 : 0)

  // Check scroll boundary state for vertical scroll arrows
  const checkVerticalScroll = () => {
    if (!verticalScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = verticalScrollRef.current
    setCanScrollUp(scrollTop > 20)
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 20)
  }

  useEffect(() => {
    const el = verticalScrollRef.current
    if (!el) return
    checkVerticalScroll()
    el.addEventListener('scroll', checkVerticalScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkVerticalScroll)
  }, [sortedNews.length])

  // Scroll exactly one line / row of news
  const scrollVertical = (direction: 'up' | 'down') => {
    if (!verticalScrollRef.current) return
    const cardEl = verticalScrollRef.current.querySelector<HTMLElement>('[data-news-card]')
    const rowStep = cardEl ? cardEl.offsetHeight + 20 : 220
    const scrollAmount = direction === 'down' ? rowStep : -rowStep

    verticalScrollRef.current.scrollBy({
      top: scrollAmount,
      behavior: 'smooth',
    })

    setTimeout(checkVerticalScroll, 350)
  }

  return (
    <section id="news" className={`relative py-16 sm:py-20 ${SECTION_BG.primary} ${SECTION_BG.border} overflow-hidden`}>
      {/* Background Ambient Glow Orbs - Multi-chromatic Soft Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-sky-400/20 via-indigo-400/15 to-emerald-400/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ────────────────────────────────────────────── */}
        <SectionHeader
          pillLabel="UPDATES & MILESTONES"
          title={
            <>
              Progress.{' '}
              <GradText variant="sky">Impact.</GradText>{' '}
              <GradText variant="emerald">Momentum.</GradText>
            </>
          }
          description="Official announcements, industrial partnerships, capital allocations, and technology breakthroughs shaping the trajectory of NEVOLYN Technology & FABINS."
        />

        {/* ========================================================================= */}
        {/* 1. FEATURED MILESTONES (SystemSection-style Snap Carousel) */}
        {/* ========================================================================= */}
        {sortedFeatured.length > 0 && (
          <motion.div {...fadeUpProps(0.15)} className="mb-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  Featured Milestones
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Key institutional breakthroughs and partnerships
                </p>
              </div>
            </div>

            {/* Carousel Stage with SystemSection Controls */}
            <div className="relative w-full py-4">
              {/* Prev / Next arrow buttons */}
              {sortedFeatured.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous milestone"
                    className="group absolute left-2 top-1/2 z-40 -translate-y-1/2 cursor-pointer rounded-full border border-line bg-panel/90 p-3 text-ink-muted shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent active:scale-95 sm:left-4"
                  >
                    <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next milestone"
                    className="group absolute right-2 top-1/2 z-40 -translate-y-1/2 cursor-pointer rounded-full border border-line bg-panel/90 p-3 text-ink-muted shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent active:scale-95 sm:right-4"
                  >
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </>
              )}

              {/* Native Smooth Scroll Track matching SystemSection padding & snapping */}
              <div
                ref={scrollContainerRef}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                className="flex snap-x snap-mandatory select-none gap-6 overflow-x-auto scroll-smooth px-[calc(50%-150px)] py-6 sm:px-[calc(50%-210px)] lg:px-[calc(50%-230px)] no-scrollbar"
              >
                {sortedFeatured.map((item, index) => {
                  const isCentered = index === activeIndex

                  return (
                    <div
                      key={item.id}
                      data-milestone-index={index}
                      onClick={() => scrollToCard(index)}
                      className={cn(
                        'w-[300px] shrink-0 snap-center sm:w-[420px] lg:w-[460px]',
                        'group transform cursor-pointer rounded-[28px] p-[1.5px] transition-all duration-500 ease-out',
                        isCentered
                          ? 'z-20 -translate-y-3 scale-105 bg-gradient-to-b from-accent/80 via-accent-bright/50 to-blue-600/30 opacity-100 filter blur-0 shadow-[0_20px_50px_rgba(8,145,178,0.35),0_0_25px_rgba(8,145,178,0.2)]'
                          : 'z-10 translate-y-2 scale-95 bg-line/40 opacity-60 shadow-lg filter blur-[1.5px] hover:opacity-90 hover:blur-0'
                      )}
                    >
                      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[26px] bg-panel/95 backdrop-blur-2xl">
                        {/* Accent beam across top edge */}
                        <div
                          className={cn(
                            'absolute left-0 right-0 top-0 h-1.5 rounded-t-3xl transition-all duration-500 z-20',
                            isCentered
                              ? 'bg-gradient-to-r from-accent via-accent-bright to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                              : 'bg-line'
                          )}
                        />

                        {/* Card Image Header */}
                        <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-slate-900 shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Card Content Body */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Dynamic Category & Date Header Row */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pt-1">
                              {(() => {
                                const cat = item.category.toLowerCase()
                                const isGreen = cat.includes('partner') || cat.includes('award') || cat.includes('prize')
                                const isRed = cat.includes('poc') || cat.includes('demonstration')
                                const colorClasses = isGreen
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 fill-emerald-600'
                                  : isRed
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 fill-rose-600'
                                    : 'bg-sky-50 text-sky-700 border-sky-200 fill-sky-600'

                                return (
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-xs",
                                    colorClasses
                                  )}>
                                    <Star className="w-3.5 h-3.5" />
                                    <span>{item.category}</span>
                                  </div>
                                )
                              })()}

                              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-accent" />
                                <span>{formatDate(item.date)}</span>
                              </div>
                            </div>

                            {/* Milestone Title */}
                            <h4 className="text-lg sm:text-xl font-black text-ink group-hover:text-accent transition-all duration-300 tracking-tight leading-snug mb-2">
                              {item.title}
                            </h4>

                            {/* Clean short description summary */}
                            <p className="text-ink-muted text-xs sm:text-sm leading-relaxed mb-4 font-normal line-clamp-3">
                              {item.description}
                            </p>
                          </div>

                          {/* Actions and Social Links Row */}
                          <div className="pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-2">
                            {/* Social links */}
                            <div className="flex items-center gap-2">
                              {item.linkedinUrl && (
                                <a
                                  href={item.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="View on LinkedIn"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#0a66c2] bg-slate-100 transition-colors shadow-xs"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                  </svg>
                                  <span>LinkedIn</span>
                                </a>
                              )}
                              {item.facebookUrl && (
                                <a
                                  href={item.facebookUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="View on Facebook"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#1877f2] bg-slate-100 transition-colors shadow-xs"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                  </svg>
                                  <span>Facebook</span>
                                </a>
                              )}
                            </div>

                            {/* View Details Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNews({
                                  id: item.id,
                                  title: item.title,
                                  description: item.description,
                                  content: item.content,
                                  category: item.category,
                                  date: item.date,
                                  image: item.image,
                                  linkedinUrl: item.linkedinUrl,
                                  facebookUrl: item.facebookUrl,
                                })
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white transition-all duration-200 active:scale-95 shadow-xs border border-sky-100/90 cursor-pointer"
                            >
                              <Eye size={15} />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Navigation dots matching SystemSection */}
            {sortedFeatured.length > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {sortedFeatured.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToCard(index)}
                    aria-label={`Go to milestone ${index + 1}`}
                    className={cn(
                      'h-2.5 cursor-pointer rounded-full transition-all duration-300 hover:scale-125',
                      index === activeIndex
                        ? 'w-8 bg-gradient-to-r from-accent to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                        : 'w-2.5 bg-line-strong hover:bg-accent/60'
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 2. LATEST NEWS — VERTICAL SCROLL STAGE (4 News Visible at Once, Scroll by Row) */}
        {/* ========================================================================= */}
        <motion.div {...fadeUpProps(0.2)}>
          {/* Header Row with Title */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Latest News &amp; Updates
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Recent updates and institutional announcements
              </p>
            </div>
          </div>

          {/* Vertical Scroll Stage Viewport (Displays 4 Cards: 2 Rows x 2 Columns) */}
          <div className="relative rounded-3xl p-1 sm:p-2 bg-gradient-to-b from-slate-200/40 via-slate-100/20 to-slate-200/40 border border-slate-200/80">
            {/* Top subtle fade gradient mask */}
            {canScrollUp && (
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-white/90 via-white/40 to-transparent z-20 rounded-t-3xl transition-opacity duration-300" />
            )}

            {/* Scrollable Track: exactly 2 rows (4 news) visible at once */}
            <div
              ref={verticalScrollRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="h-[460px] sm:h-[490px] overflow-y-auto scroll-smooth snap-y snap-mandatory select-none no-scrollbar p-2 sm:p-3 pb-16 sm:pb-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                {sortedNews.map((item: NewsItem, idx: number) => {
                  const isGreen = idx % 3 === 0
                  const isRed = idx % 3 === 1
                  const barColor = isGreen
                    ? 'bg-emerald-500'
                    : isRed
                      ? 'bg-rose-500'
                      : 'bg-sky-400'
                  const badgeToneClass = isGreen
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isRed
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'

                  return (
                    <motion.div
                      key={item.id}
                      data-news-card
                      {...fadeLeftProps(idx * 0.02)}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="snap-start rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between overflow-hidden relative min-h-[200px]"
                    >
                      {/* Left Colored Accent Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor} transition-all duration-300`} />

                      <div className="p-4 sm:p-5 pl-5 sm:pl-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Top Header Row: Publication Date on Left, Category Badge on Right */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>{formatDate(item.date)}</span>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badgeToneClass}`}>
                              {item.category}
                            </span>
                          </div>

                          {/* Main News Title & Short Description with image thumbnail */}
                          <div className="flex gap-3.5 items-start mb-3">
                            {item.image && (
                              <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-100 shadow-inner">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2 mb-1">
                                {item.title}
                              </h4>
                              <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Action Footer: View Details button & Social links */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {item.linkedinUrl && (
                              <a
                                href={item.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View on LinkedIn"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#0a66c2] bg-slate-100 transition-colors"
                              >
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                <span className="hidden sm:inline">LinkedIn</span>
                              </a>
                            )}

                            {item.facebookUrl && (
                              <a
                                href={item.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View on Facebook"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-white hover:bg-[#1877f2] bg-slate-100 transition-colors"
                              >
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="hidden sm:inline">Facebook</span>
                              </a>
                            )}
                          </div>

                          {/* Prominent View Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedNews(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Bottom subtle fade gradient mask */}
            {canScrollDown && (
              <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-14 bg-gradient-to-t from-white/90 via-white/40 to-transparent z-20 rounded-b-3xl transition-opacity duration-300" />
            )}

            {/* Floating Arrowhead Controls: Styled to match website theme (white glassmorphic, sky gradient hover) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-slate-300/40 ring-4 ring-sky-400/10">
                {/* Upward Arrow: Inactive when on top */}
                <button
                  type="button"
                  onClick={() => scrollVertical('up')}
                  disabled={!canScrollUp}
                  aria-label="Scroll up"
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    canScrollUp
                      ? "text-slate-700 bg-slate-50/80 hover:bg-gradient-to-r hover:from-sky-400 hover:to-blue-500 hover:text-white cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                      : "text-slate-300 bg-transparent opacity-40 cursor-not-allowed"
                  )}
                >
                  <ChevronUp size={20} className={canScrollUp ? "hover:-translate-y-0.5 transition-transform" : ""} />
                </button>

                <div className="w-px h-5 bg-slate-200" />

                {/* Downward Arrow: Inactive when reached bottom */}
                <button
                  type="button"
                  onClick={() => scrollVertical('down')}
                  disabled={!canScrollDown}
                  aria-label="Scroll down"
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    canScrollDown
                      ? "text-slate-700 bg-slate-50/80 hover:bg-gradient-to-r hover:from-sky-400 hover:to-blue-500 hover:text-white cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                      : "text-slate-300 bg-transparent opacity-40 cursor-not-allowed"
                  )}
                >
                  <ChevronDown size={20} className={canScrollDown ? "hover:translate-y-0.5 transition-transform" : ""} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pop-up Modal Window for View Details */}
      <NewsDetailModal
        item={selectedNews}
        isOpen={Boolean(selectedNews)}
        onClose={() => setSelectedNews(null)}
      />
    </section>
  )
}
