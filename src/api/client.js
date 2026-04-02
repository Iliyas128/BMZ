import { API_BASE_URL } from './config'
import { clearToken, getToken } from './auth'

/**
 * Authenticated fetch for admin API. Sends Bearer JWT.
 * On 401 clears token and redirects to /auelbek (except when skipAuthRedirect).
 */
export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401 && !options.skipAuthRedirect) {
    clearToken()
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auelbek')) {
      window.location.assign('/auelbek')
    }
  }

  return res
}
