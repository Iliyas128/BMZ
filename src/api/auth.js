export const ADMIN_TOKEN_KEY = 'bmz_admin_token'

export function getToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
  else localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}
