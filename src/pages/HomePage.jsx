import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/config'

const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const fallbackCategoryCards = [
  {
    key: 'car',
    tone: 'blue',
    icon: 'АВ',
    badge: '5 категорий',
    image: '/images/avtoVesy.png',
    title: 'Автомобильные весы',
    desc: 'Для логистики, складов и предприятий: стандартные и усиленные решения.',
    pills: [
      ['Стандартные', 'blue'],
      ['Промышленные / сельхоз', 'blue'],
      ['Усиленные (карьеры)', 'orange'],
    ],
    btn: 'Подробнее',
  },
  {
    key: 'rail',
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
    btn: 'Уточнить',
  },
  {
    key: 'foundation',
    tone: 'blue',
    icon: 'ФУН',
    badge: 'фундамент',
    image: '/images/fundament.png',
    title: 'Фундамент и основание',
    desc: 'Раздельные, сплошные и приямочного типа решения с пандусами.',
    pills: [
      ['Раздельный с пандусами', 'blue'],
      ['Сплошной с пандусами', 'blue'],
      ['Приямочного типа', 'blue'],
    ],
    btn: 'Рассчитать',
  },
  {
    key: 'automation',
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
    btn: 'Обсудить',
  },
  {
    key: 'equipment',
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
    btn: 'Подобрать',
  },
  {
    key: 'services',
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
    btn: 'Получить КП',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({
    type: 'Автомобильные весы',
    capacity: '',
    phone: '',
  })
  const [formStatus, setFormStatus] = useState('idle') // 'idle' | 'sent'
  const [categoryCards, setCategoryCards] = useState(fallbackCategoryCards)

  useEffect(() => {
    const target = location.state?.scrollTo
    if (!target) return
    const id = window.setTimeout(() => {
      scrollToId(target)
      navigate(location.pathname, { replace: true, state: {} })
    }, 0)
    return () => clearTimeout(id)
  }, [location.state?.scrollTo, location.pathname, navigate])

  useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalog/categories`)
        if (!response.ok) return

        const items = await response.json()
        if (!Array.isArray(items) || items.length === 0) return

        const mapped = items.slice(0, 6).map((item, idx) => {
          const fallback = fallbackCategoryCards[idx] || fallbackCategoryCards[0]
          return {
            ...fallback,
            key: item.slug || fallback.key,
            title: item.name || fallback.title,
            desc: item.description || fallback.desc,
            image: item.image || fallback.image,
          }
        })

        if (isMounted) setCategoryCards(mapped)
      } catch {
        // Keep fallback cards when backend is unavailable.
      }
    }

    loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <div className="bmz-container">
        {/* HERO */}
        <section className="bmzHeroBlock" aria-label="Главный экран">
          <div className="bmzHeroInner">
            
              <h1 className="bmzHeroH1">
                Автомобильные и железнодорожные весы под ключ по всему Казахстану
              </h1>
              <p className="bmzHeroSub">
                Производство, фундамент, монтаж, автоматизация, гарантия 3 года
              </p>
              <div className="bmzHeroBtns">
                <button type="button" className="bmzBtnPrimary" onClick={() => scrollToId('home-lead')}>
                  Получить расчет бесплатно
                </button>
                <button type="button" className="bmzBtnGhost" onClick={() => navigate('/products')}>
                  Смотреть продукцию
                </button>
              
            </div>


          </div>
        </section>

        {/* STATS */}
        <section className="bmzBlock bmzStatsBlock">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel">Коротко о результатах</div>
            <div className="bmzSectionTitle">Делаем весы под задачу и сроки</div>
            <div className="bmzStatsRow">
              <div className="bmzStat">
                <div className="bmzStatNum">8</div>
                <div className="bmzStatLabel">типоразмеров автовесов</div>
              </div>
              <div className="bmzStat">
                <div className="bmzStatNum">3 года</div>
                <div className="bmzStatLabel">официальная гарантия</div>
              </div>
              <div className="bmzStat">
                <div className="bmzStatNum">10 дней</div>
                <div className="bmzStatLabel">монтаж под ключ</div>
              </div>
              <div className="bmzStat">
                <div className="bmzStatNum">3 дня</div>
                <div className="bmzStatLabel">выезд инженера</div>
              </div>
              <div className="bmzStatLast">
                <div className="bmzStatNum">РК</div>
                <div className="bmzStatLabel">производство в Казахстане</div>
              </div>
            </div>
          </div>
        </section>

        {/* UTP */}
        <section className="bmzBlockReasons">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel"><p className="typed">Почему выбирают BMZ Engineering</p></div>
            <div className="bmzSectionTitle">8 причин работать с нами</div>
            <div className="bmzUtpGrid">
              {[
                { icon: '01', title: 'Собственное производство', desc: 'Напрямую с завода без посредников' },
                { icon: '02', title: 'Монтаж от 10 дней', desc: 'Установка и ввод в эксплуатацию в краткие сроки' },
                { icon: '03', title: 'Гарантия 3 года', desc: 'Официальная гарантия производителя на оборудование' },
                { icon: '04', title: 'Всё под ключ', desc: 'Фундамент, монтаж, автоматизация и сдача объекта' },
                { icon: '05', title: 'Удаленный контроль', desc: 'Отчеты и синхронизация для бизнеса (Telegram, Email, 1С)' },
                { icon: '06', title: 'ГОСТ РК и госреестр', desc: 'Сертификация для коммерческого использования' },
                { icon: '07', title: 'Сервис за 3 дня', desc: 'Выезд инженера по всему Казахстану' },
                { icon: '08', title: 'Индивидуальный расчёт', desc: 'Под объект, бюджет и геологию' },
              ].map((u) => (
                <div key={u.icon} className="bmzUtpCard">
                  <div className="bmzUtpIcon">{u.icon}</div>
                  <div className="bmzUtpTitle">{u.title}</div>
                  <div className="bmzUtpDesc">{u.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="home-categories" className="bmzBlock bmzBlockProducts">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel">Продукция</div>
            <div className="bmzSectionTitle">Выберите направление</div>

            <div className="bmzCatGrid">
              {categoryCards.map((c) => (
                <div key={c.key} className="bmzCatCard" role="group" aria-label={c.title}>
                  <div
                    className={[
                      'bmzCatTop',
                      c.tone === 'green' ? 'bmzCatTop--green' : '',
                      c.tone === 'orange' ? 'bmzCatTop--orange' : '',
                    ].join(' ')}
                    style={{ backgroundImage: `url(${c.image})` }}
                  >
                    <div className="bmzCatOverlay" />
                    <div className="bmzCatIcon">{c.icon}</div>
                    <div className="bmzCatBadge">{c.badge}</div>
                  </div>
                  <div className="bmzCatBody">
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
                    <button
                      type="button"
                      className={[
                        'bmzCatBtn',
                        c.tone === 'green' ? 'bmzCatBtn--green' : c.tone === 'orange' ? 'bmzCatBtn--orange' : 'bmzCatBtn--blue',
                      ].join(' ')}
                      onClick={() => {
                        if (c.key === 'car' || c.key === 'rail') {
                          navigate('/products')
                        } else {
                          scrollToId('home-lead')
                        }
                      }}
                    >
                      {c.btn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <div className="sep"></div>
        <section id="home-industries" className="bmzBlock bmzBlock--industries">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel">Где применяются весы</div>
            <div className="bmzSectionTitle">Для каких предприятий</div>

            <div className="bmzIndustriesGrid">
              {[
                {
                  key: 'careers',
                  title: '⚒ Карьеры и горнодобыча',
                  tone: 'orange',
                  pills: [
                    ['100 т усиленные', 'orange'],
                    ['120 т усиленные', 'orange'],
                  ],
                },
                {
                  key: 'agro',
                  title: '🌾 Сельское хозяйство',
                  tone: 'blue',
                  pills: [
                    ['40 т · 12 м', 'blue'],
                    ['80 т · 18 м', 'blue'],
                    ['100 т · 24 м', 'blue'],
                  ],
                },
                {
                  key: 'logistics',
                  title: '🚛 Логистика и транспорт',
                  tone: 'blue',
                  pills: [
                    ['60 т · 18 м', 'blue'],
                    ['80 т · 18 м', 'blue'],
                    ['100 т · 18 м', 'blue'],
                  ],
                },
                {
                  key: 'construction',
                  title: '🏗 Строительство и ЖБИ',
                  tone: 'blue',
                  pills: [
                    ['60 т · 18 м', 'blue'],
                    ['80 т · 18 м', 'blue'],
                  ],
                },
                {
                  key: 'rail',
                  title: '🚂 ЖД и горно-переработка',
                  tone: 'blue',
                  pills: [
                    ['Вагонные · 150 т', 'blue'],
                  ],
                  desc: 'Размеры — индивидуально под объект',
                },
                {
                  key: 'warehouse',
                  title: '🏭 Промышленные склады',
                  tone: 'green',
                  pills: [
                    ['80 т · 18 м', 'blue'],
                    ['100 т · 18/24 м', 'blue'],
                  ],
                },
              ].map((i) => (
                <div
                  key={i.key}
                  className={[
                    'bmzIndustryCard',
                    i.tone === 'orange' ? 'bmzIndustryCard--orange' : '',
                    i.tone === 'green' ? 'bmzIndustryCard--green' : '',
                    i.tone === 'blue' ? 'bmzIndustryCard--blue' : '',
                  ].join(' ')}
                >
                  <div className="bmzIndustryTitle">{i.title}</div>
                  {i.desc ? <div className="bmzComment">{i.desc}</div> : null}
                  <div className="bmzIndustryItems">
                    {i.pills.map((p) => (
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEAD FORM */}
        <section id="home-lead" className="bmzBlock bmzLeadBlock">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel" style={{ color: 'var(--green)' }}>
              Быстрая заявка
            </div>
            <div className="bmzSectionTitle">Получите расчет за 24 часа</div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                // No backend in this template; just show a success state.
                setFormStatus('sent')
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
                  Отправить
                </button>
              </div>
            </form>

            <div className="bmzLeadNote">
              {formStatus === 'sent' ? (
                <div className="bmzNoteCard" role="status" style={{ marginTop: 14 }}>
                  Заявка отправлена. Мы свяжемся с вами и подготовим коммерческое предложение.
                </div>
              ) : (
                <>Нажимая “Отправить”, вы оставляете контакт для обратной связи. Консультация бесплатна.</>
              )}
            </div>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section className="bmzBlock">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel">Портфолио</div>
            <div className="bmzSectionTitle">Реализованные объекты</div>

            <div className="bmzPortfolioGrid">
              {[
                { title: 'Карьер в Актобе', sub: '100 т, фундамент и монтаж под ключ' },
                { title: 'Зернобаза в Костанае', sub: '80 т, автоматизация и интеграции' },
                { title: 'Логистика в Астане', sub: '60 т, поставка и ввод в эксплуатацию' },
                { title: 'ЖД объект в Актау', sub: '150 т, вагонные решения' },
              ].map((p) => (
                <div key={p.title} className="bmzProjCard">
                  <div className="bmzProjImg" />
                  <div className="bmzProjInfo">
                    <div className="bmzProjTitle">{p.title}</div>
                    <div className="bmzProjSub">{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="bmzBlock">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel">Доверие</div>
            <div className="bmzSectionTitle">Подтвержденное качество</div>

            <div className="bmzTrustGrid">
              {[
                { title: 'Госреестр РК', desc: 'Весы зарегистрированы как средство измерения' },
                { title: 'ГОСТ РК', desc: 'Соответствие ГОСТ допуска к коммерческому взвешиванию' },
                { title: 'СТ-КЗ', desc: 'Произведено в Казахстане, сертификат происхождения' },
                { title: 'Гарантия 3 года', desc: 'Официальная гарантия производителя на оборудование' },
              ].map((t) => (
                <div key={t.title} className="bmzTrustCard">
                  <div className="bmzTrustTitle">{t.title}</div>
                  <div className="bmzTrustDesc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="home-about" className="bmzBlock">
          <div className="bmzBlockInner">
            <div className="bmzSectionLabel">О компании</div>
            <div className="bmzSectionTitle">BMZ Engineering: производитель, а не дилер</div>

            <div className="bmzGrid2">
              {[
                {
                  title: 'Производство в Казахстане',
                  desc: 'Собственный завод и контроль качества на каждом этапе: сталь, сварка и обработка на станках ЧПУ.',
                },
                {
                  title: 'Полный цикл работ',
                  desc: 'От проектирования фундамента до сдачи объекта. Работаем по всему Казахстану и ведем проект под ключ.',
                },
              ].map((a) => (
                <div key={a.title} className="bmzInfoCard">
                  <div className="bmzInfoTitle">{a.title}</div>
                  <div className="bmzGrayText">{a.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="bmzBlock"
          style={{
            marginTop: 0,
            background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue2) 100%)',
            color: '#fff',
          }}
        >
          <div
            className="bmzBlockInner"
            style={{
              textAlign: 'center',
              paddingTop: 'clamp(22px, 4vw, 42px)',
              paddingBottom: 'clamp(22px, 4vw, 42px)',
            }}
          >
            <div style={{ fontFamily: 'Unbounded, Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(18px, 3vw, 22px)', marginBottom: 8 }}>
              Нужны весы или расчет фундамента?
            </div>
            <div style={{ color: 'rgba(144,202,249,0.95)', fontSize: 'clamp(13px, 1.8vw, 15px)', marginBottom: 18 }}>
              Оставьте заявку — перезвоним в течение 30 минут
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="bmzBtnPrimary"
                onClick={() => scrollToId('home-lead')}
              >
                Получить КП бесплатно
              </button>
              <button
                type="button"
                className="bmzBtnGhost"
                onClick={() => scrollToId('home-lead')}
              >
                Написать в WhatsApp
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bmzFooter">
          <div className="bmzFooterInner">
            <div className="bmzFooterGrid">
              <div>
                <div className="bmzFooterColTitle">BMZ Engineering</div>
                <div className="bmzFooterColText">
                  ТОО “BMZ Engineering”
                  <br />
                  БИН: [указать реквизиты]
                  <br />
                  г. Астана
                </div>
              </div>

              <div>
                <div className="bmzFooterColTitle">Продукция</div>
                <div className="bmzFooterColText">
                  Автомобильные весы
                  <br />
                  ЖД весы
                  <br />
                  Фундамент
                  <br />
                  Автоматизация
                  <br />
                  Оборудование
                </div>
              </div>

              <div>
                <div className="bmzFooterColTitle">Услуги</div>
                <div className="bmzFooterColText">
                  Монтаж и ПНР
                  <br />
                  Калибровка и поверка
                  <br />
                  Модернизация
                  <br />
                  Ремонт
                  <br />
                  Сервис
                </div>
              </div>

              <div>
                <div className="bmzFooterColTitle">Контакты</div>
                <div className="bmzFooterColText">
                  +7 (XXX) XXX-XX-XX
                  <br />
                  email@example.com
                  <br />
                  avtovesy.net
                </div>
              </div>
            </div>

            <div className="bmzFooterBottom">
              © 2025 BMZ Engineering. Все права защищены. Политика конфиденциальности
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

