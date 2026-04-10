import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BmzBreadcrumb from '../../components/BmzBreadcrumb'
import BmzSpinner from '../../components/BmzSpinner'
import CatalogKpModal from '../../components/CatalogKpModal'
import { API_BASE_URL } from '../../api/config'
import { productAccentClass } from '../../utils/catalogAccent'
import { getSpecHighlightRows } from '../../utils/productSpecs'

const EQUIPMENT_CATEGORY_SLUG = 'oborudovanie'

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

function formatPrice(price, currency) {
  const n = Number(price)
  if (!Number.isFinite(n)) return '—'
  return `от ${n.toLocaleString('ru-RU')} ${currency || '₸'}`
}

function ProdCardGallery({ urls, equipmentLayout }) {
  const [idx, setIdx] = useState(0)
  const n = urls.length
  const sig = urls.join('\n')

  useEffect(() => {
    setIdx(0)
  }, [sig])

  const goPrev = useCallback((e) => {
    e.stopPropagation()
    setIdx((i) => (i - 1 + n) % n)
  }, [n])

  const goNext = useCallback((e) => {
    e.stopPropagation()
    setIdx((i) => (i + 1) % n)
  }, [n])

  if (!n) {
    return (
      <div className={equipmentLayout ? 'bmzProdIcon bmzProdIcon--equipment' : 'bmzProdIcon'}>BMZ</div>
    )
  }

  return (
    <div className="bmzProdImgGallery">
      <img
        src={urls[idx]}
        alt=""
        className="bmzProdImgPhoto"
        loading={idx === 0 ? 'eager' : 'lazy'}
        decoding="async"
      />
      {n > 1 ? (
        <>
          <button type="button" className="bmzProdImgNav bmzProdImgNav--prev" onClick={goPrev} aria-label="Предыдущее фото">
            <svg className="bmzProdImgNavIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14 6L8 12l6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" className="bmzProdImgNav bmzProdImgNav--next" onClick={goNext} aria-label="Следующее фото">
            <svg className="bmzProdImgNavIcon" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M10 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  )
}

export default function CatalogSubcategory() {
  const { catSlug, subSlug } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [kpProduct, setKpProduct] = useState(null)

  useEffect(() => {
    scrollTop()
  }, [subSlug])

  useEffect(() => {
    let ok = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- сброс при смене slug
    setLoading(true)
    fetch(`${API_BASE_URL}/api/catalog/subcategories/${encodeURIComponent(subSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => ok && setData(d))
      .catch(() => ok && setData(null))
      .finally(() => ok && setLoading(false))
    return () => {
      ok = false
    }
  }, [subSlug])

  const products = data?.products || []
  const category = data?.category
  const equipmentCatalog = category?.slug === EQUIPMENT_CATEGORY_SLUG

  const breadcrumbItems = useMemo(
    () => [
      { key: 'home', label: 'Главная', active: false, onClick: () => navigate('/') },
      { key: 'catalog', label: 'Каталог', active: false, onClick: () => navigate('/products') },
      {
        key: 'cat',
        label: category?.name || 'Направление',
        active: false,
        onClick: () => navigate(`/products/c/${catSlug}`),
      },
      { key: 'sub', label: data?.name || '…', active: true },
    ],
    [navigate, catSlug, category?.name, data?.name],
  )

  function openKp(p) {
    setKpProduct(p)
  }

  if (!loading && !data) {
    return (
      <>
        <BmzBreadcrumb
          items={[
            { key: 'home', label: 'Главная', active: false, onClick: () => navigate('/') },
            { key: 'c', label: 'Каталог', active: false, onClick: () => navigate('/products') },
            { key: 'x', label: 'Не найдено', active: true },
          ]}
        />
        <main className="bmzPageContent bmz-container" style={{ padding: 24 }}>
          <p>Подкатегория не найдена.</p>
          <button type="button" className="bmzBackBtn" onClick={() => navigate(`/products/c/${catSlug}`)}>
            ← Назад
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <BmzBreadcrumb items={breadcrumbItems} />

      <section className="bmzPageHeader">
        <div className="bmz-container bmzPageHeaderInner">
          <div className="bmzPageHeaderH1">{data?.name || '…'}</div>
          <div className="bmzPageHeaderP bmzPageHeaderP--preline">
            {data?.description || 'Выберите модель.'}
          </div>
        </div>
      </section>

      <main
        className={['bmzPageContent', 'bmzCatalogPage', equipmentCatalog ? 'bmzCatalogPage--equipment' : '']
          .join(' ')
          .trim()}
      >
        <div className="bmz-container">
          <button type="button" className="bmzBackBtn" onClick={() => navigate(`/products/c/${catSlug}`)}>
            ← Все подкатегории
          </button>

          {loading ? <BmzSpinner label="Загрузка моделей…" /> : null}

          <div className="bmzSectionTitle">Модели</div>

          <div className="bmzCatalogAutoGrid bmzCatalogAutoGrid--products">
            {products.map((p) => {
              const ac = productAccentClass(p.accent)
              const specRows = getSpecHighlightRows(p.specs)
              const imgUrls = Array.isArray(p.images) ? p.images.map((u) => String(u || '').trim()).filter(Boolean) : []
              return (
                <div
                  key={p._id || p.slug}
                  className={[
                    'bmzProdCard bmzProdCard--uniform',
                    ac === 'agro' ? 'bmzProdCard--agro' : '',
                    ac === 'heavy' ? 'bmzProdCard--heavy' : '',
                  ].join(' ')}
                  role="button"
                  tabIndex={0}
                  onClick={() => openKp(p)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openKp(p)
                  }}
                >
                  <div
                    className={[
                      'bmzProdImg',
                      ac === 'agro' ? 'bmzProdImg--agro' : '',
                      ac === 'heavy' ? 'bmzProdImg--heavy' : '',
                    ].join(' ')}
                  >
                    <ProdCardGallery urls={imgUrls} equipmentLayout={equipmentCatalog} />
                  </div>
                  <div className="bmzProdCardBody bmzProdCardBody--uniform">
                    <div className="bmzProdCardGrow">
                      <div className="bmzProdTitle">{p.name}</div>
                      <div className="bmzProdSub">{p.description || ''}</div>
                      <div className="bmzProdSpecs bmzProdSpecs--fixedMin">
                        {specRows.map((row, idx) => (
                          <div key={`${p.slug || p._id}-${idx}`} className="bmzSpecRow">
                            <span className="bmzSpecLabel">{row.label}</span>
                            <span className="bmzSpecValue">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bmzProdCardFooter">
                      <div className="bmzProdPrice">{formatPrice(p.price, p.currency)}</div>
                      <button
                        type="button"
                        className="bmzProdBtn"
                        onClick={(e) => {
                          e.stopPropagation()
                          openKp(p)
                        }}
                      >
                        Получить КП
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {!loading && products.length === 0 ? (
            <p className="bmzGrayText" style={{ marginTop: 16 }}>
              Моделей пока нет в этой линейке.
            </p>
          ) : null}
        </div>
      </main>

      <CatalogKpModal
        open={Boolean(kpProduct)}
        onClose={() => setKpProduct(null)}
        product={kpProduct}
        categoryName={category?.name}
        subName={data?.name}
      />
    </>
  )
}
