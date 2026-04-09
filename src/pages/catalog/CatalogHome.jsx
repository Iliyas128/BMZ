import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BmzBreadcrumb from '../../components/BmzBreadcrumb'
import BmzSpinner from '../../components/BmzSpinner'
import { API_BASE_URL } from '../../api/config'
import { filterAvailableCatalogCategories } from '../../utils/catalogCategoryOrder'

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const toneByOrder = ['blue', 'blue', 'blue', 'blue', 'green', 'orange']

export default function CatalogHome() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    scrollTop()
  }, [])

  useEffect(() => {
    let ok = true
    fetch(`${API_BASE_URL}/api/catalog/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (ok && Array.isArray(data)) setCategories(filterAvailableCatalogCategories(data))
      })
      .catch(() => {})
      .finally(() => ok && setLoading(false))
    return () => {
      ok = false
    }
  }, [])

  const breadcrumbItems = [
    { key: 'home', label: 'Главная', active: false, onClick: () => navigate('/') },
    { key: 'cat', label: 'Каталог', active: true },
  ]

  return (
    <>
      <BmzBreadcrumb items={breadcrumbItems} />

      <section className="bmzPageHeader">
        <div className="bmz-container bmzPageHeaderInner">
          <div className="bmzPageHeaderH1">Каталог продукции</div>
          <div className="bmzPageHeaderP">Выберите направление — затем подкатегорию и модель.</div>
        </div>
      </section>

      <main className="bmzPageContent bmzCatalogPage">
        <div className="bmz-container">
          {loading ? <BmzSpinner label="Загрузка каталога…" /> : null}
          <div className="bmzSectionLabel bmzCatalogPageIntro">
            Направления
          </div>
          <div className="bmzSectionTitle">Вся продукция BMZ</div>

          <div className="bmzCatGrid">
            {categories.map((c, idx) => {
              const tone = toneByOrder[idx % toneByOrder.length]
              const initials = (c.name || 'БМЗ')
                .split(/\s+/)
                .map((w) => w[0])
                .join('')
                .slice(0, 3)
                .toUpperCase()
              return (
                <div
                  key={c._id || c.slug}
                  className="bmzCatCard"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/products/c/${c.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate(`/products/c/${c.slug}`)
                  }}
                >
                  <div
                    className={[
                      'bmzCatTop',
                      tone === 'green' ? 'bmzCatTop--green' : '',
                      tone === 'orange' ? 'bmzCatTop--orange' : '',
                    ].join(' ')}
                    style={c.image ? { backgroundImage: `url(${c.image})` } : undefined}
                  >
                    {c.image ? <div className="bmzCatOverlay" /> : null}
                    <div className="bmzCatIcon">{initials}</div>
                    <div className="bmzCatBadge">каталог</div>
                  </div>
                  <div className="bmzCatBody bmzCatBody--uniform">
                    <div
                      className={[
                        'bmzCatTitle',
                        tone === 'green' ? 'bmzCatTitle--green' : '',
                        tone === 'orange' ? 'bmzCatTitle--orange' : '',
                      ].join(' ')}
                    >
                      {c.name}
                    </div>
                    <div className="bmzCatDesc">{c.description || 'Подробности внутри направления.'}</div>
                    <div className="bmzCatBodyFill" aria-hidden="true" />
                    <button
                      type="button"
                      className={[
                        'bmzCatBtn',
                        tone === 'green' ? 'bmzCatBtn--green' : tone === 'orange' ? 'bmzCatBtn--orange' : 'bmzCatBtn--blue',
                      ].join(' ')}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/products/c/${c.slug}`)
                      }}
                    >
                      Открыть →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
