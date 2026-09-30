/**
 * CONTACT API — the single boundary between the UI and the backend.
 *
 * `ContactSection` calls `submitDeploymentRequest()` and renders pending,
 * success, and error states from what it returns. Nothing else in
 * `components/` knows that an HTTP call happens at all, so changing transport,
 * adding retries, or moving to a server action means editing only this file.
 *
 * ─── BACKEND ────────────────────────────────────────────────────────────────
 * Talks to `POST /api/v1/deployment-requests` in the Spring Boot service under
 * `backend/`. That endpoint is public; the admin endpoints on the same resource
 * require credentials and are deliberately never called from the browser.
 *
 * ─── CONFIGURATION ──────────────────────────────────────────────────────────
 * Set the API origin in `frontend/.env.local` for local work, and in the
 * Vercel project's environment variables for deployments:
 *
 *   local        NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
 *   production   NEXT_PUBLIC_API_BASE_URL=https://fabins-api.onrender.com
 *   custom domain NEXT_PUBLIC_API_BASE_URL=https://api.fabins.com
 *
 * Origin only — no `/api/v1`, no trailing slash. Both are stripped below if
 * present, but the canonical form is the bare origin.
 *
 * Changing it on Vercel requires a redeploy: `NEXT_PUBLIC_` values are inlined
 * into the bundle at build time, not read at runtime.
 *
 * The `NEXT_PUBLIC_` prefix is required for the value to be readable in the
 * browser. It is therefore visible to anyone who views the page — never put a
 * secret in a `NEXT_PUBLIC_` variable.
 *
 * Whatever origin is set here must also appear in `FABINS_ALLOWED_ORIGIN` on
 * the backend, or the browser will block the response. See
 * `docs/CICD_AND_DEPLOYMENT.md` §4.
 */

/** The payload collected by the deployment-request form. */
export interface DeploymentRequest {
  /** Mill or factory name. Required. */
  millName: string
  /** Name of the person enquiring. Required. */
  contactName: string
  /** Designation / job title (e.g. Managing Director, Factory Manager). Optional. */
  designation?: string
  /** Work email address. Required. */
  email: string
  /** Phone or WhatsApp number. Optional. */
  phone?: string
  /** Factory location (e.g. Gazipur, Dhaka, Bangladesh). Optional. */
  location?: string
  /** Inspection machine or frame manufacturer brand (e.g. Bianco, Lafer). Optional. */
  machineBrand?: string
  /** Type of factory (e.g. Knit Fabric Mill, Woven Mill, Denim). Optional. */
  factoryType?: string
  /** Number of inspection frames to upgrade/retrofit (e.g. 1-2, 3-5, 6+). Optional. */
  inspectionFramesCount?: string
  /** Fabric types handled (e.g. Single Jersey, Interlock, Rib, Denim). Optional. */
  fabricTypes?: string
  /** Daily/monthly production volume (e.g. 25,000 yards/day). Optional. */
  dailyProductionVolume?: string
  /** Target inspection speed (e.g. 25 m/min). Optional. */
  inspectionSpeed?: string
  /** Fabric roll or frame table width (e.g. 72 inches). Optional. */
  rollWidth?: string
  /** Primary defect focus areas (e.g. Holes, Stains, Slubs, Yarn breaks). Optional. */
  defectTypes?: string
  /** Target ERP or software integration (e.g. FastReact, SAP, Standalone). Optional. */
  erpIntegrationNeeded?: string
  /** Target implementation timeline (e.g. Immediate, 1-3 Months). Optional. */
  targetTimeline?: string
  /** Free-text fabric specs and technical inspection requirements. Optional. */
  message?: string
}

/**
 * Result of a submission.
 *
 * A discriminated union carrying either `{ ok: true, referenceCode }` on success
 * or `{ ok: false, error }` on failure. The form renders inline messages from
 * this value, keeping the failure path explicit and type-safe.
 */
export type SubmitResult =
  | { ok: true; referenceCode?: string }
  | { ok: false; error: string }

