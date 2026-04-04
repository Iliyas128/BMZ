import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BmzBreadcrumb from '../../components/BmzBreadcrumb'
import BmzSpinner from '../../components/BmzSpinner'
import { catalogToneFromAccent } from '../../utils/catalogAccent'
import { API_BASE_URL } from '../../api/config'

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

export default function CatalogCategory() {
  const { catSlug } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    scrollTop()
  }, [catSlug])

  useEffect(() => {
    let ok = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- сброс при смене slug
    setLoading(true)
    fetch(`${API_BASE_URL}/api/catalog/categories/${encodeURIComponent(catSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => ok && setData(d))
      .catch(() => ok && setData(null))
      .finally(() => ok && setLoading(false))
    return () => {
      ok = false
    }
  }, [catSlug])

  const subs = data?.subcategories || []

  const breadcrumbItems = useMemo(
    () => [
      { key: 'home', label: 'Главная', active: false, onClick: () => navigate('/') },
      { key: 'catalog', label: 'Каталог', active: false, onClick: () => navigate('/products') },
      { key: 'cat', label: data?.name || '…', active: true },
    ],
    [navigate, data?.name],
  )

  if (!loading && !data) {
    return (
      <>
        <BmzBreadcrumb
          items={[
            { key: 'home', label: 'Главная', active: false, onClick: () => navigate('/') },
            { key: 'catalog', label: 'Каталог', active: false, onClick: () => navigate('/products') },
            { key: 'x', label: 'Не найдено', active: true },
          ]}
        />
        <main className="bmzPageContent bmz-container" style={{ padding: '24px 16px' }}>
          <p>Направление не найдено.</p>
          <button type="button" className="bmzBackBtn" onClick={() => navigate('/products')}>
            ← К каталогу
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
          <div className="bmzPageHeaderP">{data?.description || ''}</div>
        </div>
      </section>

      <main className="bmzPageContent">
        <div className="bmz-container">
          <button type="button" className="bmzBackBtn" onClick={() => navigate('/products')}>
            ← Все направления
          </button>

          {loading ? <BmzSpinner label="Загрузка…" /> : null}

          {!loading && subs.length === 0 ? (
            <div className="bmzNoteCard" style={{ marginTop: 16 }}>
              <div className="bmzSectionTitle" style={{ fontSize: '1.1rem', marginBottom: 8 }}>
                Подкатегории скоро появятся
              </div>
              <p className="bmzGrayText">
                По этому направлению каталог наполняется. Оставьте заявку — подберём решение под ваш объект.
              </p>
              <button type="button" className="bmzLeadBtn" style={{ marginTop: 12 }} onClick={() => navigate('/', { state: { scrollTo: 'home-lead' } })}>
                Получить расчёт
              </button>
            </div>
          ) : null}

          {subs.length > 0 ? (
            <>
              <div className="bmzSectionLabel" style={{ marginTop: 12 }}>
                Подкатегории
              </div>
              <div className="bmzSectionTitle">Выберите линейку</div>
              <div className="bmzCatalogAutoGrid bmzCatalogAutoGrid--subs">
                {subs.map((s, idx) => {
                  const tone = catalogToneFromAccent(s.accent, idx)
                  return (
                    <div
                      key={s._id || s.slug}
                      className="bmzCatCard bmzCatCard--catalog"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/products/c/${catSlug}/s/${s.slug}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') navigate(`/products/c/${catSlug}/s/${s.slug}`)
                      }}
                    >
                      <div
                        className={[
                          'bmzCatTop',
                          tone === 'green' ? 'bmzCatTop--green' : '',
                          tone === 'orange' ? 'bmzCatTop--orange' : '',
                        ].join(' ')}
                        style={s.image ? { backgroundImage: `url(${s.image})` } : undefined}
                      >
                        {s.image ? <div className="bmzCatOverlay" /> : null}
                        <div className="bmzCatIcon">{String(s.name || '').slice(0, 2).toUpperCase()}</div>
                        <div className="bmzCatBadge">линейка</div>
                      </div>
                      <div className="bmzCatBody bmzCatBody--uniform">
                        <div
                          className={[
                            'bmzCatTitle',
                            tone === 'green' ? 'bmzCatTitle--green' : '',
                            tone === 'orange' ? 'bmzCatTitle--orange' : '',
                          ].join(' ')}
                        >
                          {s.name}
                        </div>
                        <div className="bmzCatDesc">{s.description || 'Модели и параметры внутри.'}</div>
                        <div className="bmzCatBodyFill" aria-hidden="true" />
                        <button
                          type="button"
                          className={[
                            'bmzCatBtn',
                            tone === 'green' ? 'bmzCatBtn--green' : tone === 'orange' ? 'bmzCatBtn--orange' : 'bmzCatBtn--blue',
                          ].join(' ')}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/products/c/${catSlug}/s/${s.slug}`)
                          }}
                        >
                          Смотреть модели →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  )
}
