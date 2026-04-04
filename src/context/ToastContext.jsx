/* eslint-disable react-refresh/only-export-components -- context + hook */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let idSeq = 0

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const pushToast = useCallback((payload) => {
    const id = ++idSeq
    const type = payload.type === 'error' ? 'error' : 'ok'
    const text = String(payload.text || '')
    setItems((prev) => [...prev, { id, type, text }])
    const ms = payload.duration ?? (type === 'error' ? 7000 : 4000)
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, ms)
    return id
  }, [])

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="bmzToastStack" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`bmzToast bmzToast--${t.type}`}
            role="status"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return { pushToast: () => {} }
  }
  return ctx
}
