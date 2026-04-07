import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BmzBreadcrumb from '../../components/BmzBreadcrumb'
import BmzSpinner from '../../components/BmzSpinner'
import CatalogKpModal from '../../components/CatalogKpModal'
import { productAccentClass } from '../../utils/catalogAccent'
import { API_BASE_URL } from '../../api/config'

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

function formatPrice(price, currency) {
  const n = Number(price)
  if (!Number.isFinite(n)) return '—'
  return `от ${n.toLocaleString('ru-RU')} ${currency || '₸'}`
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
          <div className="bmzPageHeaderP">{data?.description || 'Выберите модель.'}</div>
        </div>
      </section>

      <main className="bmzPageContent bmzCatalogPage">
        <div className="bmz-container">
          <button type="button" className="bmzBackBtn" onClick={() => navigate(`/products/c/${catSlug}`)}>
            ← Все подкатегории
          </button>

          {loading ? <BmzSpinner label="Загрузка моделей…" /> : null}

          <div className="bmzSectionTitle">Модели</div>

          <div className="bmzCatalogAutoGrid bmzCatalogAutoGrid--products">
            {products.map((p) => {
              const dim = p.specs?.dim || '—'
              const ac = productAccentClass(p.accent)
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
                    {Array.isArray(p.images) && p.images[0] ? (
                      <img src={p.images[0]} alt="" className="bmzProdImgPhoto" loading="lazy" decoding="async" />
                    ) : (
                      <div className="bmzProdIcon">BMZ</div>
                    )}
                    <div className="bmzProdDimBadge">{dim}</div>
                  </div>
                  <div className="bmzProdCardBody bmzProdCardBody--uniform">
                    <div className="bmzProdCardGrow">
                      <div className="bmzProdTitle">{p.name}</div>
                      <div className="bmzProdSub">{p.shortDescription || p.description?.slice(0, 120)}</div>
                      <div className="bmzProdSpecs bmzProdSpecs--fixedMin">
                        {p.specs?.cap ? (
                          <div className="bmzSpecRow">
                            <span className="bmzSpecLabel">Грузоподъёмность</span>
                            <span className="bmzSpecValue">{p.specs.cap}</span>
                          </div>
                        ) : null}
                        {p.specs?.platform ? (
                          <div className="bmzSpecRow">
                            <span className="bmzSpecLabel">Платформа</span>
                            <span className="bmzSpecValue">{p.specs.platform}</span>
                          </div>
                        ) : null}
                        {p.specs?.sensors ? (
                          <div className="bmzSpecRow">
                            <span className="bmzSpecLabel">Датчики</span>
                            <span className="bmzSpecValue">{p.specs.sensors}</span>
                          </div>
                        ) : null}
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
