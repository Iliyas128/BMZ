import { useHomeEdit } from '../context/HomeEditContext'

export default function HomeHit({ path, label, multiline, className, as: Tag = 'span', children, ...rest }) {
  const ctx = useHomeEdit()
  const nativeBtn = Tag === 'button'
  if (!ctx) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }
  return (
    <Tag
      {...rest}
      role={nativeBtn ? undefined : 'button'}
      tabIndex={nativeBtn ? undefined : 0}
      className={[className, 'bmzHomeEditHit'].filter(Boolean).join(' ')}
      onClick={(e) => {
        e.preventDefault()
        ctx.pick(path, label, multiline)
      }}
      onKeyDown={
        nativeBtn
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                ctx.pick(path, label, multiline)
              }
            }
      }
    >
      {children}
    </Tag>
  )
}
