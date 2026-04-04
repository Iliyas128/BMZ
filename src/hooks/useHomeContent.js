import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api/config'
import { HOME_DEFAULTS } from '../data/homeDefaults'

export function useHomeContent() {
  const [content, setContent] = useState(HOME_DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE_URL}/api/catalog/home-content`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d === 'object') setContent(d)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { content, loading }
}
