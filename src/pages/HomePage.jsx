import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { API_BASE_URL, buildWhatsAppKpUrl } from '../api/config'
import { useWhatsappDigits } from '../hooks/useWhatsappDigits'
import HomeHit from '../components/HomeEditHit'
import { HomeEditProvider } from '../context/HomeEditContext'
import { useToast } from '../context/ToastContext'
import { HOME_DEFAULTS } from '../data/homeDefaults'
import { useHomeContent } from '../hooks/useHomeContent'
import BmzSpinner from '../components/BmzSpinner'
import CatalogRequestModal from '../components/CatalogRequestModal'
import { sortCategoriesFixed } from '../utils/catalogCategoryOrder'

function MultilineText({ text }) {
  if (!text) return null
  return (
    <>
      {String(text)
        .split('\n')
        .map((line, i) => (
          <span key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
    </>
  )
}

function normPills(item) {
  if (!item?.pills) return []
  return item.pills.map((p) =>
    Array.isArray(p) ? { text: p[0], tone: p[1] || 'blue' } : { text: p.text || '', tone: p.tone || 'blue' },
  )
}

const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const fallbackCategoryCards = [
  {
    key: 'car',
    slug: 'avtomobilnye-vesy',
    tone: 'blue',
    icon: 'АВ',
    badge: '5 категорий',
    image: '/images/avtoVesy.png',
    title: 'Автомобильные весы',
    desc: 'Для логистики, складов и предприятий: стандартные и усиленные решения.',
    pills: [
      ['Стандартные', 'blue'],
      ['Промышленные / агро', 'blue'],
      ['Усиленные (карьеры)', 'orange'],
    ],
    btn: 'Каталог',
  },
  {
    key: 'rail',
    slug: 'zheleznodorozhnye-vesy',
    tone: 'blue',
    icon: 'ЖД',
    badge: 'под заказ',
    image: '/images/vagonVesy.png',
    title: 'Железнодорожные весы',
    desc: 'Вагонные решения с расчетом под объект и нагрузку.',
    pills: [
      ['Вагонные платформы', 'blue'],
      ['Нагрузка до 150 т', 'blue'],
    ],
    btn: 'Узнать цену',
  },
  {
    key: 'foundation',
    slug: 'fundament',
    tone: 'blue',
    icon: 'ФУН',
    badge: 'фундамент',
    image: '/images/fundament.png',
    title: 'Фундамент и основание',
    desc: 'Раздельные, сплошные и приямочного типа решения с пандусами.',
    pills: [
      ['Надземный(опорные трубы)', 'blue'],
      ['Надземный(монолитная плита)', 'blue'],
      ['Врезной(вровень с землей)', 'blue'],
    ],
    btn: 'Узнать цену',
  },
  {
    key: 'automation',
    slug: 'avtomatizatsiya',
    tone: 'blue',
    icon: 'ПО',
    badge: 'автоматизация',
    image: '/images/avtomatization.jpg',
    title: 'Автоматизация',
    desc: 'ПО и интеграции для учета, контроля и удаленного мониторинга.',
    pills: [
      ['ПО ТС-Транспорт', 'blue'],
      ['IP-камеры и распознавание', 'blue'],
      ['Telegram / Email', 'blue'],
      ['Синхронизация с 1С', 'blue'],
    ],
    btn: 'Узнать цену',
  },
  {
    key: 'equipment',
    slug: 'oborudovanie',
    tone: 'green',
    icon: 'ОБ',
    badge: 'комплект',
    image: '/images/oborudovanie.png',
    title: 'Оборудование',
    desc: 'Тензодатчики, индикаторы и компоненты для разных условий эксплуатации.',
    pills: [
      ['Тензодатчики', 'blue'],
      ['Индикаторы', 'blue'],
      ['Крановые и платформенные весы', 'blue'],
      ['Весы для животных', 'blue'],
    ],
    btn: 'Каталог',
  },
  {
    key: 'services',
    slug: 'uslugi',
    tone: 'orange',
    icon: 'УСЛ',
    badge: 'сервис',
    image: '/images/Uslugi.png',
    title: 'Услуги',
    desc: 'Монтаж и ПНР, калибровка, поверка, модернизация и ремонт.',
    pills: [
      ['Монтаж и ПНР', 'green'],
      ['Калибровка и поверка', 'green'],
      ['Модернизация весов', 'green'],
      ['Сервисное обслуживание', 'green'],
    ],
    btn: 'Узнать цену',
  },
]

const PORTFOLIO_IMAGE_FALLBACK = [
  '/images/Chuchinsk.jpg',
  '/images/karaganda.JPG',
  '/images/konaev.JPG',
  '/images/makinsk.JPG',
]

export default function HomePage({ homeEditMode = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { digits: waDigits } = useWhatsappDigits()
  const { content: publicContent, loading: homeContentLoading } = useHomeContent()
  const { pushToast } = useToast()

  const [editDraft, setEditDraft] = useState(null)
  const [editLoaded, setEditLoaded] = useState(false)

  const [form, setForm] = useState({
    type: 'Автомобильные весы',
    capacity: '',
    phone: '',
  })
  const [formStatus, setFormStatus] = useState('idle')
  const [categoryCards, setCategoryCards] = useState(fallbackCategoryCards)
  const [reqModal, setReqModal] = useState({ open: false, type: '', slug: '' })

  useEffect(() => {
    if (!homeEditMode) return
    let ok = true
    apiFetch('/api/admin/home-content')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!ok) return
        if (d && typeof d === 'object') setEditDraft(d)
        else setEditDraft(structuredClone(HOME_DEFAULTS))
      })
      .catch(() => {
        if (ok) setEditDraft(structuredClone(HOME_DEFAULTS))
      })
      .finally(() => {
        if (ok) setEditLoaded(true)
      })
    return () => { ok = false }
  }, [homeEditMode])

  const content = homeEditMode ? (editDraft ?? HOME_DEFAULTS) : publicContent

  const portfolioItems = useMemo(() => {
    const items = content?.portfolio?.items || []
    return items.map((it, i) => ({
      ...it,
      image: it?.image || PORTFOLIO_IMAGE_FALLBACK[i] || '',
    }))
  }, [content?.portfolio?.items])

  const openBottomWhatsApp = useCallback(() => {
    const text = 'Здравствуйте! Хочу получить консультацию по весам.'
    const url = buildWhatsAppKpUrl(text, waDigits)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else scrollToId('home-lead')
  }, [waDigits])

  const saveHomeToServer = useCallback(async () => {
    if (!homeEditMode || !editLoaded) {
      pushToast({ type: 'error', text: 'Подождите загрузки контента' })
      return
    }
    const payload = editDraft ?? HOME_DEFAULTS
    try {
      const res = await apiFetch('/api/admin/home-content', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        pushToast({ type: 'error', text: data.message || 'Не удалось сохранить' })
        return
      }
      setEditDraft(data)
      pushToast({ type: 'ok', text: 'Главная страница сохранена' })
    } catch {
      pushToast({ type: 'error', text: 'Сервер недоступен' })
    }
  }, [homeEditMode, editLoaded, editDraft, pushToast])

  useEffect(() => {
    const target = location.state?.scrollTo
    if (!target) return
    if (!homeEditMode && homeContentLoading) return
    const id = window.setTimeout(() => {
      scrollToId(target)
      navigate(location.pathname, { replace: true, state: {} })
    }, 80)
    return () => clearTimeout(id)
  }, [location.state?.scrollTo, location.pathname, navigate, homeEditMode, homeContentLoading])

  useEffect(() => {
    let isMounted = true
    async function loadCategories() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalog/categories`)
        if (!response.ok) return
        const items = await response.json()
        if (!Array.isArray(items) || items.length === 0) return
        const sorted = sortCategoriesFixed(items)
        const mapped = fallbackCategoryCards.map((fallback) => {
          const item = sorted.find((item) => item.slug === fallback.slug)
          return {
            ...fallback,
            title: item?.name || fallback.title,
            desc: item?.description || fallback.desc,
            image: item?.image || fallback.image,
          }
        })
        if (isMounted) setCategoryCards(mapped)
      } catch {
        // Keep fallback cards when backend is unavailable.
      }
    }
    loadCategories()
    return () => { isMounted = false }
  }, [])

  if (!homeEditMode && homeContentLoading) {
    return (
      <div className="bmz-container bmzHomeLoadingShell">
        <BmzSpinner label="Загрузка главной…" variant="page" />
      </div>
    )
  }

  const pageBody = (
    <>
      <div className="bmz-container">
        {/* HERO */}
        <section className="bmzHeroBlock" aria-label="Главный экран">
          <div className="bmzHeroInner">
            <HomeHit path="hero.title" label="Заголовок (герой)" multiline as="h1" className="bmzHeroH1">
              {content.hero?.title}
            </HomeHit>
            <HomeHit path="hero.subtitle" label="Подзаголовок (герой)" multiline as="p" className="bmzHeroSub">
              {content.hero?.subtitle}
            </HomeHit>
            <div className="bmzHeroBtns">
              {homeEditMode ? (
                <HomeHit path="hero.primaryCta" label="Текст кнопки заявки" multiline={false} as="button" type="button" className="bmzBtnPrimary">
                  {content.hero?.primaryCta}
                </HomeHit>
              ) : (
                <button type="button" className="bmzBtnPrimary" onClick={() => scrollToId('home-lead')}>
                  {content.hero?.primaryCta}
                </button>
              )}
              {homeEditMode ? (
                <HomeHit path="hero.secondaryCta" label="Текст кнопки «продукция»" multiline={false} as="button" type="button" className="bmzBtnGhost">
                  {content.hero?.secondaryCta}
                </HomeHit>
              ) : (
                <button type="button" className="bmzBtnGhost" onClick={() => navigate('/products')}>
                  {content.hero?.secondaryCta}
                </button>
              )}
            </div>
          </div>
          <div className="bmzHeroMadeInKzOnHero" aria-hidden="true">
            <img src="/madeInKZ.png" alt="" loading="lazy" decoding="async" className="bmzHeroMadeInKzOnHeroImg" />
          </div>
        </section>

        {/* UTP */}
        <section className="bmzBlockReasons">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel">
              <p className="typed">
                <HomeHit path="utp.label" label="Подпись блока «Почему мы»" multiline as="span">
                  {content.utp?.label}
                </HomeHit>
              </p>
            </div>
            <HomeHit path="utp.title" label="Заголовок «Почему мы»" multiline as="div" className="bmzSectionTitle">
              {content.utp?.title}
            </HomeHit>
            <div className="bmzUtpGrid">
              {(content.utp?.items || []).map((u, ui) => (
                <div key={u.icon} className="bmzUtpCard">
                  <HomeHit path={`utp.items.${ui}.icon`} label={`Карточка ${ui + 1}: номер`} multiline={false} as="div" className="bmzUtpIcon">
                    {u.icon}
                  </HomeHit>
                  <HomeHit path={`utp.items.${ui}.title`} label={`Карточка ${ui + 1}: заголовок`} multiline as="div" className="bmzUtpTitle">
                    {u.title}
                  </HomeHit>
                  <HomeHit path={`utp.items.${ui}.desc`} label={`Карточка ${ui + 1}: текст`} multiline as="div" className="bmzUtpDesc">
                    {u.desc}
                  </HomeHit>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="home-categories" className="bmzBlock bmzBlockProducts">
          <div className="bmzBlockInner">
            <HomeHit path="productsSection.label" label="Подпись блока «Продукция»" multiline as="div" className="bmzSectionLabel">
              {content.productsSection?.label}
            </HomeHit>
            <HomeHit path="productsSection.title" label="Заголовок блока «Продукция»" multiline as="div" className="bmzSectionTitle">
              {content.productsSection?.title}
            </HomeHit>

            <div className="bmzCatGrid">
              {categoryCards.map((c) => {
                const cardInner = (
                  <>
                    <div
                      className={[
                        'bmzCatTop',
                        c.tone === 'green' ? 'bmzCatTop--green' : '',
                        c.tone === 'orange' ? 'bmzCatTop--orange' : '',
                      ].join(' ')}
                    >
                      {c.image ? (
                        <img src={c.image} alt="" className="bmzCatTopImg" loading="lazy" decoding="async" />
                      ) : null}
                      <div className="bmzCatOverlay" />
                    </div>
                    <div className="bmzCatBody bmzCatBody--uniformHome">
                      <div className={['bmzCatTitle', c.tone === 'green' ? 'bmzCatTitle--green' : '', c.tone === 'orange' ? 'bmzCatTitle--orange' : ''].join(' ')}>
                        {c.title}
                      </div>
                      <div className="bmzCatDesc">{c.desc}</div>
                      <div className="bmzPills" aria-label="Ключевые параметры">
                        {c.pills.map((p) => (
                          <span
                            key={p[0]}
                            className={[
                              'bmzPill',
                              p[1] === 'green' ? 'bmzPill--green' : p[1] === 'orange' ? 'bmzPill--orange' : 'bmzPill--blue',
                            ].join(' ')}
                          >
                            {p[0]}
                          </span>
                        ))}
                      </div>
                      <div className="bmzCatBodyFill" aria-hidden="true" />
                      <div className="bmzCatBtnRow">
                        {(c.slug === 'avtomobilnye-vesy' || c.slug === 'oborudovanie') ? (
                          <Link
                            to={c.slug ? `/products/c/${c.slug}` : '/products'}
                            className={[
                              'bmzCatBtn bmzCatBtn--outline',
                              c.tone === 'green' ? 'bmzCatBtn--outlineGreen' : c.tone === 'orange' ? 'bmzCatBtn--outlineOrange' : 'bmzCatBtn--outlineBlue',
                            ].join(' ')}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Открыть →
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={[
                              'bmzCatBtn',
                              c.tone === 'green' ? 'bmzCatBtn--green' : c.tone === 'orange' ? 'bmzCatBtn--orange' : 'bmzCatBtn--blue',
                            ].join(' ')}
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              setReqModal({ open: true, type: c.title, slug: c.slug })
                            }}
                          >
                            Узнать цену
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )
                if (homeEditMode) {
                  return (
                    <div key={c.key} id={`home-cat-${c.key}`} className="bmzCatCard" role="group" aria-label={c.title}>
                      {cardInner}
                    </div>
                  )
                }
                return (
                  <div key={c.key} id={`home-cat-${c.key}`} className="bmzCatCard bmzCatCard--link" role="group" aria-label={c.title}>
                    {cardInner}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <div className="sep"></div>
        <section id="home-industries" className="bmzBlock bmzBlock--industries">
          <div className="bmzBlockInner">
            <HomeHit path="industries.label" label="Подпись «Отрасли»" multiline as="div" className="bmzSectionLabel">
              {content.industries?.label}
            </HomeHit>
            <HomeHit path="industries.title" label="Заголовок «Отрасли»" multiline as="div" className="bmzSectionTitle">
              {content.industries?.title}
            </HomeHit>
            <div className="bmzIndustriesGrid">
              {(content.industries?.items || []).map((i, ii) => (
                <div
                  key={i.key}
                  className={[
                    'bmzIndustryCard',
                    i.tone === 'orange' ? 'bmzIndustryCard--orange' : '',
                    i.tone === 'green' ? 'bmzIndustryCard--green' : '',
                    i.tone === 'blue' ? 'bmzIndustryCard--blue' : '',
                  ].join(' ')}
                >
                  <HomeHit path={`industries.items.${ii}.title`} label={`Отрасль ${ii + 1}: заголовок`} multiline as="div" className="bmzIndustryTitle">
                    {i.title}
                  </HomeHit>
                  {i.desc ? (
                    <HomeHit path={`industries.items.${ii}.desc`} label={`Отрасль ${ii + 1}: доп. текст`} multiline as="div" className="bmzComment">
                      {i.desc}
                    </HomeHit>
                  ) : null}
                  <div className="bmzIndustryItems">
                    {normPills(i).map((p, pi) => (
                      <HomeHit
                        key={`${i.key}-${pi}-${p.text}`}
                        path={`industries.items.${ii}.pills.${pi}.text`}
                        label={`Бейдж в «${(i.title || `отрасль ${ii + 1}`).slice(0, 40)}» — строка ${pi + 1}`}
                        multiline={false}
                        as="span"
                        className={[
                          'bmzPill',
                          p.tone === 'green' ? 'bmzPill--green' : p.tone === 'orange' ? 'bmzPill--orange' : 'bmzPill--blue',
                        ].join(' ')}
                      >
                        {p.text}
                      </HomeHit>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEAD FORM */}
        <section id="home-lead" className="bmzBlock bmzLeadBlock">
          <div className="bmzBlockInner">
            <HomeHit path="lead.label" label="Подпись блока заявки" multiline as="div" className="bmzSectionLabel" style={{ color: 'var(--green)' }}>
              {content.lead?.label}
            </HomeHit>
            <HomeHit path="lead.title" label="Заголовок формы заявки" multiline as="div" className="bmzSectionTitle">
              {content.lead?.title}
            </HomeHit>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const lines = ['Здравствуйте! Хочу получить расчёт стоимости.']
                if (form.type) lines.push(`Тип: ${form.type}`)
                if (form.capacity) lines.push(`Грузоподъёмность: ${form.capacity}`)
                if (form.phone) lines.push(`Контакт: ${form.phone}`)
                const message = lines.join('\n')
                const url = buildWhatsAppKpUrl(message, waDigits)
                if (url) {
                  window.open(url, '_blank', 'noopener,noreferrer')
                } else {
                  setFormStatus('sent')
                }
              }}
            >
              <div className="bmzLeadGrid">
                <div>
                  <div className="bmzFieldLabel">Тип весов</div>
                  <div className="bmzField">
                    <select
                      className="bmzSelect"
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    >
                      <option>Автомобильные весы</option>
                      <option>Железнодорожные весы</option>
                      <option>Фундамент и монтаж</option>
                      <option>Автоматизация</option>
                      <option>Сервис и модернизация</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="bmzFieldLabel">Грузоподъемность</div>
                  <div className="bmzField">
                    <input
                      className="bmzInput"
                      placeholder="Например: 60 т"
                      value={form.capacity}
                      onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <div className="bmzFieldLabel">Контактный телефон</div>
                  <div className="bmzField">
                    <input
                      className="bmzInput"
                      placeholder="+7 ..."
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <button className="bmzLeadBtn" type="submit">
                  Отправить заявку
                </button>
              </div>
            </form>

            <div className="bmzLeadNote">
              {formStatus === 'sent' ? (
                <div className="bmzNoteCard" role="status" style={{ marginTop: 14 }}>
                  <HomeHit path="lead.successMessage" label="Сообщение после отправки формы" multiline as="span">
                    {content.lead?.successMessage}
                  </HomeHit>
                </div>
              ) : (
                <HomeHit path="lead.note" label="Текст под формой заявки" multiline as="span">
                  {content.lead?.note}
                </HomeHit>
              )}
            </div>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section className="bmzBlock">
          <div className="bmzBlockInner">
            <HomeHit path="portfolio.label" label="Подпись портфолио" multiline as="div" className="bmzSectionLabel">
              {content.portfolio?.label}
            </HomeHit>
            <HomeHit path="portfolio.title" label="Заголовок портфолио" multiline as="div" className="bmzSectionTitle">
              {content.portfolio?.title}
            </HomeHit>
            <div className="bmzPortfolioGrid">
              {portfolioItems.map((p, pi) => (
                <div key={`${p.title}-${pi}`} className="bmzProjCard">
                  {homeEditMode ? (
                    <HomeHit path={`portfolio.items.${pi}.image`} label={`Портфолио ${pi + 1}: URL фото`} multiline={false} as="div" className="bmzProjImgWrap bmzProjImgWrap--hit">
                      {p.image ? (
                        <img src={p.image} alt="" className="bmzProjImgPhoto" loading="lazy" decoding="async" />
                      ) : (
                        <div className="bmzProjImg bmzProjImg--placeholder">Укажите URL фото</div>
                      )}
                    </HomeHit>
                  ) : p.image ? (
                    <div className="bmzProjImgWrap">
                      <img src={p.image} alt="" className="bmzProjImgPhoto" loading="lazy" decoding="async" />
                    </div>
                  ) : (
                    <div className="bmzProjImgWrap">
                      <div className="bmzProjImg bmzProjImg--placeholder" aria-hidden />
                    </div>
                  )}
                  <div className="bmzProjInfo">
                    <HomeHit path={`portfolio.items.${pi}.title`} label={`Портфолио ${pi + 1}: название`} multiline as="div" className="bmzProjTitle">
                      {p.title}
                    </HomeHit>
                    <HomeHit path={`portfolio.items.${pi}.sub`} label={`Портфолио ${pi + 1}: подзаголовок`} multiline as="div" className="bmzProjSub">
                      {p.sub}
                    </HomeHit>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="bmzBlock">
          <div className="bmzBlockInner">
            <HomeHit path="trust.label" label="Подпись «Доверие»" multiline as="div" className="bmzSectionLabel">
              {content.trust?.label}
            </HomeHit>
            <HomeHit path="trust.title" label="Заголовок «Доверие»" multiline as="div" className="bmzSectionTitle">
              {content.trust?.title}
            </HomeHit>
            <div className="bmzTrustGrid">
              {(content.trust?.items || []).map((t, ti) => (
                <div key={t.title} className="bmzTrustCard">
                  <HomeHit path={`trust.items.${ti}.title`} label={`Доверие ${ti + 1}: заголовок`} multiline as="div" className="bmzTrustTitle">
                    {t.title}
                  </HomeHit>
                  <HomeHit path={`trust.items.${ti}.desc`} label={`Доверие ${ti + 1}: текст`} multiline as="div" className="bmzTrustDesc">
                    {t.desc}
                  </HomeHit>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="home-about" className="bmzBlock">
          <div className="bmzBlockInner">
            <HomeHit path="about.label" label="Подпись «О компании»" multiline as="div" className="bmzSectionLabel">
              {content.about?.label}
            </HomeHit>
            <HomeHit path="about.title" label="Заголовок «О компании»" multiline as="div" className="bmzSectionTitle">
              {content.about?.title}
            </HomeHit>
            <div className="bmzGrid2">
              {(content.about?.items || []).map((a, ai) => (
                <div key={a.title} className="bmzInfoCard">
                  <HomeHit path={`about.items.${ai}.title`} label={`О компании ${ai + 1}: заголовок`} multiline as="div" className="bmzInfoTitle">
                    {a.title}
                  </HomeHit>
                  <HomeHit path={`about.items.${ai}.desc`} label={`О компании ${ai + 1}: текст`} multiline as="div" className="bmzGrayText">
                    {a.desc}
                  </HomeHit>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bmzBlock" style={{ marginTop: 0, background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue2) 100%)', color: '#fff' }}>
          <div className="bmzBlockInner" style={{ textAlign: 'center', paddingTop: 'clamp(22px, 4vw, 42px)', paddingBottom: 'clamp(22px, 4vw, 42px)' }}>
            <HomeHit path="bottomCta.title" label="Нижний блок: заголовок" multiline as="div" style={{ fontFamily: 'Unbounded, Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(18px, 3vw, 22px)', marginBottom: 8 }}>
              {content.bottomCta?.title}
            </HomeHit>
            <HomeHit path="bottomCta.subtitle" label="Нижний блок: подзаголовок" multiline as="div" style={{ color: 'rgba(144,202,249,0.95)', fontSize: 'clamp(13px, 1.8vw, 15px)', marginBottom: 18 }}>
              {content.bottomCta?.subtitle}
            </HomeHit>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {homeEditMode ? (
                <HomeHit path="bottomCta.primaryBtn" label="Нижний блок: кнопка 1" multiline={false} as="button" type="button" className="bmzBtnPrimary">
                  {content.bottomCta?.primaryBtn}
                </HomeHit>
              ) : (
                <button type="button" className="bmzBtnPrimary" onClick={() => scrollToId('home-lead')}>
                  {content.bottomCta?.primaryBtn}
                </button>
              )}
              {homeEditMode ? (
                <HomeHit path="bottomCta.secondaryBtn" label="Нижний блок: кнопка 2" multiline={false} as="button" type="button" className="bmzBtnGhost">
                  {content.bottomCta?.secondaryBtn}
                </HomeHit>
              ) : (
                <button type="button" className="bmzBtnGhost" onClick={openBottomWhatsApp}>
                  {content.bottomCta?.secondaryBtn}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bmzFooter">
          <div className="bmzFooterInner">
            <div className="bmzFooterGrid">
              <div>
                <HomeHit path="footer.col1Title" label="Подвал: колонка 1 заголовок" multiline as="div" className="bmzFooterColTitle">
                  {content.footer?.col1Title}
                </HomeHit>
                <div className="bmzFooterColText">
                  <HomeHit path="footer.col1Text" label="Подвал: колонка 1 текст" multiline as="div">
                    <MultilineText text={content.footer?.col1Text} />
                  </HomeHit>
                </div>
              </div>

              <div>
                <div className="bmzFooterColTitle">Продукция</div>
                <div className="bmzFooterColLinks">
                  <Link to="/products/c/avtomobilnye-vesy" className="bmzFooterLink">Автомобильные весы</Link>
                  <Link to="/products/c/oborudovanie" className="bmzFooterLink">Оборудование</Link>
                </div>
              </div>

              <div>
                <div className="bmzFooterColTitle">Услуги</div>
                <div className="bmzFooterColLinks">
                  {[
                    'Монтаж и ПНР',
                    'Калибровка и поверка',
                    'Модернизация',
                    'Ремонт',
                    'Сервисное обслуживание',
                  ].map((service) => {
                    const msg = `Здравствуйте! Интересует услуга: ${service}.`
                    const waUrl = buildWhatsAppKpUrl(msg, waDigits)
                    return waUrl ? (
                      <a key={service} href={waUrl} target="_blank" rel="noopener noreferrer" className="bmzFooterLink bmzFooterLink--wa">
                        {service}
                      </a>
                    ) : (
                      <span key={service} className="bmzFooterLink">{service}</span>
                    )
                  })}
                </div>
              </div>

              <div>
                <HomeHit path="footer.col4Title" label="Подвал: колонка 4 заголовок" multiline as="div" className="bmzFooterColTitle">
                  {content.footer?.col4Title}
                </HomeHit>
                <div className="bmzFooterColText">
                  <HomeHit path="footer.col4Text" label="Подвал: колонка 4 текст" multiline as="div">
                    <MultilineText text={content.footer?.col4Text} />
                  </HomeHit>
                </div>
              </div>
            </div>

            <HomeHit path="footer.copyright" label="Копирайт в подвале" multiline as="div" className="bmzFooterBottom">
              {content.footer?.copyright}
            </HomeHit>
          </div>
        </footer>
      </div>

      <CatalogRequestModal
        open={reqModal.open}
        onClose={() => setReqModal({ open: false, type: '', slug: '' })}
        defaultType={reqModal.type}
        categorySlug={reqModal.slug}
      />
    </>
  )

  if (homeEditMode) {
    return (
      <HomeEditProvider
        draft={editDraft ?? HOME_DEFAULTS}
        setDraft={setEditDraft}
        onServerSave={saveHomeToServer}
        onBackToAdmin={() => navigate('/auelbek/dashboard')}
        saveDisabled={!editLoaded}
      >
        {pageBody}
      </HomeEditProvider>
    )
  }

  return pageBody
}