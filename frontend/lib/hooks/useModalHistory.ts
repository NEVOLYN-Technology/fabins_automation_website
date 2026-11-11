'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
  hash?: string
}

/**
 * useModalHistory - Manages browser history integration for popup modals.
 *
 * Solves the critical mobile UX issue where tapping the phone's physical Back button,
 * swipe-back gesture, or browser back button navigates away from the website instead
 * of closing the modal.
 *
 * When the modal opens:
 * 1. Pushes a dummy state into history so the modal becomes the latest history entry.
 * 2. If the user presses the phone's back button / edge swipe, `popstate` fires and
 *    smoothly closes the modal without leaving the website.
 * 3. If the user clicks any on-screen "Back" or "Close" button, `handleClose()` will
 *    call `window.history.back()`, cleanly popping the history state and closing the modal.
 * 4. Manages body scroll locking and keyboard Escape handling.
 */
export function useModalHistory({ isOpen, onClose, modalId = 'modal', hash }: UseModalHistoryOptions) {
  const hasPushedStateRef = useRef(false)
  const isClosingRef = useRef(false)

  // Unified close handler for on-screen buttons and backdrop clicks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
        window.history.back()
        return
      }
    }

    if (typeof window !== 'undefined' && hash && window.location.hash.includes('/')) {
      const parentHash = window.location.hash.split('/')[0] || ''
      window.history.replaceState(null, '', `${window.location.pathname}${parentHash}`)
    }

    onClose()
  }, [onClose, modalId, hash])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      hasPushedStateRef.current = false
      return
    }

    isClosingRef.current = false

    // Push history entry for deep-link URL and mobile back-button handling
    try {
      const currentState = window.history.state || {}
      const targetUrl = hash ? `${window.location.pathname}${hash.startsWith('#') ? hash : `#${hash}`}` : ''
      const isDirectDeepLink = Boolean(hash && window.location.hash === (hash.startsWith('#') ? hash : `#${hash}`))

      if (isDirectDeepLink) {
        // Direct arrival from shared link: establish the base section in history first,
        // then push the modal state so clicking Close/Back returns to the team section on site
        // instead of kicking the visitor out to the previous external site.
        const parentHash = hash?.split('/')[0] || '#innovators'
        window.history.replaceState({ ...currentState, isBase: true }, '', `${window.location.pathname}${parentHash}`)
        window.history.pushState({ ...currentState, [modalId]: true }, '', targetUrl)
        hasPushedStateRef.current = true
      } else {
        window.history.pushState({ ...currentState, [modalId]: true }, '', targetUrl)
        hasPushedStateRef.current = true
      }
    } catch {
      // Fallback if pushState is restricted
      hasPushedStateRef.current = false
    }

    const handlePopState = () => {
      // User tapped phone back button or swiped back
      hasPushedStateRef.current = false
      onClose()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Lock background scroll while modal is active
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
    }
  }, [isOpen, modalId, onClose, handleClose])

  return { handleClose }
}
