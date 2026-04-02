import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'

const emptySub = {
  category: '',
  name: '',
  slug: '',
  description: '',
  image: '',
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
  isActive: true,
  inStock: true,
  order: 0,
}

export default function AdminDashboard() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [subForm, setSubForm] = useState(emptySub)
  const [editingSubId, setEditingSubId] = useState(null)

  const [productForm, setProductForm] = useState(emptyProduct)
  const [editingProductId, setEditingProductId] = useState(null)

  const [filterCat, setFilterCat] = useState('')
  const [filterSub, setFilterSub] = useState('')

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
        setError(data.message || 'Ошибка загрузки')
        return
      }
      const [c, s, p] = await Promise.all([cRes.json(), sRes.json(), pRes.json()])
      setCategories(Array.isArray(c) ? c : [])
      setSubcategories(Array.isArray(s) ? s : [])
      setProducts(Array.isArray(p) ? p : [])
    } catch {
      setError('Сервер недоступен')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const subsForFilter = useMemo(() => {
    if (!filterCat) return subcategories
    return subcategories.filter(
      (s) => String(s.category?._id || s.category) === filterCat,
    )
  }, [subcategories, filterCat])

  const productsFiltered = useMemo(() => {
    let list = products
    if (filterCat) list = list.filter((p) => String(p.category?._id || p.category) === filterCat)
    if (filterSub) list = list.filter((p) => String(p.subcategory?._id || p.subcategory) === filterSub)
    return list
  }, [products, filterCat, filterSub])

  async function saveSubcategory(e) {
    e.preventDefault()
    if (!subForm.category || !subForm.name.trim()) return

    const body = {
      category: subForm.category,
      name: subForm.name.trim(),
      slug: subForm.slug?.trim() || undefined,
      description: subForm.description || '',
      image: subForm.image || '',
      order: Number(subForm.order) || 0,
      isActive: !!subForm.isActive,
    }

    const url = editingSubId
      ? `/api/admin/subcategories/${editingSubId}`
      : '/api/admin/subcategories'
    const method = editingSubId ? 'PUT' : 'POST'

    const res = await apiFetch(url, { method, body: JSON.stringify(body) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Ошибка сохранения подкатегории')
      return
    }
    setSubForm(emptySub)
    setEditingSubId(null)
    await loadAll()
  }

  async function deleteSub(id) {
    if (!window.confirm('Удалить подкатегорию?')) return
    const res = await apiFetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.message || 'Не удалось удалить')
      return
    }
    await loadAll()
  }

  function editSub(row) {
    setEditingSubId(String(row._id))
    setSubForm({
      category: String(row.category?._id || row.category),
      name: row.name || '',
      slug: row.slug || '',
      description: row.description || '',
      image: row.image || '',
      order: row.order ?? 0,
      isActive: row.isActive !== false,
    })
  }

  async function saveProduct(e) {
    e.preventDefault()
    if (!productForm.category || !productForm.subcategory || !productForm.name.trim()) return

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
      isActive: !!productForm.isActive,
      inStock: !!productForm.inStock,
      order: Number(productForm.order) || 0,
    }

    const url = editingProductId
      ? `/api/admin/products/${editingProductId}`
      : '/api/admin/products'
    const method = editingProductId ? 'PUT' : 'POST'

    const res = await apiFetch(url, { method, body: JSON.stringify(body) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Ошибка сохранения товара')
      return
    }
    setProductForm(emptyProduct)
    setEditingProductId(null)
    await loadAll()
  }

  async function deleteProduct(id) {
    if (!window.confirm('Удалить товар?')) return
    const res = await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.message || 'Не удалось удалить')
      return
    }
    await loadAll()
  }

  function editProduct(row) {
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
      isActive: row.isActive !== false,
      inStock: row.inStock !== false,
      order: row.order ?? 0,
    })
  }

  if (loading) {
    return (
      <div className="bmz-container bmzAdminPanel">
        <p className="bmzGrayText">Загрузка…</p>
      </div>
    )
  }

  return (
    <div className="bmz-container bmzAdminPanel">
      <div className="bmzAdminIntro">
        <h1 className="bmzAdminH1">Каталог</h1>
        <p className="bmzGrayText">Подкатегории и товары (JWT). Категории можно менять через API или расширить форму позже.</p>
      </div>

      {error ? (
        <div className="bmzNoteCard" style={{ marginBottom: 16, background: '#FFF3E0' }} role="alert">
          {error}
        </div>
      ) : null}

      <section className="bmzAdminSection">
        <h2 className="bmzAdminH2">Подкатегории</h2>
        <div className="bmzAdminGrid">
          <form className="bmzAdminCard" onSubmit={saveSubcategory}>
            <div className="bmzFieldLabel">{editingSubId ? 'Редактирование' : 'Новая подкатегория'}</div>
            <label className="bmzAdminLabel">
              Категория
              <select
                className="bmzInput"
                value={subForm.category}
                onChange={(e) => setSubForm((f) => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="bmzAdminLabel">
              Название
              <input
                className="bmzInput"
                value={subForm.name}
                onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label className="bmzAdminLabel">
              Slug (опц.)
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
              Картинка URL
              <input
                className="bmzInput"
                value={subForm.image}
                onChange={(e) => setSubForm((f) => ({ ...f, image: e.target.value }))}
              />
            </label>
            <label className="bmzAdminLabel">
              Порядок
              <input
                type="number"
                className="bmzInput"
                value={subForm.order}
                onChange={(e) => setSubForm((f) => ({ ...f, order: e.target.value }))}
              />
            </label>
            <label className="bmzAdminCheck">
              <input
                type="checkbox"
                checked={subForm.isActive}
                onChange={(e) => setSubForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Активна
            </label>
            <div className="bmzAdminFormActions">
              <button type="submit" className="bmzLeadBtn">
                {editingSubId ? 'Сохранить' : 'Добавить'}
              </button>
              {editingSubId ? (
                <button
                  type="button"
                  className="bmzBackBtn"
                  onClick={() => {
                    setEditingSubId(null)
                    setSubForm(emptySub)
                  }}
                >
                  Отмена
                </button>
              ) : null}
            </div>
          </form>

          <div className="bmzAdminCard bmzAdminTableWrap">
            <table className="bmzAdminTable">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Slug</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {subcategories.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.category?.name || '—'}</td>
                    <td className="bmzAdminMono">{s.slug}</td>
                    <td className="bmzAdminRowActions">
                      <button type="button" className="bmzAdminMini" onClick={() => editSub(s)}>
                        Изм.
                      </button>
                      <button type="button" className="bmzAdminMini bmzAdminMini--danger" onClick={() => deleteSub(s._id)}>
                        Удал.
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bmzAdminSection">
        <h2 className="bmzAdminH2">Товары</h2>
        <div className="bmzAdminFilters">
          <label className="bmzAdminLabel bmzAdminLabel--inline">
            Фильтр: категория
            <select className="bmzInput" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="">Все</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="bmzAdminLabel bmzAdminLabel--inline">
            Подкатегория
            <select className="bmzInput" value={filterSub} onChange={(e) => setFilterSub(e.target.value)}>
              <option value="">Все</option>
              {subsForFilter.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="bmzAdminGrid">
          <form className="bmzAdminCard" onSubmit={saveProduct}>
            <div className="bmzFieldLabel">{editingProductId ? 'Редактирование товара' : 'Новый товар'}</div>
            <label className="bmzAdminLabel">
              Категория
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
                {categories.map((c) => (
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
              Название
              <input
                className="bmzInput"
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label className="bmzAdminLabel">
              Slug (опц.)
              <input
                className="bmzInput"
                value={productForm.slug}
                onChange={(e) => setProductForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </label>
            <label className="bmzAdminLabel">
              SKU
              <input
                className="bmzInput"
                value={productForm.sku}
                onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </label>
            <label className="bmzAdminLabel">
              Кратко
              <input
                className="bmzInput"
                value={productForm.shortDescription}
                onChange={(e) => setProductForm((f) => ({ ...f, shortDescription: e.target.value }))}
              />
            </label>
            <label className="bmzAdminLabel">
              Описание
              <textarea
                className="bmzInput bmzAdminTextarea"
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
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
            <div className="bmzAdminFormActions">
              <button type="submit" className="bmzLeadBtn">
                {editingProductId ? 'Сохранить' : 'Добавить'}
              </button>
              {editingProductId ? (
                <button
                  type="button"
                  className="bmzBackBtn"
                  onClick={() => {
                    setEditingProductId(null)
                    setProductForm(emptyProduct)
                  }}
                >
                  Отмена
                </button>
              ) : null}
            </div>
          </form>

          <div className="bmzAdminCard bmzAdminTableWrap">
            <table className="bmzAdminTable">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Подкатегория</th>
                  <th>Цена</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {productsFiltered.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.subcategory?.name || '—'}</td>
                    <td>
                      {p.price} {p.currency || 'KZT'}
                    </td>
                    <td className="bmzAdminRowActions">
                      <button type="button" className="bmzAdminMini" onClick={() => editProduct(p)}>
                        Изм.
                      </button>
                      <button type="button" className="bmzAdminMini bmzAdminMini--danger" onClick={() => deleteProduct(p._id)}>
                        Удал.
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
