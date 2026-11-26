'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'

interface DeployHeaderTrackerProps {
  onBack: () => void
  completedCount?: number
  totalRequired?: number
  progressPercent?: number
  formData?: any
  selectedDefectsCount?: number
}

export function DeployHeaderTracker({
  onBack,
}: DeployHeaderTrackerProps) {
  return (
    <div className="relative mb-6 sm:mb-8 w-full">
      {/* Back button: clean top-left row on mobile, absolute top-left on web */}
      <div className="w-full mb-3 sm:mb-0 sm:absolute sm:left-0 sm:top-1 flex justify-start sm:w-auto z-10">
        <button
          onClick={onBack}
          type="button"
          aria-label="Back"
          className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-full border border-line-strong/60 bg-panel px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-ink transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-md active:scale-95 group cursor-pointer shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Heading & Subtitle: Single line title on mobile and web */}
      <div className="text-center w-full px-2 sm:px-24">
        <h1 className="text-[17px] min-[370px]:text-[19px] min-[420px]:text-xl sm:text-2xl md:text-3xl font-extrabold text-ink tracking-tight font-heading leading-tight whitespace-nowrap">
          Factory Deployment Assessment
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-muted font-medium max-w-xl mx-auto leading-relaxed px-1">
          Provide your mill profile and inspection frame specifications to receive a customized AI retrofit deployment plan.
        </p>
        <div className="mt-3.5 h-0.5 w-12 rounded-full bg-accent/50 mx-auto" />
      </div>
    </div>
  )
}
