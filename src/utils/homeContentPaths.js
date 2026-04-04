/** Путь вида hero.title или utp.items.3.desc */
export function parseContentPath(pathStr) {
  return String(pathStr)
    .split('.')
    .map((seg) => (/^\d+$/.test(seg) ? Number(seg) : seg))
}

export function getAtContent(obj, pathStr) {
  const parts = parseContentPath(pathStr)
  return parts.reduce((o, k) => (o != null ? o[k] : undefined), obj)
}

export function setAtContent(obj, pathStr, value) {
  const parts = parseContentPath(pathStr)
  const next = structuredClone(obj)
  let cur = next
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    const nk = parts[i + 1]
    if (cur[k] == null) cur[k] = typeof nk === 'number' ? [] : {}
    cur = cur[k]
  }
  cur[parts[parts.length - 1]] = value
  return next
}
