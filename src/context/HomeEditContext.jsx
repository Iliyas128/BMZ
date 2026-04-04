/* eslint-disable react-refresh/only-export-components -- context + hook */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getAtContent, setAtContent } from '../utils/homeContentPaths'

const HomeEditContext = createContext(null)

export function HomeEditProvider({ draft, setDraft, children, onServerSave, onBackToAdmin, saveDisabled }) {
  const [panel, setPanel] = useState(null)
  const [localValue, setLocalValue] = useState('')

  const pick = useCallback(
    (pathStr, label, multiline = true) => {
      const cur = getAtContent(draft, pathStr)
      setLocalValue(cur == null ? '' : String(cur))
      setPanel({ pathStr, label, multiline })
    },
    [draft],
  )

  const apply = useCallback(() => {
    if (!panel) return
    setDraft((d) => setAtContent(d, panel.pathStr, localValue))
    setPanel(null)
  }, [panel, localValue, setDraft])

  const cancel = useCallback(() => setPanel(null), [])

  const value = useMemo(() => ({ pick, draft }), [pick, draft])

  return (
    <HomeEditContext.Provider value={value}>
      {children}

      <div className="bmzHomeEditToolbar">
        <span className="bmzHomeEditToolbarLabel">Редактирование главной</span>
        <button
          type="button"
          className="bmzHomeEditToolbarBtn bmzHomeEditToolbarBtn--primary"
          onClick={onServerSave}
          disabled={saveDisabled}
        >
          Сохранить на сервере
        </button>
        {onBackToAdmin ? (
          <button type="button" className="bmzHomeEditToolbarBtn" onClick={onBackToAdmin}>
            В админку
          </button>
        ) : null}
      </div>

      {panel ? (
        <div className="bmzHomeEditPanel" role="dialog" aria-label={panel.label}>
          <div className="bmzHomeEditPanelHead">
            <div className="bmzHomeEditPanelTitle">{panel.label}</div>
            <button type="button" className="bmzHomeEditPanelClose" onClick={cancel} aria-label="Закрыть">
              ×
            </button>
          </div>
          {panel.multiline ? (
            <textarea
              className="bmzInput bmzHomeEditPanelTextarea"
              rows={6}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
            />
          ) : (
            <input
              className="bmzInput"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
            />
          )}
          <div className="bmzHomeEditPanelActions">
            <button type="button" className="bmzLeadBtn" onClick={apply}>
              Применить
            </button>
            <button type="button" className="bmzBackBtn" onClick={cancel}>
              Отмена
            </button>
          </div>
        </div>
      ) : null}
    </HomeEditContext.Provider>
  )
}

export function useHomeEdit() {
  return useContext(HomeEditContext)
}
