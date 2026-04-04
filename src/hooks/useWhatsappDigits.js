import { useEffect, useState } from 'react'
import { API_BASE_URL, getWhatsAppDigits } from '../api/config'

/**
 * Цифры WhatsApp: сначала из .env, после ответа API — из админки (если заданы), иначе снова .env.
 */
export function useWhatsappDigits() {
  const [digits, setDigits] = useState(() => getWhatsAppDigits())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let ok = true
    fetch(`${API_BASE_URL}/api/catalog/site-settings`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        if (!ok) return
        const fromApi = String(d.whatsappE164 || '').replace(/\D/g, '')
        if (fromApi) setDigits(fromApi)
        else setDigits(getWhatsAppDigits())
      })
      .catch(() => {
        if (ok) setDigits(getWhatsAppDigits())
      })
      .finally(() => {
        if (ok) setReady(true)
      })
    return () => {
      ok = false
    }
  }, [])

  return { digits, ready }
}
