/**
 * INQUIRY API — the single boundary between the ContactSection UI and the backend
 * contact inquiry endpoint.
 *
 * `ContactSection` calls `submitContactInquiry()` and renders pending, success,
 * and error states from what it returns. Nothing else in `components/` knows
 * that an HTTP call happens, so changing transport, adding retries, or moving
 * to a server action means editing only this file.
 *
 * ─── BACKEND ────────────────────────────────────────────────────────────────
 * Talks to `POST /api/v1/contact-inquiries` in the Spring Boot service under
 * `backend/`. That endpoint is public; no credentials are needed.
 *
 * ─── CONFIGURATION ──────────────────────────────────────────────────────────
 * Set the API origin in `frontend/.env.local` for local work, or `.env` for production:
 *
 *   local        NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
 *   production   NEXT_PUBLIC_API_BASE_URL=https://api.fabins.nevolyn.com
 *
 * Origin only — no `/api/v1`, no trailing slash. Both are stripped below if
 * present.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Payload posted to `POST /api/v1/contact-inquiries`.
 *
 * All string fields except `honeypot` are required and validated on the server.
 * The `honeypot` field is hidden in the UI and must remain empty for real users;
 * a non-blank value causes the server to silently fake success (bot protection).
 */
export interface ContactInquiryPayload {
  /** Full name of the person enquiring. Required. */
  name: string
  /** Email address for the reply. Required; validated as RFC 5321. */
  email: string
  /** Subject line of the inquiry. Required. */
  subject: string
  /** Free-text message body. Required. */
  message: string
  /**
   * Honeypot bot-trap field. Must remain empty for a real submission.
   * The service treats any non-blank value as a bot and silently returns
   * a fake success so the bot cannot detect the rejection.
   */
  honeypot?: string
}

/**
 * Discriminated union result returned by `submitContactInquiry()`.
 *
 * The form renders inline UI from this value, keeping the failure path
 * explicit and type-safe — no implicit `undefined` or thrown exceptions
 * reach the component.
 *
 * - `{ ok: true, referenceCode? }` — inquiry accepted; show the success card.
 * - `{ ok: false, error }` — something failed; show the error string inline.
 */
export type InquirySubmitResult =
  | { ok: true; referenceCode?: string }
  | { ok: false; error: string }

/**
 * Shape of an RFC 9457 `application/problem+json` error body returned by
 * the Spring Boot backend. The `errors` object carries field-level messages
 * keyed by field name (e.g. `{ "email": "Email must be a valid address" }`).
 */
interface ProblemDetail {
  title?: string
  detail?: string
  errors?: Record<string, string>
}

// ──────────────────────────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Origin of the API — scheme and host only, no path.
 *
 * The value is normalised rather than trusted verbatim: trailing slashes and
 * embedded `/api/v1` prefixes would produce double-slashes in the final URL.
 */
const API_BASE_URL: string = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
  const withoutTrailingSlash = raw.trim().replace(/\/+$/, '')
  return withoutTrailingSlash.replace(/\/api\/v1$/, '')
})()

/**
 * Request timeout window in milliseconds.
 *
 * Set to 60 seconds to provide sufficient headroom for internal mail dispatch.
 */
const REQUEST_TIMEOUT_MS = 60_000

/** Fallback message when no specific error text is available. */
const GENERIC_ERROR = 'Could not send your message. Please try again.'

// ──────────────────────────────────────────────────────────────────────────────
// Public API function
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Submits a general contact inquiry to the Spring Boot backend.
 *
 * Talks to `POST /api/v1/contact-inquiries`. Never throws: all network
 * failures, timeouts, validation errors, and HTTP status codes are converted
 * into a safe `{ ok: false, error }` result for direct UI rendering.
 *
 * @param payload Form values including name, email, subject, message, and honeypot.
 * @returns A discriminated union: `{ ok: true, referenceCode? }` on success
 *          or `{ ok: false, error }` on any failure.
 */
export async function submitContactInquiry(
  payload: ContactInquiryPayload
): Promise<InquirySubmitResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/contact-inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return { ok: true, referenceCode: data?.referenceCode }
    }

    return { ok: false, error: await readErrorMessage(response) }
  } catch (error) {
    // AbortError fires when the request exceeds REQUEST_TIMEOUT_MS.
    // Any other error here is a network failure (offline, DNS, etc.).
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        ok: false,
        error: 'The request timed out. The server may be waking up — please try again in a moment.',
      }
    }
    return {
      ok: false,
      error: 'Could not reach the server. Please check your connection.',
    }
  } finally {
    // Always cancel the timer so it does not fire after the promise resolves.
    clearTimeout(timeout)
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Private helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Turns an error response body into one short sentence for the visitor.
 *
 * Priority order:
 * 1. First field-level validation error (most specific).
 * 2. Problem `detail` string.
 * 3. 5xx fallback (blames the server, not the visitor).
 * 4. Generic fallback.
 *
 * Parsed defensively — a proxy or CDN error body is not `problem+json` at all.
 */
async function readErrorMessage(response: Response): Promise<string> {
  let problem: ProblemDetail | null = null
  try {
    problem = asProblemDetail(await response.json())
  } catch {
    // Not JSON — fall through to the status-based message.
  }

  const firstFieldError = problem?.errors && Object.values(problem.errors)[0]
  if (firstFieldError) return firstFieldError

  if (problem?.detail) return problem.detail

  if (response.status >= 500) {
    return 'The server is temporarily unavailable. Please try again shortly.'
  }

  return GENERIC_ERROR
}

/**
 * Narrows an `unknown` parsed JSON body to `ProblemDetail`.
 *
 * Every field is verified individually — `response.json()` is typed `any`
 * by the DOM lib, and an unchecked cast would crash silently if a CDN error
 * page returns plain HTML or a different JSON schema.
 */
function asProblemDetail(body: unknown): ProblemDetail | null {
  if (typeof body !== 'object' || body === null) return null
  const { title, detail, errors } = body as Record<string, unknown>
  return {
    title: typeof title === 'string' ? title : undefined,
    detail: typeof detail === 'string' ? detail : undefined,
    errors: isStringRecord(errors) ? errors : undefined,
  }
}

/** `true` when every value in the object is a `string`, as the API promises. */
function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((v) => typeof v === 'string')
  )
}
