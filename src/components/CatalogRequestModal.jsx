import { useEffect, useState } from 'react'
import { buildWhatsAppKpUrl } from '../api/config'
import { useWhatsappDigits } from '../hooks/useWhatsappDigits'

const WEIGHT_TYPES = [
  'Железнодорожные весы',
  'Фундамент и монтаж',
  'Автоматизация',
  'Сервис и ремонт',
]

/** Кастомный сценарий для карточек главной (slug категории) */
const HOME_CATEGORY_FLOW = {
  'zheleznodorozhnye-vesy': {
    headline: 'Выберите режим взвешивания вагонов:',
    waKey: 'Режим взвешивания',
    options: [
      { title: 'Статическое взвешивание (Статика)' },
      { title: 'Динамическое взвешивание (Динамика)' },
      { title: 'Нужна консультация специалиста' },
    ],
  },
  avtomatizatsiya: {
    headline: 'Выберите вариант автоматизации:',
    waKey: 'Вариант автоматизации',
    options: [
      { title: 'Базовая автоматизация', subtitle: 'ПО + Компьютер + Принтер, ИБП' },
      { title: 'Автоматизация с фотофиксацией', subtitle: 'ПО + Компьютер + Камеры' },
      { title: 'Полная цифровая интеграция', subtitle: 'ПО + Камеры + 1С + Отчеты в Telegram' },
      { title: 'Нужна консультация специалиста' },
    ],
  },
  uslugi: {
    headline: 'Какие услуги вам необходимы?',
    waKey: 'Услуга',
    options: [
      { title: 'Монтаж и ввод в эксплуатацию (ПНР)' },
      { title: 'Сервис, калибровка и госповерка' },
      { title: 'Модернизация механических весов' },
      { title: 'Ремонт и техническая поддержка' },
      { title: 'Нужна консультация специалиста' },
    ],
  },
  fundament: {
    headline: 'Вид фундамента?',
    waKey: 'Вид фундамента',
    options: [
      { title: 'Эстакадный (на тумбах)' },
      { title: 'Эстакадный (Монолит)' },
      { title: 'Врезной (в уровень с землёй)' },
      { title: 'Нужна консультация' },
    ],
  },
}

function optionToValue(opt) {
  if (typeof opt === 'string') return opt
  if (opt.subtitle) return `${opt.title} — ${opt.subtitle}`
  return opt.title
}

function buildWaMessage({ type, capacity, platform, purpose, customWaKey, customSelection }) {
  const lines = ['Здравствуйте! Хочу получить расчёт стоимости.']
  if (type) lines.push(`Позиция: ${type}`)
  if (customSelection && customWaKey) {
    lines.push(`${customWaKey}: ${customSelection}`)
  }
  if (capacity) lines.push(`Грузоподъёмность: ${capacity}`)
  if (platform) lines.push(`Платформа: ${platform}`)
  if (purpose) lines.push(`Назначение: ${purpose}`)
  return lines.join('\n')
}

