export default function BmzSpinner({ label = 'Загрузка…', variant = 'page' }) {
  return (
    <div className={variant === 'inline' ? 'bmzSpinnerWrap bmzSpinnerWrap--inline' : 'bmzSpinnerWrap bmzSpinnerWrap--page'}>
      <div className="bmzSpinner" role="status" aria-label={label || 'Загрузка'} />
      {label ? <p className="bmzSpinnerLabel">{label}</p> : null}
    </div>
  )
}
