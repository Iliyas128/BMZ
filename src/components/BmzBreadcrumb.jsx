export default function BmzBreadcrumb({ items = [] }) {
  return (
    <div className="bmzBreadcrumb">
      <div className="bmz-container bmzBreadcrumbInner">
        {items.map((it, idx) => (
          <span key={it.key ?? `${it.label}-${idx}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            {idx > 0 ? <span className="bmzCrumbSep">›</span> : null}
            {it.active ? (
              <span className="bmzCrumbActive">{it.label}</span>
            ) : (
              <button
                type="button"
                className="bmzCrumbBtn"
                onClick={it.onClick}
              >
                {it.label}
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

