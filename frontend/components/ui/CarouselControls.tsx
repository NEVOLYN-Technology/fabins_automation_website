'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselArrowsProps {
  onPrev: () => void
  onNext: () => void
  prevLabel?: string
  nextLabel?: string
  className?: string
}

export function CarouselArrows({
  onPrev,
  onNext,
  prevLabel = 'Previous item',
  nextLabel = 'Next item',
  className,
}: CarouselArrowsProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-2 sm:px-4',
        className
      )}
    >
      <button
        type="button"
        onClick={onPrev}
        aria-label={prevLabel}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-50 hover:text-sky-600 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-50 hover:text-sky-600 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

interface CarouselDotsProps {
  count: number
  activeIndex: number
  onDotClick: (index: number) => void
  itemLabel?: string
  className?: string
}

export function CarouselDots({
  count,
  activeIndex,
  onDotClick,
  itemLabel = 'item',
  className,
}: CarouselDotsProps) {
  if (count <= 1) return null

  return (
    <div className={cn('mt-6 flex items-center justify-center gap-2', className)}>
      {Array.from({ length: count }).map((_, idx) => {
        const isActive = idx === activeIndex
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onDotClick(idx)}
            aria-label={`Go to ${itemLabel} ${idx + 1}`}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300 cursor-pointer',
              isActive
                ? 'w-8 bg-gradient-to-r from-sky-400 to-blue-600 shadow-sm'
                : 'w-2.5 bg-slate-300 hover:bg-slate-400'
            )}
          />
        )
      })}
    </div>
  )
}
