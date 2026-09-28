'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * useCarousel — Hook to manage horizontal snap carousel state.
 *
 * Tracks the centered card based on scroll position, provides
 * scrollToCard, handlePrev, and handleNext controls.
 */
export function useCarousel(itemCount: number, dataAttr: string = 'data-card-index') {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [centeredIndex, setCenteredIndex] = useState(0)

  const safeCenteredIndex = Math.max(0, Math.min(centeredIndex, Math.max(0, itemCount - 1)))

  const scrollToCard = useCallback(
    (index: number) => {
      const container = scrollContainerRef.current
      if (!container) return

      const clampedIndex = Math.max(0, Math.min(index, itemCount - 1))
      const cardEl = container.querySelector<HTMLElement>(`[${dataAttr}="${clampedIndex}"]`)

      if (cardEl) {
        const containerWidth = container.clientWidth
        const cardWidth = cardEl.offsetWidth
        const cardLeft = cardEl.offsetLeft
        const targetScroll = cardLeft - containerWidth / 2 + cardWidth / 2

        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        })
        setCenteredIndex(clampedIndex)
      }
    },
    [itemCount, dataAttr]
  )

  const handlePrev = useCallback(() => {
    scrollToCard(safeCenteredIndex - 1)
  }, [safeCenteredIndex, scrollToCard])

  const handleNext = useCallback(() => {
    scrollToCard(safeCenteredIndex + 1)
  }, [safeCenteredIndex, scrollToCard])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let timeoutId: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (!container) return
        const containerCenter = container.scrollLeft + container.clientWidth / 2
        const cards = Array.from(container.querySelectorAll<HTMLElement>(`[${dataAttr}]`))

        if (cards.length === 0) return

        let closestIndex = 0
        let closestDist = Infinity

        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2
          const dist = Math.abs(containerCenter - cardCenter)
          if (dist < closestDist) {
            closestDist = dist
            closestIndex = idx
          }
        })

        setCenteredIndex(closestIndex)
      }, 40)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [dataAttr, itemCount])

  return {
    scrollContainerRef,
    centeredIndex: safeCenteredIndex,
    safeCenteredIndex,
    handlePrev,
    handleNext,
    scrollToCard,
  }
}