/**
 * Shape of an error body from the API.
 *
 * The backend answers every error with RFC 9457 `application/problem+json`.
 * Validation failures add an `errors` object keyed by field name.
 */
interface ProblemDetail {
  title?: string
  detail?: string
  errors?: Record<string, string>
}

/**
 * Origin of the API — scheme and host only, no path.
 *
 * The value is normalised rather than trusted verbatim, because trailing slashes
 * or embedded `/api/v1` prefixes would produce malformed URLs against `.../api/v1/...`.
 *
 * NOTE: `process.env.NEXT_PUBLIC_*` is inlined at build time, not read at
 * runtime. Changing it on Vercel or Render requires a redeploy.
 */
const API_BASE_URL: string = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
  const withoutTrailingSlash = raw.trim().replace(/\/+$/, '')
  return withoutTrailingSlash.replace(/\/api\/v1$/, '')
})()

/**
 * Request timeout window (60 seconds).
 *
 * Set to 60s because the backend running on Render free tier may require a JVM
 * cold start (30-50s) after inactivity. A shorter client timeout would abort
 * submissions that the server goes on to successfully process.
 */
const REQUEST_TIMEOUT_MS = 60_000

/** Shown when the server fails in a way we have no specific message for. */
const GENERIC_ERROR = 'Could not send your request. Please try again.'

/**
 * Submits an RMG Industry deployment assessment request to the Spring Boot backend.
 *
 * Talks to `POST /api/v1/deployment-requests`. Never throws: converts network
 * failures, timeouts, validation errors, and HTTP status codes into a safe
 * `{ ok: false, error }` result object for direct UI rendering.
 *
 * @param request Complete form values including mill specifications and contact details.
 */
export async function submitDeploymentRequest(
  request: DeploymentRequest
): Promise<SubmitResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/deployment-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return { ok: true, referenceCode: data?.referenceCode }
    }

    return { ok: false, error: await readErrorMessage(response) }
  } catch (error) {
    // An aborted request is our timeout firing; anything else reaching here is
    // a network failure (offline, DNS, backend not running). Neither case has
    // a response body to read.
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, error: 'The request timed out. Please try again.' }
    }

    return {
      ok: false,
      error: 'Could not reach the server. Please check your connection.',
    }
  } finally {
    // Runs on every path, so the timer is never left pending.
    clearTimeout(timeout)
  }
}

/**
 * Turns an error response into one sentence for the visitor.
 *
 * Prefers the most specific information available: a named field error first,
 * then the problem's `detail`, then a generic fallback. The body is parsed
 * defensively because an error from a proxy or load balancer will not be
 * problem+json at all.
 */
async function readErrorMessage(response: Response): Promise<string> {
  let problem: ProblemDetail | null = null

  try {
    // Parsed as `unknown` and narrowed, rather than asserted with `as`. An
    // error from a proxy or CDN is not necessarily an object at all, and an
    // unchecked cast would turn that into a runtime crash on `.errors`.
    problem = asProblemDetail(await response.json())
  } catch {
    // Not JSON — fall through to the status-based message below.
  }

  // Validation failure: show the first field message, which is far more useful
  // than the generic "One or more fields are invalid".
  const firstFieldError = problem?.errors && Object.values(problem.errors)[0]
  if (firstFieldError) return firstFieldError

  if (problem?.detail) return problem.detail

  // 5xx is our fault, so do not imply the visitor did something wrong.
  if (response.status >= 500) {
    return 'The server is temporarily unavailable. Please try again shortly.'
  }

  return GENERIC_ERROR
}

/**
 * Narrows a parsed JSON body to `ProblemDetail`, keeping only the fields whose
 * types actually check out.
 *
 * `response.json()` is typed `any` by the DOM lib, which is the one hole strict
 * mode does not close. Everything reaching this function comes from the
 * network, so each field is verified rather than assumed.
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

/** True when every value in the object is a string, as the API contract promises. */
function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((entry) => typeof entry === 'string')
  )
}