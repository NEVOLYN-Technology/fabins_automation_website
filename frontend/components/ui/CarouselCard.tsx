'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CarouselCardProps {
  isCenter: boolean
  image?: string
  imageAlt?: string
  onImageClick?: () => void
  onClick?: () => void
  dataIndex: number
  dataAttr?: string
  children: ReactNode
  className?: string
}

/**
 * CarouselCard — Card frame adhering to Unified UI Component & Box Design Rules:
 * - Shell dimensions (310px mobile, 420px tablet, 460px desktop)
 * - Top accent beam (sky-400 via blue-500 to indigo-500 when centered)
 * - Full-bleed top image banner with smooth 700ms zoom and vignette overlay
 * - Non-interactive body with strict cursor states
 */
export function CarouselCard({
  isCenter,
  image,
  imageAlt = 'Card banner image',
  onImageClick,
  onClick,
  dataIndex,
  dataAttr = 'data-card-index',
  children,
  className,
}: CarouselCardProps) {
  const dynamicAttr = { [dataAttr]: dataIndex }

  return (
    <motion.div
      {...dynamicAttr}
      onClick={onClick}
      whileHover={{ y: isCenter ? -4 : -2 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-center rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 bg-white flex flex-col justify-between border relative group',
        isCenter
          ? 'scale-100 opacity-100 shadow-xl shadow-sky-500/15 border-sky-300/80 ring-2 ring-sky-400/20 z-20 cursor-default'
          : 'scale-95 opacity-75 sm:opacity-85 hover:opacity-100 hover:scale-[0.97] border-slate-200 shadow-md z-10',
        className
      )}
    >
      {/* Top ambient glowing accent beam */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-all duration-400 z-20',
          isCenter
            ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500'
            : 'bg-transparent'
        )}
      />

      {/* Machine / Card Photo Banner */}
      {image && (
        <div
          onClick={(e) => {
            if (onImageClick) {
              e.stopPropagation()
              onImageClick()
            }
          }}
          className={cn(
            'relative w-full h-48 sm:h-56 overflow-hidden bg-slate-900 shrink-0 border-b border-slate-100 group/photo',
            onImageClick ? 'cursor-zoom-in' : ''
          )}
        >
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover object-center group-hover/photo:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  )
}
