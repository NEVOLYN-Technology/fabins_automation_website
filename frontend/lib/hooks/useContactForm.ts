import { useState } from 'react'
import {
  submitContactInquiry,
  type ContactInquiryPayload,
  type InquirySubmitResult,
} from '@/lib/api/inquiry'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Shape of the form values managed by the hook and driven by the UI.
 * All fields start as empty strings so controlled inputs are never uncontrolled.
 */
export interface ContactFormState {
  name: string
  email: string
  subject: string
  message: string
  /**
   * Hidden honeypot field. The form renders this as an invisible input that
   * real users never see or fill. A non-blank value signals a bot; the hook
   * passes it to the API which silently fakes success.
   */
  honeypot: string
}

/**
 * What `useContactForm` exposes to the UI layer.
 *
 * @property formData       Live form state; bind each field's `value` to this.
 * @property setFormData    Updater; call with `{ ...prev, fieldName: newValue }`.
 * @property handleSubmit   `onSubmit` handler for the `<form>` element.
 * @property isLoading      `true` while the HTTP request is in flight.
 * @property result         `null` before any submit; discriminated union after.
 * @property reset          Resets both form data and result to their initial state.
 */
export interface UseContactFormReturn {
  formData: ContactFormState
  setFormData: React.Dispatch<React.SetStateAction<ContactFormState>>
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading: boolean
  result: InquirySubmitResult | null
  reset: () => void
}

// ──────────────────────────────────────────────────────────────────────────────
// Initial state
// ──────────────────────────────────────────────────────────────────────────────

const INITIAL_FORM: ContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  honeypot: '',
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Manages the full lifecycle of the homepage "Let's Connect" contact form.
 *
 * ## Responsibilities
 * - Holds form field state (controlled-input pattern).
 * - Handles the `onSubmit` event: calls the API client, updates request state.
 * - Exposes `isLoading` and `result` for the UI to render loading / success /
 *   error states without any direct knowledge of the HTTP layer.
 * - Provides a `reset()` function so the user can send another message after a
 *   successful submission without reloading the page.
 *
 * ## Honeypot
 * The `honeypot` field is passed through to the API unchanged. The API service
 * in `EmailServiceImpl` detects a non-blank value and silently fakes success
 * rather than persisting the inquiry — the bot cannot distinguish the two
 * outcomes and therefore cannot adapt.
 *
 * ## Error handling
 * `submitContactInquiry()` never throws: it converts all network failures,
 * timeouts, and HTTP error bodies into `{ ok: false, error }` results. This
 * hook reflects that directly into `result`, so the UI layer has nothing
 * exceptional to catch.
 *
 * @returns All state and handlers the form component needs.
 *
 * @example
 * ```tsx
 * const { formData, setFormData, handleSubmit, isLoading, result } = useContactForm()
 *
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
 *     {result?.ok === false && <p>{result.error}</p>}
 *     {result?.ok === true && <p>Sent! Ref: {result.referenceCode}</p>}
 *   </form>
 * )
 * ```
 */
export function useContactForm(): UseContactFormReturn {
  // ── Form field state ────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<ContactFormState>(INITIAL_FORM)

  // ── Request lifecycle state ─────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<InquirySubmitResult | null>(null)

  // ── Submit handler ──────────────────────────────────────────────────────────

  /**
   * Called by the form's `onSubmit` event. Prevents the browser's default
   * full-page refresh, builds the API payload, calls `submitContactInquiry`,
   * and stores the discriminated-union result in local state.
   *
   * The form is cleared on success so the user does not accidentally resubmit
   * by pressing Enter while the success card is showing.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // Guard: do not allow a second submit while the first is in flight.
    if (isLoading) return

    setIsLoading(true)
    setResult(null)

    // Build the payload from current form state. All trimming has already been
    // done server-side via the compact constructor on CreateContactInquiry, but
    // we pass the raw values here — trimming in the hook would cause the input
    // cursor to jump on every keystroke if done live.
    const payload: ContactInquiryPayload = {
      name:     formData.name,
      email:    formData.email,
      subject:  formData.subject,
      message:  formData.message,
      honeypot: formData.honeypot || undefined,
    }

    const outcome = await submitContactInquiry(payload)

    setResult(outcome)
    setIsLoading(false)

    // Clear the form on success so the UI can transition to the success card
    // without stale values remaining in the hidden fields.
    if (outcome.ok) {
      setFormData(INITIAL_FORM)
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  /**
   * Resets both the form data and the submission result to their initial state.
   * Useful when the user wants to send another message after a success.
   */
  const reset = (): void => {
    setFormData(INITIAL_FORM)
    setResult(null)
  }

  return { formData, setFormData, handleSubmit, isLoading, result, reset }
}
