import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { useToast } from '../context/ToastContext'
import BmzSpinner from '../components/BmzSpinner'
import { sortCategoriesFixed } from '../utils/catalogCategoryOrder'

const emptySub = {
  category: '',
  name: '',
  slug: '',
  description: '',
  image: '',
  accent: 'blue',
  order: 0,
  isActive: true,
}

const emptyProduct = {
  category: '',
  subcategory: '',
  name: '',
  slug: '',
  sku: '',
  shortDescription: '',
  description: '',
  price: 0,
  currency: 'KZT',
  accent: 'blue',
  isActive: true,
  inStock: true,
  order: 0,
  imagesUrls: '',
}

function parseImagesUrls(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const saveLock = useRef(false)

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [siteWhatsApp, setSiteWhatsApp] = useState('')
  const [siteWaSaving, setSiteWaSaving] = useState(false)

  const [expandedSubs, setExpandedSubs] = useState(() => new Set())

  const [subForm, setSubForm] = useState(emptySub)
  const [editingSubId, setEditingSubId] = useState(null)

  const [productForm, setProductForm] = useState(emptyProduct)
  const [editingProductId, setEditingProductId] = useState(null)
  const [catalogFormOpen, setCatalogFormOpen] = useState(false)

  const closeCatalogForm = useCallback(() => {
    setCatalogFormOpen(false)
    setEditingSubId(null)
    setEditingProductId(null)
    setSubForm(emptySub)
    setProductForm(emptyProduct)
  }, [])

  const loadAll = useCallback(async () => {
    setError('')
    try {
      const [cRes, sRes, pRes] = await Promise.all([
        apiFetch('/api/admin/categories'),
        apiFetch('/api/admin/subcategories'),
        apiFetch('/api/admin/products'),
      ])
      const failed = [cRes, sRes, pRes].find((r) => !r.ok)
      if (failed) {
        const data = await failed.json().catch(() => ({}))
        const msg = data.message || 'Ошибка загрузки'
        setError(msg)
        pushToast({ type: 'error', text: msg })
        return
      }
      const [c, s, p] = await Promise.all([cRes.json(), sRes.json(), pRes.json()])
      setCategories(Array.isArray(c) ? c : [])
      setSubcategories(Array.isArray(s) ? s : [])
      setProducts(Array.isArray(p) ? p : [])

      apiFetch('/api/admin/site-settings')
        .then((r) => (r.ok ? r.json() : null))
        .then((ss) => {
          if (ss && typeof ss.whatsappE164 === 'string') setSiteWhatsApp(ss.whatsappE164)
        })
        .catch(() => {})
    } catch {
      const msg = 'Сервер недоступен'
      setError(msg)
      pushToast({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }, [pushToast])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!catalogFormOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeCatalogForm()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [catalogFormOpen, closeCatalogForm])

  const categoriesSorted = useMemo(() => sortCategoriesFixed(categories), [categories])

  const subsByCategory = useMemo(() => {
    const map = new Map()
    for (const c of categoriesSorted) {
      map.set(String(c._id), [])
    }
    for (const s of subcategories) {
      const id = String(s.category?._id || s.category)
      if (!map.has(id)) map.set(id, [])
      map.get(id).push(s)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }
    return map
  }, [subcategories, categoriesSorted])

  function toggleSubExpand(id) {
    setExpandedSubs((prev) => {
      const next = new Set(prev)
      const k = String(id)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  function productsForSub(subId) {
    const sid = String(subId)
    return products.filter((p) => String(p.subcategory?._id || p.subcategory) === sid)
  }

  async function saveSubcategory(e) {
    e.preventDefault()
    if (saveLock.current) return
    if (!subForm.category || !subForm.name.trim()) return

    saveLock.current = true
    const body = {
      category: subForm.category,
      name: subForm.name.trim(),
      slug: subForm.slug?.trim() || undefined,
      description: subForm.description || '',
      image: subForm.image || '',
      accent: subForm.accent || 'blue',
      order: Number(subForm.order) || 0,
      isActive: !!subForm.isActive,
    }

    const url = editingSubId ? `/api/admin/subcategories/${editingSubId}` : '/api/admin/subcategories'
    const method = editingSubId ? 'PUT' : 'POST'

    try {
      const res = await apiFetch(url, { method, body: JSON.stringify(body) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.message || 'Ошибка сохранения подкатегории'
        setError(msg)
        pushToast({ type: 'error', text: msg })
        return
      }
      setError('')
      pushToast({ type: 'ok', text: editingSubId ? 'Подкатегория сохранена' : 'Подкатегория добавлена' })
      setCatalogFormOpen(false)
      setSubForm(emptySub)
      setEditingSubId(null)
      await loadAll()
    } finally {
      saveLock.current = false
    }
  }

  async function deleteSub(id) {
    if (!window.confirm('Удалить подкатегорию?')) return
    const res = await apiFetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const msg = data.message || 'Не удалось удалить'
      setError(msg)
      pushToast({ type: 'error', text: msg })
      return
    }
    setError('')
    pushToast({ type: 'ok', text: 'Подкатегория удалена' })
    await loadAll()
  }

  function editSub(row) {
    setEditingProductId(null)
    setProductForm(emptyProduct)
    setEditingSubId(String(row._id))
    setSubForm({
      category: String(row.category?._id || row.category),
      name: row.name || '',
      slug: row.slug || '',
      description: row.description || '',
      image: row.image || '',
      accent: row.accent === 'green' || row.accent === 'orange' ? row.accent : 'blue',
      order: row.order ?? 0,
      isActive: row.isActive !== false,
    })
    setCatalogFormOpen(true)
  }

  function startNewSub(categoryId) {
    setEditingProductId(null)
    setProductForm(emptyProduct)
    setEditingSubId(null)
    setSubForm({ ...emptySub, category: String(categoryId) })
    setCatalogFormOpen(true)
  }

  async function saveProduct(e) {
    e.preventDefault()
    if (saveLock.current) return
    if (!productForm.category || !productForm.subcategory || !productForm.name.trim()) return

    saveLock.current = true
    const images = parseImagesUrls(productForm.imagesUrls)

    const body = {
      category: productForm.category,
      subcategory: productForm.subcategory,
      name: productForm.name.trim(),
      slug: productForm.slug?.trim() || undefined,
      sku: productForm.sku || '',
      shortDescription: productForm.shortDescription || '',
      description: productForm.description || '',
      price: Number(productForm.price) || 0,
      currency: productForm.currency || 'KZT',
      accent: productForm.accent || 'blue',
      isActive: !!productForm.isActive,
      inStock: !!productForm.inStock,
      order: Number(productForm.order) || 0,
      images,
    }

    const url = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products'
    const method = editingProductId ? 'PUT' : 'POST'

    try {
      const res = await apiFetch(url, { method, body: JSON.stringify(body) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.message || 'Ошибка сохранения товара'
        setError(msg)
        pushToast({ type: 'error', text: msg })
        return
      }
      setError('')
      pushToast({ type: 'ok', text: editingProductId ? 'Товар сохранён' : 'Товар добавлен' })
      setCatalogFormOpen(false)
      setProductForm(emptyProduct)
      setEditingProductId(null)
      await loadAll()
    } finally {
      saveLock.current = false
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Удалить товар?')) return
    const res = await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const msg = data.message || 'Не удалось удалить'
      setError(msg)
      pushToast({ type: 'error', text: msg })
      return
    }
    setError('')
    pushToast({ type: 'ok', text: 'Товар удалён' })
    await loadAll()
  }

  function editProduct(row) {
    setEditingSubId(null)
    setSubForm(emptySub)
    setEditingProductId(String(row._id))
    setProductForm({
      category: String(row.category?._id || row.category),
      subcategory: String(row.subcategory?._id || row.subcategory),
      name: row.name || '',
      slug: row.slug || '',
      sku: row.sku || '',
      shortDescription: row.shortDescription || '',
      description: row.description || '',
      price: row.price ?? 0,
      currency: row.currency || 'KZT',
      accent: row.accent === 'green' || row.accent === 'orange' ? row.accent : 'blue',
      isActive: row.isActive !== false,
      inStock: row.inStock !== false,
      order: row.order ?? 0,
      imagesUrls: Array.isArray(row.images) ? row.images.join('\n') : '',
    })
    setCatalogFormOpen(true)
  }

  function startNewProduct(categoryId, subId) {
    setEditingSubId(null)
    setSubForm(emptySub)
    setEditingProductId(null)
    setProductForm({
      ...emptyProduct,
      category: String(categoryId),
      subcategory: String(subId),
    })
    setExpandedSubs((prev) => new Set(prev).add(String(subId)))
    setCatalogFormOpen(true)
  }

  const showProductForm = Boolean(editingProductId || productForm.subcategory)
  const showSubForm = Boolean(!showProductForm && (editingSubId || subForm.category))

  function handleCatalogFormSubmit(e) {
    if (showProductForm) return saveProduct(e)
    if (showSubForm) return saveSubcategory(e)
    e.preventDefault()
  }

  const catalogModalTitle = showProductForm
    ? editingProductId
      ? 'Редактирование товара'
      : 'Новый товар'
    : editingSubId
      ? 'Редактирование подкатегории'
      : 'Новая подкатегория'

  async function saveSiteWhatsApp(e) {
    e.preventDefault()
    if (siteWaSaving) return
    setSiteWaSaving(true)
    try {
      const res = await apiFetch('/api/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify({ whatsappE164: siteWhatsApp.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.message || 'Не удалось сохранить номер'
        setError(msg)
        pushToast({ type: 'error', text: msg })
        return
      }
      setError('')
      if (typeof data.whatsappE164 === 'string') setSiteWhatsApp(data.whatsappE164)
      pushToast({ type: 'ok', text: 'Номер WhatsApp сохранён' })
    } finally {
      setSiteWaSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bmz-container bmzAdminPanel">
        <BmzSpinner label="Загрузка каталога…" />
      </div>
    )
  }

  return (
    <div className="bmz-container bmzAdminPanel">
      <div className="bmzAdminIntro">
        <h1 className="bmzAdminH1">Админка BMZ</h1>
        <p className="bmzGrayText">
          Каталог здесь. Тексты главной — вкладка «Главная страница»: откроется сама главная сайта, клик по тексту для
          правки, затем «Сохранить на сервере».
        </p>
      </div>

      <div className="bmzAdminTabs" role="tablist">
        <button type="button" role="tab" className="bmzAdminTab bmzAdminTab--active">
          Каталог
        </button>
        <button type="button" role="tab" className="bmzAdminTab" onClick={() => navigate('/auelbek/home-edit')}>
          Главная страница
        </button>
      </div>

      {error ? (
        <div className="bmzNoteCard" style={{ marginBottom: 16, background: '#FFF3E0' }} role="alert">
          {error}
        </div>
      ) : null}

      <>
          <section className="bmzAdminSection">
            <h2 className="bmzAdminH2">WhatsApp для КП</h2>
            <p className="bmzGrayText" style={{ marginBottom: 14, maxWidth: 720 }}>
              Номер для кнопки «Получить КП» в каталоге. Укажите цифры с кодом страны, без знака + (например{' '}
              <span className="bmzAdminMono">77001234567</span>). Если поле пустое, подставится значение из{' '}
              <code className="bmzAdminMono">VITE_WHATSAPP_E164</code> в <code>.env</code> фронта.
            </p>
            <form className="bmzAdminCard" style={{ padding: 18, marginBottom: 8 }} onSubmit={saveSiteWhatsApp}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
                <label className="bmzAdminLabel" style={{ flex: '1 1 260px', marginBottom: 0 }}>
                  Номер WhatsApp
                  <input
                    className="bmzInput"
                    value={siteWhatsApp}
                    onChange={(e) => setSiteWhatsApp(e.target.value)}
                    placeholder="77001234567"
                    autoComplete="tel"
                  />
                </label>
                <button type="submit" className="bmzLeadBtn" disabled={siteWaSaving}>
                  {siteWaSaving ? 'Сохранение…' : 'Сохранить номер'}
                </button>
              </div>
            </form>
          </section>

          <section className="bmzAdminSection">
            <h2 className="bmzAdminH2">Подкатегории и товары</h2>
            <p className="bmzGrayText" style={{ marginBottom: 16, maxWidth: 800 }}>
              Шесть направлений зафиксированы. Таблица ниже: подкатегории и товары. Добавление и правка открываются в
              окне по центру. Фото товара — URL-ы, по одному в строке. <strong>Порядок</strong> — число сортировки: чем
              оно меньше, тем выше строка в списке на сайте (0 — первым).
            </p>

            {catalogFormOpen && (showSubForm || showProductForm) && typeof document !== 'undefined'
              ? createPortal(
                  <div
                    className="bmzAdminModalBackdrop"
                    role="presentation"
                    onClick={closeCatalogForm}
                    onKeyDown={(e) => e.key === 'Escape' && closeCatalogForm()}
                  >
                    <div
                      className="bmzAdminModalPanel"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="bmz-catalog-form-title"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bmzAdminModalHead">
                        <h3 id="bmz-catalog-form-title" className="bmzAdminModalTitle">
                          {catalogModalTitle}
                        </h3>
                        <button type="button" className="bmzAdminModalClose" onClick={closeCatalogForm} aria-label="Закрыть">
                          ×
                        </button>
                      </div>
                      <form className="bmzAdminModalForm" onSubmit={handleCatalogFormSubmit}>
                        {showSubForm ? (
                          <>
                            <label className="bmzAdminLabel">
                              Направление (категория)
                              <select
                                className="bmzInput"
                                value={subForm.category}
                                onChange={(e) => setSubForm((f) => ({ ...f, category: e.target.value }))}
                                required
                              >
                                <option value="">—</option>
                                {categoriesSorted.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="bmzAdminLabel">
                              Название подкатегории
                              <input
                                className="bmzInput"
                                value={subForm.name}
                                onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
                                required
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Slug (необязательно)
                              <input
                                className="bmzInput"
                                value={subForm.slug}
                                onChange={(e) => setSubForm((f) => ({ ...f, slug: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Описание
                              <textarea
                                className="bmzInput bmzAdminTextarea"
                                rows={2}
                                value={subForm.description}
                                onChange={(e) => setSubForm((f) => ({ ...f, description: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Картинка (URL обложки)
                              <input
                                className="bmzInput"
                                value={subForm.image}
                                onChange={(e) => setSubForm((f) => ({ ...f, image: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Акцент карточки (цвет на сайте)
                              <select
                                className="bmzInput"
                                value={subForm.accent}
                                onChange={(e) => setSubForm((f) => ({ ...f, accent: e.target.value }))}
                              >
                                <option value="blue">Синий</option>
                                <option value="green">Зелёный</option>
                                <option value="orange">Оранжевый</option>
                              </select>
                              <span className="bmzAdminFieldHint">Как подсвечивается карточка линейки в каталоге.</span>
                            </label>
                            <label className="bmzAdminLabel">
                              Порядок в списке
                              <input
                                type="number"
                                className="bmzInput"
                                value={subForm.order}
                                onChange={(e) => setSubForm((f) => ({ ...f, order: e.target.value }))}
                              />
                              <span className="bmzAdminFieldHint">
                                Меньшее число — выше на странице каталога среди подкатегорий этого направления.
                              </span>
                            </label>
                            <label className="bmzAdminCheck">
                              <input
                                type="checkbox"
                                checked={subForm.isActive}
                                onChange={(e) => setSubForm((f) => ({ ...f, isActive: e.target.checked }))}
                              />
                              Активна
                            </label>
                          </>
                        ) : null}

                        {showProductForm ? (
                          <>
                            <label className="bmzAdminLabel">
                              Направление
                              <select
                                className="bmzInput"
                                value={productForm.category}
                                onChange={(e) => {
                                  const cat = e.target.value
                                  setProductForm((f) => ({
                                    ...f,
                                    category: cat,
                                    subcategory: '',
                                  }))
                                }}
                                required
                              >
                                <option value="">—</option>
                                {categoriesSorted.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="bmzAdminLabel">
                              Подкатегория
                              <select
                                className="bmzInput"
                                value={productForm.subcategory}
                                onChange={(e) => setProductForm((f) => ({ ...f, subcategory: e.target.value }))}
                                required
                              >
                                <option value="">—</option>
                                {subcategories
                                  .filter((s) => String(s.category?._id || s.category) === productForm.category)
                                  .map((s) => (
                                    <option key={s._id} value={s._id}>
                                      {s.name}
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <label className="bmzAdminLabel">
                              Название товара
                              <input
                                className="bmzInput"
                                value={productForm.name}
                                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                                required
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Slug (необязательно)
                              <input
                                className="bmzInput"
                                value={productForm.slug}
                                onChange={(e) => setProductForm((f) => ({ ...f, slug: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Акцент карточки (цвет на сайте)
                              <select
                                className="bmzInput"
                                value={productForm.accent}
                                onChange={(e) => setProductForm((f) => ({ ...f, accent: e.target.value }))}
                              >
                                <option value="blue">Синий</option>
                                <option value="green">Зелёный</option>
                                <option value="orange">Оранжевый</option>
                              </select>
                              <span className="bmzAdminFieldHint">Фон превью, кнопка и цена на карточке модели.</span>
                            </label>
                            <label className="bmzAdminLabel">
                              SKU (артикул)
                              <input
                                className="bmzInput"
                                value={productForm.sku}
                                onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))}
                                placeholder="Например BMZ-FND-01"
                              />
                              <span className="bmzAdminHint">
                                SKU (Stock Keeping Unit) — внутренний код позиции для склада и учёта; на сайте не показывается.
                              </span>
                            </label>
                            <label className="bmzAdminLabel">
                              Краткое описание
                              <input
                                className="bmzInput"
                                value={productForm.shortDescription}
                                onChange={(e) => setProductForm((f) => ({ ...f, shortDescription: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Полное описание
                              <textarea
                                className="bmzInput bmzAdminTextarea"
                                rows={3}
                                value={productForm.description}
                                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Фото товара (URL, по одному в строке)
                              <textarea
                                className="bmzInput bmzAdminTextarea"
                                rows={4}
                                placeholder="https://…/photo1.jpg&#10;https://…/photo2.jpg"
                                value={productForm.imagesUrls}
                                onChange={(e) => setProductForm((f) => ({ ...f, imagesUrls: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminLabel">
                              Цена
                              <input
                                type="number"
                                className="bmzInput"
                                value={productForm.price}
                                onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                              />
                            </label>
                            <label className="bmzAdminCheck">
                              <input
                                type="checkbox"
                                checked={productForm.isActive}
                                onChange={(e) => setProductForm((f) => ({ ...f, isActive: e.target.checked }))}
                              />
                              Активен
                            </label>
                            <label className="bmzAdminCheck">
                              <input
                                type="checkbox"
                                checked={productForm.inStock}
                                onChange={(e) => setProductForm((f) => ({ ...f, inStock: e.target.checked }))}
                              />
                              В наличии
                            </label>
                            <label className="bmzAdminLabel">
                              Порядок в списке
                              <input
                                type="number"
                                className="bmzInput"
                                value={productForm.order}
                                onChange={(e) => setProductForm((f) => ({ ...f, order: e.target.value }))}
                              />
                              <span className="bmzAdminFieldHint">
                                Меньшее число — выше в списке моделей внутри подкатегории на сайте.
                              </span>
                            </label>
                          </>
                        ) : null}

                        <div className="bmzAdminFormActions">
                          {showProductForm ? (
                            <button type="submit" className="bmzLeadBtn">
                              {editingProductId ? 'Сохранить товар' : 'Добавить товар'}
                            </button>
                          ) : null}
                          {showSubForm ? (
                            <button type="submit" className="bmzLeadBtn">
                              {editingSubId ? 'Сохранить подкатегорию' : 'Добавить подкатегорию'}
                            </button>
                          ) : null}
                          <button type="button" className="bmzBackBtn" onClick={closeCatalogForm}>
                            Отмена
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>,
                  document.body,
                )
              : null}

            <div className="bmzAdminCard bmzAdminTableWrap">
              <table className="bmzAdminTable bmzAdminTreeTable">
                <thead>
                  <tr>
                    <th className="bmzAdminTreeColExpand" />
                    <th>Название</th>
                    <th>Slug / цена</th>
                    <th>Статус</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {categoriesSorted.map((cat) => {
                    const subs = subsByCategory.get(String(cat._id)) || []
                    return (
                      <Fragment key={String(cat._id)}>
                        <tr className="bmzAdminTreeCat">
                          <td colSpan={5}>
                            <strong>{cat.name}</strong>
                            <span className="bmzGrayText"> — направление (не редактируется)</span>
                            <button
                              type="button"
                              className="bmzAdminMini"
                              style={{ marginLeft: 12 }}
                              onClick={() => startNewSub(cat._id)}
                            >
                              + Подкатегория
                            </button>
                          </td>
                        </tr>
                        {subs.length === 0 ? (
                          <tr className="bmzAdminTreeEmpty">
                            <td colSpan={5} className="bmzGrayText">
                              Подкатегорий пока нет.
                            </td>
                          </tr>
                        ) : null}
                        {subs.map((s) => {
                          const open = expandedSubs.has(String(s._id))
                          const prods = productsForSub(s._id)
                          return (
                            <Fragment key={String(s._id)}>
                              <tr className="bmzAdminTreeSub">
                                <td>
                                  <button
                                    type="button"
                                    className="bmzAdminExpandBtn"
                                    aria-expanded={open}
                                    onClick={() => toggleSubExpand(s._id)}
                                    title={open ? 'Свернуть товары' : 'Показать товары'}
                                  >
                                    {open ? '▼' : '▶'}
                                  </button>
                                </td>
                                <td>
                                  Подкатегория: <strong>{s.name}</strong>
                                  <button
                                    type="button"
                                    className="bmzAdminMini"
                                    style={{ marginLeft: 8 }}
                                    onClick={() => startNewProduct(cat._id, s._id)}
                                  >
                                    + Товар
                                  </button>
                                </td>
                                <td className="bmzAdminMono">{s.slug}</td>
                                <td>{s.isActive !== false ? 'активна' : 'выкл.'}</td>
                                <td className="bmzAdminRowActions">
                                  <button type="button" className="bmzAdminMini" onClick={() => editSub(s)}>
                                    Изм.
                                  </button>
                                  <button
                                    type="button"
                                    className="bmzAdminMini bmzAdminMini--danger"
                                    onClick={() => deleteSub(s._id)}
                                  >
                                    Удал.
                                  </button>
                                </td>
                              </tr>
                              {open
                                ? prods.map((p) => {
                                    const thumb = Array.isArray(p.images) && p.images[0] ? p.images[0] : null
                                    return (
                                      <tr key={`p-${p._id}`} className="bmzAdminTreeProd">
                                        <td />
                                        <td colSpan={2}>
                                          <span className="bmzAdminProdRow">
                                            {thumb ? (
                                              <img
                                                src={thumb}
                                                alt=""
                                                className="bmzAdminThumb"
                                                loading="lazy"
                                              />
                                            ) : (
                                              <span className="bmzAdminThumb bmzAdminThumb--ph">—</span>
                                            )}
                                            <span>
                                              <strong>Товар:</strong> {p.name}
                                            </span>
                                          </span>
                                        </td>
                                        <td>
                                          {p.price} {p.currency || 'KZT'}
                                        </td>
                                        <td className="bmzAdminRowActions">
                                          <button type="button" className="bmzAdminMini" onClick={() => editProduct(p)}>
                                            Изм.
                                          </button>
                                          <button
                                            type="button"
                                            className="bmzAdminMini bmzAdminMini--danger"
                                            onClick={() => deleteProduct(p._id)}
                                          >
                                            Удал.
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  })
                                : null}
                              {open && prods.length === 0 ? (
                                <tr className="bmzAdminTreeProd">
                                  <td />
                                  <td colSpan={4} className="bmzGrayText">
                                    Товаров нет — нажмите «+ Товар».
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
      </>
    </div>
  )
}
