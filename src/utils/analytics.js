const WA_OPEN_DELAY_MS = 300

/**
 * Событие для GTM: триггер «Пользовательское событие» → whatsapp_click
 * Используется на всех кнопках WhatsApp (главная, каталог, плавающая кнопка).
 */
export function pushWhatsAppClick(url) {
  if (!url || typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'whatsapp_click',
    wa_link_url: url,
  })
}

export function openWhatsApp(url) {
  if (!url) return
  pushWhatsAppClick(url)
  window.setTimeout(() => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, WA_OPEN_DELAY_MS)
}
