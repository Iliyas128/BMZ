/**
 * Карточка каталога: короткие строки «параметр — значение» из specs.highlights
 * или из старых полей cap / platform / sensors (и части полей для оборудования).
 */
export function getSpecHighlightRows(specs) {
  if (!specs || typeof specs !== 'object') return []
  // Пустой массив highlights — явное «нет строк в карточке» (после очистки в админке), без fallback на legacy-поля.
  if (Array.isArray(specs.highlights)) {
    return specs.highlights
      .filter((x) => x && String(x.label || '').trim() && String(x.value ?? '').trim())
      .map((x) => ({ label: String(x.label).trim(), value: String(x.value ?? '').trim() }))
  }
  const rows = []
  if (specs.cap) rows.push({ label: 'Грузоподъёмность', value: String(specs.cap) })
  if (specs.platform) rows.push({ label: 'Платформа', value: String(specs.platform) })
  if (specs.sensors) rows.push({ label: 'Датчики', value: String(specs.sensors) })
  if (specs.display) rows.push({ label: 'Дисплей', value: String(specs.display) })
  if (specs.class && rows.length < 6) {
    rows.push({ label: 'Класс / защита', value: String(specs.class) })
  }
  return rows
}

export function highlightsToFormText(rows) {
  if (!Array.isArray(rows) || !rows.length) return ''
  return rows.map((r) => `${r.label}: ${r.value}`).join('\n')
}

export function specsHighlightsToFormText(specs) {
  return highlightsToFormText(getSpecHighlightRows(specs))
}

/** Каждая непустая строка: «Название: значение» (двоеточие — первое в строке). */
export function parseHighlightsFormText(text) {
  const lines = String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const highlights = []
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const label = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (label && value) highlights.push({ label, value })
  }
  return highlights
}
