import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BmzBreadcrumb from '../components/BmzBreadcrumb'

const pageMeta = {
  p1: {
    title: 'Автомобильные весы',
    sub: 'Производство, доставка, фундамент и монтаж под ключ по всему Казахстану. Сертифицированы ГОСТ РК, Госреестр.',
    crumbs: [{ label: 'Автомобильные весы', active: true }],
  },
  'p2-std': {
    title: 'Стандартные автовесы',
    sub: 'Логистика, склады, транспортные предприятия, строительство.',
    crumbs: [
      { label: 'Автомобильные весы', active: false, to: 'p1' },
      { label: 'Стандартные', active: true },
    ],
  },
  'p2-agro': {
    title: 'Промышленные весы / Сельхоз',
    sub: 'Зернобазы, агропредприятия, крупные склады. Длинные платформы до 24 м, до 100 т.',
    crumbs: [
      { label: 'Автомобильные весы', active: false, to: 'p1' },
      { label: 'Промышленные / Сельхоз', active: true },
    ],
  },
  'p2-heavy': {
    title: 'Усиленные весы для карьеров',
    sub: 'Карьеры, горнодобыча, тяжелая техника. Усиленная конструкция, нагрузка до 40 т.',
    crumbs: [
      { label: 'Автомобильные весы', active: false, to: 'p1' },
      { label: 'Усиленные (карьеры)', active: true },
    ],
  },
  p3: {
    title: 'БМЗ-80А / 18×3 м',
    sub: 'Автомобильные весы стационарные: 80 тонн, платформа 18×3,2 м.',
    crumbs: [
      { label: 'Автомобильные весы', active: false, to: 'p1' },
      { label: 'Стандартные', active: false, to: 'p2-std' },
      { label: 'БМЗ-80А / 18×3 м', active: true },
    ],
  },
}

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

