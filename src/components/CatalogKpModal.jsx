import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildWhatsAppKpUrl } from '../api/config'
import { useWhatsappDigits } from '../hooks/useWhatsappDigits'
import BmzSpinner from './BmzSpinner'
import { getSpecHighlightRows } from '../utils/productSpecs'

function buildMessage(productName, categoryName, subName) {
  const lines = [
    'Здравствуйте! Хочу получить коммерческое предложение (КП).',
    `Позиция: «${productName}».`,
  ]
  if (categoryName) lines.push(`Направление: ${categoryName}.`)
  if (subName) lines.push(`Линейка: ${subName}.`)
  return lines.join('\n')
}

export default function CatalogKpModal({ open, onClose, product, categoryName, subName }) {
  const navigate = useNavigate()
  const { digits, ready } = useWhatsappDigits()
  const hasWa = Boolean(digits)
  const message = product?.name ? buildMessage(product.name, categoryName || '', subName || '') : ''
  const waUrl = message ? buildWhatsAppKpUrl(message, digits) : ''

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !product) return null

  const specRows = getSpecHighlightRows(product.specs)
  const descText = String(product.description || '').trim()

  return (
    <div
      className="bmzKpModalBackdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bmzKpModalPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bmz-kp-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bmzKpModalHead">
          <h2 id="bmz-kp-modal-title" className="bmzKpModalTitle">
            Получить КП
          </h2>
          <button type="button" className="bmzKpModalClose" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <p className="bmzGrayText" style={{ marginBottom: 12 }}>
          По товару <strong>{product.name}</strong> мы подготовим предложение. В WhatsApp уже подставлено название
          позиции — останется отправить сообщение.
        </p>
        {descText ? (
          <div className="bmzKpModalBlock">
            <div className="bmzKpModalBlockTitle">Описание</div>
            <div className="bmzKpModalDesc">{descText}</div>
          </div>
        ) : null}
        {specRows.length ? (
          <div className="bmzKpModalBlock">
            <div className="bmzKpModalBlockTitle">Параметры</div>
            <div className="bmzKpModalSpecs">
              {specRows.map((row, idx) => (
                <div key={idx} className="bmzKpModalSpecRow">
                  <span className="bmzKpModalSpecLabel">{row.label}</span>
                  <span className="bmzKpModalSpecValue">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {!ready ? <BmzSpinner label="Проверяем настройки…" variant="inline" /> : null}
        {ready && hasWa && waUrl ? (
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="bmzKpModalWa">
            Написать в WhatsApp
          </a>
        ) : null}
        {ready && !hasWa ? (
          <p className="bmzNoteCard" style={{ fontSize: 13, marginBottom: 12 }}>
            Номер WhatsApp не задан: укажите его в админке (блок «WhatsApp для КП») или в <code>.env</code> как{' '}
            <code>VITE_WHATSAPP_E164</code> (только цифры с кодом страны, без +).
          </p>
        ) : null}
        <button
          type="button"
          className="bmzBackBtn bmzKpModalSecondary"
          onClick={() => {
            onClose()
            navigate('/', { state: { scrollTo: 'home-lead' } })
          }}
        >
          Форма заявки на главной
        </button>
      </div>
    </div>
  )
}
