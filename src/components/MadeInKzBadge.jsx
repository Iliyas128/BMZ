/** Плавающий знак «Сделано в Казахстане» — закреплён внизу справа окна при прокрутке */
export default function MadeInKzBadge() {
  return (
    <div className="bmzMadeInKzBadge" role="img" aria-label="Сделано в Казахстане">
      <img
        src="/madeInKZ.png"
        alt=""
        width={160}
        height={48}
        loading="lazy"
        decoding="async"
        className="bmzMadeInKzBadgeImg"
      />
    </div>
  )
}