export default function ProductPages() {
  const navigate = useNavigate()
  const { pageId } = useParams()

  const active = pageId && pageMeta[pageId] ? pageId : 'p1'

  const setPage = useCallback(
    (id) => {
      if (id === 'p1') navigate('/products')
      else navigate(`/products/${id}`)
    },
    [navigate],
  )

  useEffect(() => {
    if (pageId && !pageMeta[pageId]) navigate('/products', { replace: true })
  }, [pageId, navigate])

  useEffect(() => {
    scrollTop()
  }, [pageId])

  const headerStyle = useMemo(() => {
    if (active === 'p2-agro') return { background: 'linear-gradient(135deg,#1B5E20,#388E3C)' }
    if (active === 'p2-heavy') return { background: 'linear-gradient(135deg,#BF360C,#E64A19)' }
    return undefined
  }, [active])

  const meta = pageMeta[active] || pageMeta.p1
  const breadcrumbItems = useMemo(() => {
    const tail = meta.crumbs.map((c, idx) => {
      if (c.active) {
        return { key: `a-${idx}`, label: c.label, active: true }
      }
      return {
        key: `b-${idx}`,
        label: c.label,
        active: false,
        onClick: () => {
          if (c.to) setPage(c.to)
          scrollTop()
        },
      }
    })

    return [
      {
        key: 'home',
        label: 'Главная',
        active: false,
        onClick: () => navigate('/'),
      },
      ...tail,
    ]
  }, [meta.crumbs, navigate, setPage])

  const content = (() => {
    if (active === 'p1') {
      return (
        <div className="bmzPageContent">
          <div className="bmz-container">
            <div className="bmzSectionLabel" style={{ marginTop: 12 }}>
              Выберите категорию
            </div>
            <div className="bmzSectionTitle">3 категории автовесов</div>

            <div className="bmzCatGrid">
              {[
                {
                  key: 'std',
                  tone: 'default',
                  icon: 'AV',
                  badge: '6 моделей',
                  title: 'Стандартные',
                  desc: 'Для логистики, складов и предприятий. Оптимальные решения для типовых объектов.',
                  pills: [
                    ['6×3 м · 40 т', 'blue'],
                    ['12×3 м · 40 т', 'blue'],
                    ['12×3 м · 60 т', 'blue'],
                    ['18×3 м · 60 т', 'blue'],
                    ['18×3 м · 80 т', 'blue'],
                    ['Усиленные (карьеры) — параметры под запрос', 'orange'],
                  ],
                  btn: 'Смотреть модели',
                },
                {
                  key: 'agro',
                  tone: 'green',
                  icon: 'AG',
                  badge: '3 модели',
                  title: 'Промышленные / Сельхоз',
                  desc: 'Под зернобазы, агропредприятия и крупные склады. Длинные платформы и высокая нагрузка.',
                  pills: [
                    ['18×3 м · 100 т', 'green'],
                    ['24×3 м · 100 т', 'green'],
                    ['24×3,5 м · 100 т', 'green'],
                  ],
                  btn: 'Смотреть модели',
                },
                {
                  key: 'heavy',
                  tone: 'orange',
                  icon: 'HC',
                  badge: '2 модели',
                  title: 'Усиленные (карьеры)',
                  desc: 'Для карьеров и горнодобычи: усиленная конструкция, повышенная нагрузка на ось.',
                  pills: [
                    ['18×3 м · 100 т усил.', 'orange'],
                    ['18×3 м · 120 т усил.', 'orange'],
                  ],
                  btn: 'Смотреть модели',
                },
              ].map((c) => (
                <div
                  key={c.key}
                  className="bmzCatCard"
                  role="button"
                  tabIndex={0}
                  onClick={() => setPage(c.key === 'std' ? 'p2-std' : c.key === 'agro' ? 'p2-agro' : 'p2-heavy')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setPage(c.key === 'std' ? 'p2-std' : c.key === 'agro' ? 'p2-agro' : 'p2-heavy')
                      scrollTop()
                    }
                  }}
                >
                  <div
                    className={[
                      'bmzCatTop',
                      c.tone === 'green' ? 'bmzCatTop--green' : '',
                      c.tone === 'orange' ? 'bmzCatTop--orange' : '',
                    ].join(' ')}
                  >
                    <div className="bmzCatIcon">{c.icon}</div>
                    <div className="bmzCatBadge">{c.badge}</div>
                  </div>
                  <div className="bmzCatBody">
                    <div
                      className={[
                        'bmzCatTitle',
                        c.tone === 'green' ? 'bmzCatTitle--green' : '',
                        c.tone === 'orange' ? 'bmzCatTitle--orange' : '',
                      ].join(' ')}
                    >
                      {c.title}
                    </div>
                    <div className="bmzCatDesc">{c.desc}</div>

                    <div className="bmzPills">
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
                        c.tone === 'green'
                          ? 'bmzCatBtn--green'
                          : c.tone === 'orange'
                            ? 'bmzCatBtn--orange'
                            : 'bmzCatBtn--blue',
                      ].join(' ')}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPage(c.key === 'std' ? 'p2-std' : c.key === 'agro' ? 'p2-agro' : 'p2-heavy')
                        scrollTop()
                      }}
                    >
                      {c.btn} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (active === 'p2-std') {
      return (
        <div className="bmzPageContent">
          <div className="bmz-container">
            <button className="bmzBackBtn" type="button" onClick={() => setPage('p1')}>
              ← Все категории
            </button>
            <div className="bmzSectionLabel">Стандартные — 5 моделей</div>
            <div className="bmzSectionTitle">Выберите модель</div>

            <div className="bmzProdGrid">
              {[
                { key: '40a-6x3', dim: '6 × 3 м', title: 'БМЗ-40А / 6×3', sub: 'Малогабаритные весы · 40 тонн', platform: '6 × 3 м', cap: '40 т', sensors: '4 шт. IP68', price: 'от 3 200 000 ₸' },
                { key: '40a-12x3', dim: '12 × 3 м', title: 'БМЗ-40А / 12×3', sub: 'Стандартные весы · 40 тонн', platform: '12 × 3 м', cap: '40 т', sensors: '6 шт. IP68', price: 'от 4 500 000 ₸' },
                { key: '60a-12x3', dim: '12 × 3 м', title: 'БМЗ-60А / 12×3', sub: 'Стандартные весы · 60 тонн', platform: '12 × 3 м', cap: '60 т', sensors: '6 шт. IP68', price: 'от 5 900 000 ₸' },
                { key: '60a-18x3', dim: '18 × 3 м', title: 'БМЗ-60А / 18×3', sub: 'Промышленные весы · 60 тонн', platform: '18 × 3 м', cap: '60 т', sensors: '8 шт. IP68', price: 'от 6 500 000 ₸' },
                { key: '80a-18x3', dim: '18 × 3 м', title: 'БМЗ-80А / 18×3', sub: 'Промышленные весы · 80 тонн', platform: '18 × 3,2 м', cap: '80 т', sensors: '8 шт. IP68', price: 'от 8 000 000 ₸' },
              ].map((m) => (
                <div key={m.key} className="bmzProdCard" onClick={() => setPage('p3')} role="button" tabIndex={0}>
                  <div className="bmzProdImg">
                    <div className="bmzProdIcon">AV</div>
                    <div className="bmzProdDimBadge">{m.dim}</div>
                  </div>
                  <div className="bmzProdCardBody">
                    <div className="bmzProdTitle">{m.title}</div>
                    <div className="bmzProdSub">{m.sub}</div>
                    <div className="bmzProdSpecs">
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Грузоподъёмность</span>
                        <span className="bmzSpecValue">{m.cap}</span>
                      </div>
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Платформа</span>
                        <span className="bmzSpecValue">{m.platform}</span>
                      </div>
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Тензодатчики</span>
                        <span className="bmzSpecValue">{m.sensors}</span>
                      </div>
                    </div>
                    <div className="bmzProdPrice">{m.price}</div>
                    <button type="button" className="bmzProdBtn">
                      Подробнее →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (active === 'p2-agro') {
      return (
        <div className="bmzPageContent">
          <div className="bmz-container">
            <button className="bmzBackBtn" type="button" onClick={() => setPage('p1')}>
              ← Все категории
            </button>
            <div className="bmzSectionLabel">Промышленные / Сельхоз — 3 модели</div>
            <div className="bmzSectionTitle">Выберите модель</div>

            <div className="bmzProdGrid">
              {[
                { key: '100a-18x3', dim: '18 × 3 м', title: 'БМЗ-100А / 18×3', sub: 'Промышленные · 100 тонн', platform: '18 × 3 м', cap: '100 т', sensors: '8 шт. IP68', price: 'от 9 900 000 ₸' },
                { key: '100a-24x3', dim: '24 × 3 м', title: 'БМЗ-100А / 24×3', sub: 'Сельхоз · 100 тонн', platform: '24 × 3 м', cap: '100 т', sensors: '10 шт. IP68', price: 'от 11 500 000 ₸' },
                { key: '100a-24x3.5', dim: '24 × 3,5 м', title: 'БМЗ-100А / 24×3.5', sub: 'Широкая платформа · 100 тонн', platform: '24 × 3,5 м', cap: '100 т', sensors: '10 шт. IP68', price: 'от 12 200 000 ₸' },
              ].map((m) => (
                <div key={m.key} className="bmzProdCard" onClick={() => setPage('p3')} role="button" tabIndex={0}>
                  <div className="bmzProdImg bmzProdImg--agro">
                    <div className="bmzProdIcon">AG</div>
                    <div className="bmzProdDimBadge" style={{ background: 'rgba(27, 94, 32, 0.92)' }}>{m.dim}</div>
                  </div>
                  <div className="bmzProdCardBody">
                    <div className="bmzProdTitle">{m.title}</div>
                    <div className="bmzProdSub">{m.sub}</div>
                    <div className="bmzProdSpecs">
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Грузоподъёмность</span>
                        <span className="bmzSpecValue">{m.cap}</span>
                      </div>
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Платформа</span>
                        <span className="bmzSpecValue">{m.platform}</span>
                      </div>
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Тензодатчики</span>
                        <span className="bmzSpecValue">{m.sensors}</span>
                      </div>
                    </div>
                    <div className="bmzProdPrice">{m.price}</div>
                    <button type="button" className="bmzProdBtn">
                      Подробнее →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (active === 'p2-heavy') {
      return (
        <div className="bmzPageContent">
          <div className="bmz-container">
            <button className="bmzBackBtn" type="button" onClick={() => setPage('p1')}>
              ← Все категории
            </button>
            <div className="bmzSectionLabel">Усиленные — 2 модели</div>
            <div className="bmzSectionTitle">Выберите модель</div>

            <div className="bmzProdGrid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 680 }}>
              {[
                { key: '100u-18x3', dim: '18 × 3 м · 100 т усил.', title: 'БМЗ-100У / 18×3', sub: 'Усиленная конструкция · 100 тонн', platform: '18 × 3 м', cap: '100 т', sensors: 'Нагрузка на ось до 40 т', price: 'от 12 500 000 ₸' },
                { key: '120u-18x3', dim: '18 × 3 м · 120 т усил.', title: 'БМЗ-120У / 18×3', sub: 'Максимальная нагрузка · 120 тонн', platform: '18 × 3 м', cap: '120 т', sensors: 'Нагрузка на ось до 40 т', price: 'от 14 000 000 ₸' },
              ].map((m) => (
                <div key={m.key} className="bmzProdCard bmzProdCard--heavy" onClick={() => setPage('p3')} role="button" tabIndex={0}>
                  <div className="bmzProdImg bmzProdImg--heavy">
                    <div className="bmzProdIcon">HC</div>
                    <div className="bmzProdDimBadge" style={{ background: 'rgba(230, 81, 0, 0.95)' }}>{m.dim}</div>
                  </div>
                  <div className="bmzProdCardBody">
                    <div className="bmzProdTitle">{m.title}</div>
                    <div className="bmzProdSub">{m.sub}</div>
                    <div className="bmzProdSpecs">
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Грузоподъёмность</span>
                        <span className="bmzSpecValue">{m.cap}</span>
                      </div>
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Платформа</span>
                        <span className="bmzSpecValue">{m.platform}</span>
                      </div>
                      <div className="bmzSpecRow">
                        <span className="bmzSpecLabel">Особенность</span>
                        <span className="bmzSpecValue">{m.sensors}</span>
                      </div>
                    </div>
                    <div className="bmzProdPrice">{m.price}</div>
                    <button type="button" className="bmzProdBtn">
                      Подробнее →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Product detail page (p3)
    return (
      <div className="bmzPageContent">
        <div className="bmz-container">
          <button className="bmzBackBtn" type="button" onClick={() => setPage('p2-std')}>
            ← Все стандартные модели
          </button>

          <div className="bmzProductLayout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="bmzGallery">
                <div className="bmzGalleryMain">
                  <div className="bmzProdIcon" style={{ width: 70, height: 70, borderRadius: 22 }}>
                    AV
                  </div>
                  <div className="bmzGalleryLabel">
                    БМЗ-80А · 18×3,2 м · 80 т
                  </div>
                </div>

                <div className="bmzGalleryThumbs">
                  <div className="bmzThumb bmzThumbActive">1</div>
                  <div className="bmzThumb bmzThumb--2">2</div>
                  <div className="bmzThumb bmzThumb--3">3</div>
                  <div className="bmzThumb bmzThumb--4">4</div>
                </div>
              </div>

              <div className="bmzInfoCard">
                <div className="bmzInfoTitle">Технические характеристики</div>
                <table className="bmzSpecTable">
                  <tbody>
                    <tr><td>Грузоподъёмность (НПВ)</td><td>80 тонн</td></tr>
                    <tr><td>Платформа (Д × Ш × В)</td><td>18 000 × 3 200 × 600 мм</td></tr>
                    <tr><td>Дискретность</td><td>20 кг</td></tr>
                    <tr><td>Тензодатчики</td><td>8 шт. Zemic IP68</td></tr>
                    <tr><td>Весовой индикатор</td><td>IP65, сенсорный</td></tr>
                    <tr><td>Несущая балка</td><td>60Б1 — 600 мм</td></tr>
                    <tr><td>Толщина настила</td><td>8 мм рифлёный</td></tr>
                    <tr><td>Температура работы</td><td>−50°С … +50°С</td></tr>
                    <tr><td>Время взвешивания</td><td>5 секунд</td></tr>
                    <tr><td>Класс точности</td><td>Средний III (ГОСТ 29329)</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="bmzInfoCard">
                <div className="bmzInfoTitle">Что входит в комплект</div>
                <div className="bmzIncludeList">
                  {[
                    'Грузоприёмная платформа (3 секции × 6 м)',
                    '8 тензодатчиков Zemic / IP68',
                    'Весовой индикатор IP65, RS-232/RS-485',
                    'Соединительная коробка IP68',
                    'Кабельная разводка',
                    'Монтаж и пуско-наладка',
                    'Обучение персонала на объекте',
                    'Паспорт, документация, сертификат типа',
                    'Свидетельство о поверке на 1 год',
                  ].map((txt) => (
                    <div key={txt} className="bmzIncludeItem">
                      <div className="bmzIncludeDot" aria-hidden="true">✓</div>
                      <div>{txt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bmzRightStack">
              <div className="bmzInfoCard">
                <div className="bmzInfoTitle" style={{ marginBottom: 10 }}>
                  БМЗ-80А / 18×3 м
                </div>
                <div className="bmzGrayText" style={{ marginBottom: 12 }}>
                  Стационарные автовесы · 80 тонн · сталь С345
                </div>

                <div className="bmzPriceBlock">
                  <div className="bmzPriceLabel">Стоимость (изготовление + монтаж)</div>
                  <div className="bmzPriceMain">от 8 000 000 ₸</div>
                  <div className="bmzPriceNote">Доставка и фундамент рассчитываются отдельно</div>
                </div>

                <div className="bmzActionBtns" style={{ marginTop: 14 }}>
                  <button type="button" className="bmzBtnKp">
                    Запросить коммерческое предложение
                  </button>
                  <button type="button" className="bmzBtnWa">
                    Написать в WhatsApp
                  </button>
                  <button type="button" className="bmzBtnCall">
                    Позвонить: +7 (XXX) XXX-XX-XX
                  </button>
                </div>
              </div>

              <div className="bmzInfoCard">
                <div className="bmzInfoTitle">Гарантия и сроки</div>
                <div className="bmzGuarRow">
                  <div className="bmzGuarItem">
                    <div className="bmzGuarNum">3 года</div>
                    <div className="bmzGuarLabel">Гарантия завода</div>
                  </div>
                  <div className="bmzGuarItem">
                    <div className="bmzGuarNum">20 лет</div>
                    <div className="bmzGuarLabel">Срок службы</div>
                  </div>
                  <div className="bmzGuarItem">
                    <div className="bmzGuarNum">10 дней</div>
                    <div className="bmzGuarLabel">Монтаж</div>
                  </div>
                </div>
              </div>

              <div className="bmzNoteCard">
                <div className="bmzOrangeTitle">Доставка и фундамент</div>
                <div className="bmzGrayText">
                  Доставка — по всему Казахстану, рассчитывается по адресу.
                  <br />
                  Фундамент — 3 варианта на выбор:
                  <br />
                  Раздельный с пандусами — от 3 500 000 ₸
                  <br />
                  Сплошной с пандусами — от 5 600 000 ₸
                  <br />
                  Приямочного типа — от 9 100 000 ₸
                </div>
              </div>

              <div className="bmzNoteCard bmzGreenNote">
                <div className="bmzOrangeTitle">Сертификаты</div>
                <div className="bmzGrayText">
                  ГОСТ РК — допущены к коммерческому взвешиванию.
                  <br />
                  Госреестр РК — зарегистрированы как средство измерения.
                  <br />
                  Сертификат СТ-КЗ — произведено в Казахстане.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  })()

  return (
    <>
      <BmzBreadcrumb items={breadcrumbItems} />

      <section className="bmzPageHeader" style={headerStyle}>
        <div className="bmz-container bmzPageHeaderInner">
          <div className="bmzPageHeaderH1">{meta.title}</div>
          <div className="bmzPageHeaderP">{meta.sub}</div>
        </div>
      </section>

      <main>{content}</main>
    </>
  )
}

