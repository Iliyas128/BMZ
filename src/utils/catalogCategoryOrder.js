/** Шесть фиксированных направлений (совпадают с сидом БД). Порядок отображения на сайте. */
export const FIXED_CATEGORY_SLUGS = [
  'avtomobilnye-vesy',
  'zheleznodorozhnye-vesy',
  'fundament',
  'avtomatizatsiya',
  'oborudovanie',
  'uslugi',
]

export function sortCategoriesFixed(categories) {
  if (!Array.isArray(categories)) return []
  const order = new Map(FIXED_CATEGORY_SLUGS.map((slug, i) => [slug, i]))
  return [...categories].sort((a, b) => {
    const ia = order.has(a.slug) ? order.get(a.slug) : 999
    const ib = order.has(b.slug) ? order.get(b.slug) : 999
    if (ia !== ib) return ia - ib
    return (a.order ?? 0) - (b.order ?? 0)
  })
}

export function filterFixedCategories(categories) {
  const set = new Set(FIXED_CATEGORY_SLUGS)
  return sortCategoriesFixed((categories || []).filter((c) => c?.slug && set.has(c.slug)))
}
