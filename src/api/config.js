const raw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
export const API_BASE_URL = String(raw).replace(/\/+$/, '')

/** Только цифры с кодом страны, без + (например 77001234567) — для wa.me в кнопках «Получить КП» */
export function getWhatsAppDigits() {
  const v = import.meta.env.VITE_WHATSAPP_E164
  if (v == null || v === '') return ''
  return String(v).replace(/\D/g, '')
}

export function buildWhatsAppKpUrl(message, digitsOverride) {
  const digits =
    digitsOverride != null && digitsOverride !== ''
      ? String(digitsOverride).replace(/\D/g, '')
      : getWhatsAppDigits()
  if (!digits) return ''
  const text = encodeURIComponent(message)
  return `https://wa.me/${digits}?text=${text}`
}
