/** @param {string | undefined} accent */
export function catalogToneFromAccent(accent, legacyIdx = 0) {
  if (accent === 'green' || accent === 'orange') return accent
  if (accent === 'blue') return 'default'
  const i = Number(legacyIdx) || 0
  return i % 3 === 1 ? 'green' : i % 3 === 2 ? 'orange' : 'default'
}

/** Для карточки товара: классы градиента и обводки */
export function productAccentClass(accent) {
  if (accent === 'green') return 'agro'
  if (accent === 'orange') return 'heavy'
  return ''
}
