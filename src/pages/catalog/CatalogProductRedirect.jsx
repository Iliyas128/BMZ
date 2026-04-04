import { Navigate, useParams } from 'react-router-dom'

/** Старые ссылки на карточку товара ведут обратно в линейку */
export default function CatalogProductRedirect() {
  const { catSlug, subSlug } = useParams()
  return <Navigate to={`/products/c/${catSlug}/s/${subSlug}`} replace />
}
