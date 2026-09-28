'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CarouselCardProps {
  isCenter: boolean
  image: string
  imageAlt: string
  onClick?: () => void
  dataIndex: number
  dataAttr?: string
  children: ReactNode
  className?: string
}

/**
 * CarouselCard — Card frame with glowing accent borders, 3D scale focus,
 * dynamic image header, and clean responsive layout.
 */
export function CarouselCard({
  isCenter,
  image,
  imageAlt,
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
        'group relative w-[310px] sm:w-[420px] lg:w-[460px] shrink-0 snap-center rounded-3xl overflow-hidden cursor-pointer transition-all duration-500',
        'bg-white/95 backdrop-blur-xl flex flex-col justify-between border',
        isCenter
          ? 'scale-100 opacity-100 shadow-xl shadow-sky-500/15 border-sky-300/80 ring-2 ring-sky-400/20'
          : 'scale-95 opacity-75 sm:opacity-85 hover:opacity-100 hover:scale-[0.97] border-slate-200 shadow-md',
        className
      )}
    >
      {/* Top ambient glowing accent beam for centered card */}
      {isCenter && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 z-20" />
      )}

      {/* Card Image Header */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-slate-900 shrink-0">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  )
}