function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function CatalogRequestModal({ open, onClose, defaultType, categorySlug = '' }) {
  const { digits } = useWhatsappDigits()
  const [form, setForm] = useState({
    type: '',
    capacity: '',
    platform: '',
    purpose: '',
    customSelection: '',
  })

  const homeFlow = categorySlug ? HOME_CATEGORY_FLOW[categorySlug] : null

  useEffect(() => {
    if (!open) return
    setForm((f) => ({
      ...f,
      type: defaultType || WEIGHT_TYPES[0],
      capacity: '',
      platform: '',
      purpose: '',
      customSelection: '',
    }))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, defaultType])

  if (!open) return null

  const isSelectableType = WEIGHT_TYPES.includes(form.type)
  const previewText = buildWaMessage({
    ...form,
    customWaKey: homeFlow?.waKey,
    customSelection: form.customSelection,
  })

  const canSend = homeFlow ? Boolean(form.customSelection) : true

  function handleSend() {
    if (!canSend) return
    const waDigits = digits || ''
    if (!waDigits) {
      alert('Номер WhatsApp не настроен. Укажите VITE_WHATSAPP_E164 в BMZ/.env')
      return
    }
    const url = buildWhatsAppKpUrl(previewText, waDigits)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="bmzKpModalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="bmzKpModalPanel bmzReqModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bmz-req-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bmzKpModalHead">
          <h2 id="bmz-req-title" className="bmzKpModalTitle">
            📋 Запрос цены
          </h2>
          <button type="button" className="bmzKpModalClose" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="bmzReqModalBody">
          {homeFlow ? (
            <>
              <p className="bmzGrayText bmzReqModalHint">
                Выберите вариант и нажмите «Написать в WhatsApp» — откроется чат с готовым текстом.
              </p>
              <p className="bmzReqCustomHeadline">{homeFlow.headline}</p>
              <div className="bmzReqChoiceList" role="radiogroup" aria-label={homeFlow.headline}>
                {homeFlow.options.map((opt, i) => {
                  const val = optionToValue(opt)
                  const id = `home-req-opt-${categorySlug}-${i}`
                  return (
                    <label
                      key={val}
                      htmlFor={id}
                      className={['bmzReqChoice', form.customSelection === val ? 'bmzReqChoice--on' : ''].join(' ')}
                    >
                      <input
                        id={id}
                        type="radio"
                        name="home-req-custom"
                        value={val}
                        checked={form.customSelection === val}
                        onChange={() => setForm((f) => ({ ...f, customSelection: val }))}
                      />
                      <div className="bmzReqChoiceText">
                        <span className="bmzReqChoiceTitle">{typeof opt === 'string' ? opt : opt.title}</span>
                        {opt && typeof opt === 'object' && opt.subtitle ? (
                          <span className="bmzReqChoiceSub">{opt.subtitle}</span>
                        ) : null}
                      </div>
                    </label>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <p className="bmzGrayText bmzReqModalHint">
                Укажите параметры и откройте WhatsApp — текст подставится автоматически.
              </p>

              <div className="bmzReqField">
                <label className="bmzFieldLabel">Тип весов / услуги</label>
                {isSelectableType ? (
                  <select
                    className="bmzSelect bmzReqInput"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {WEIGHT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                ) : (
                  <input
                    className="bmzInput bmzReqInput"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  />
                )}
              </div>

              {form.type === 'Железнодорожные весы' ? (
                <div className="bmzReqField">
                  <label className="bmzFieldLabel">Грузоподъёмность</label>
                  <input
                    className="bmzInput bmzReqInput"
                    placeholder="Например: 60 т, 80 т, 120 т"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
              ) : null}

              {form.type !== 'Автоматизация' ? (
                <div className="bmzReqField">
                  <label className="bmzFieldLabel">Размер платформы</label>
                  <input
                    className="bmzInput bmzReqInput"
                    placeholder="Например: 18×3 м"
                    value={form.platform}
                    onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  />
                </div>
              ) : null}

              <div className="bmzReqField">
                <label className="bmzFieldLabel">Назначение / объект</label>
                <input
                  className="bmzInput bmzReqInput"
                  placeholder="Карьер, склад, элеватор, завод..."
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="bmzReqModalPreview">
            <div className="bmzReqModalPreviewLabel">Текст для WhatsApp</div>
            <pre className="bmzReqModalPreviewText">{previewText}</pre>
          </div>

          <div className="bmzReqModalFooter bmzReqModalFooter--wa">
            <button type="button" className="bmzBackBtn bmzReqModalBtnCancel" onClick={onClose}>
              Отмена
            </button>
            <button
              type="button"
              className="bmzWaBtn bmzReqModalBtnWa"
              disabled={!canSend}
              onClick={handleSend}
            >
              <WaIcon />
              Написать в WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
