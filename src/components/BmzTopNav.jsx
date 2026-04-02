import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

function MenuIcon() {
  return (
    <svg className="bmzMobileToggleIcon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.3 5.71L12 12.01l6.3 6.29-1.42 1.42L10.59 13.4 4.29 19.7 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3 1.42 1.42z"
      />
    </svg>
  )
}

export default function BmzTopNav({
  onGoHome,
  links,
  ctaLabel = 'Получить КП',
  onCta,
}) {
  const [open, setOpen] = useState(false)

  const preparedLinks = useMemo(() => {
    return (links || []).map((l) => ({
      key: l.key ?? l.label,
      label: l.label,
      onClick: l.onClick,
      tone: l.tone ?? 'default',
    }))
  }, [links])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const drawer =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div className="bmzMobileOverlay" role="presentation">
            <button
              type="button"
              className="bmzMobileBackdrop"
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
            />
            <aside
              id="bmz-mobile-drawer"
              className="bmzMobileDrawer"
              role="dialog"
              aria-modal="true"
              aria-label="Меню навигации"
            >
              <div className="bmzMobileDrawerHead">
                <span className="bmzMobileDrawerTitle">Меню</span>
                <button
                  type="button"
                  className="bmzMobileDrawerClose"
                  aria-label="Закрыть"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <nav className="bmzMobileDrawerNav" aria-label="Разделы">
                {preparedLinks.map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    className="bmzMobileLinkBtn"
                    onClick={() => {
                      setOpen(false)
                      l.onClick?.()
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </nav>
            </aside>
          </div>,
          document.body,
        )
      : null

  return (
    <header className="bmzTopNav">
      <div className="bmz-container bmzTopNavInner">
        <button type="button" className="bmzLogoBtn" onClick={onGoHome}>
          BMZ Engineering
        </button>

        <nav className="bmzNavLinks" aria-label="Основная навигация">
          {preparedLinks.map((l) => (
            <button
              key={l.key}
              type="button"
              className="bmzNavLinkBtn"
              onClick={() => l.onClick?.()}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <button type="button" className="bmzNavCTA" onClick={onCta}>
          {ctaLabel}
        </button>

        <button
          type="button"
          className="bmzMobileToggle"
          aria-expanded={open}
          aria-controls="bmz-mobile-drawer"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon />
        </button>
      </div>

      {drawer}
    </header>
  )
}
