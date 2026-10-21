/**
 * Admin API Client — Authenticated endpoints for FABINS Operations Dashboard.
 */

export interface DeploymentRecord {
  id: string
  referenceCode: string
  millName: string
  machineBrand?: string
  location: string
  contactName: string
  email: string
  phone: string
  factoryType?: string
  rollWidth?: string
  status: 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'CLOSED'
  submittedAt: string
  updatedAt: string
}

export interface InquiryRecord {
  id: string
  referenceCode: string
  name: string
  email: string
  subject: string
  message: string
  status: 'NEW' | 'ACKNOWLEDGED' | 'REPLIED'
  createdAt: string
}

export interface AdminStats {
  depTotal: number
  depNew: number
  depInReview: number
  depContacted: number
  depClosed: number
  inqTotal: number
  inqNew: number
  inqAcknowledged: number
  inqReplied: number
}

export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AdminCredentials {
  username: string
  password: string
}

export const API_BASE_URL: string = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080')
  const withoutTrailingSlash = raw.trim().replace(/\/+$/, '')
  return withoutTrailingSlash.replace(/\/api\/v1$/, '')
})()

function getAuthHeader(credentials: AdminCredentials): string {
  const token = typeof window !== 'undefined' 
    ? window.btoa(`${credentials.username}:${credentials.password}`)
    : Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
  return `Basic ${token}`
}

export async function verifyAdminCredentials(credentials: AdminCredentials): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/deployment-requests?page=0&size=1`, {
      headers: {
        Authorization: getAuthHeader(credentials),
        Accept: 'application/json',
      },
    })
    return res.status === 200
  } catch {
    return false
  }
}

export async function fetchDeployments(
  credentials: AdminCredentials,
  params?: { status?: string; page?: number; size?: number }
): Promise<PageResult<DeploymentRecord>> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'ALL') query.set('status', params.status)
  if (params?.page !== undefined) query.set('page', params.page.toString())
  query.set('size', (params?.size ?? 50).toString())

  const url = `${API_BASE_URL}/api/v1/deployment-requests${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(credentials),
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch deployments: HTTP ${res.status}`)
  }
  return res.json()
}

export async function updateDeploymentStatus(
  credentials: AdminCredentials,
  id: string,
  newStatus: DeploymentRecord['status']
): Promise<DeploymentRecord> {
  const url = `${API_BASE_URL}/api/v1/deployment-requests/${id}/status`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: getAuthHeader(credentials),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  })

  if (!res.ok) {
    throw new Error(`Failed to update status: HTTP ${res.status}`)
  }
  return res.json()
}

export async function fetchInquiries(
  credentials: AdminCredentials,
  params?: { status?: string; page?: number; size?: number }
): Promise<PageResult<InquiryRecord>> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'ALL') query.set('status', params.status)
  if (params?.page !== undefined) query.set('page', params.page.toString())
  query.set('size', (params?.size ?? 50).toString())

  const url = `${API_BASE_URL}/api/v1/contact-inquiries${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(credentials),
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch inquiries: HTTP ${res.status}`)
  }
  return res.json()
}

export async function updateInquiryStatus(
  credentials: AdminCredentials,
  id: string,
  newStatus: InquiryRecord['status']
): Promise<InquiryRecord> {
  const url = `${API_BASE_URL}/api/v1/contact-inquiries/${id}/status`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: getAuthHeader(credentials),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  })

  if (!res.ok) {
    throw new Error(`Failed to update status: HTTP ${res.status}`)
  }
  return res.json()
}

export async function deleteInquiry(
  credentials: AdminCredentials,
  id: string
): Promise<void> {
  const url = `${API_BASE_URL}/api/v1/contact-inquiries/${id}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: getAuthHeader(credentials),
    },
  })

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete inquiry: HTTP ${res.status}`)
  }
}

export function getPdfDownloadUrl(id: string): string {
  return `${API_BASE_URL}/api/v1/deployment-requests/${id}/pdf`
}
