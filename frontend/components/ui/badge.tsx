'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'success' | 'warning' | 'info' | 'danger' | 'default'

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  capitalize?: boolean
  className?: string
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/90',
  info: 'bg-sky-50 text-sky-700 border-sky-200/90',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/90',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function Badge({
  children,
  tone = 'default',
  capitalize = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs transition-colors',
        capitalize && 'capitalize',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
