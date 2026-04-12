import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../api/config'
import { HOME_DEFAULTS } from '../data/homeDefaults'

export function useHomeContent() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE_URL}/api/catalog/home-content`, {
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return
        setContent(d && typeof d === 'object' ? d : HOME_DEFAULTS)
      })
      .catch(() => {
        if (!cancelled) setContent(HOME_DEFAULTS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { content, loading }
}
