import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import BmzTopNav from '../components/BmzTopNav'
import { buildWhatsAppKpUrl } from '../api/config'
import { useWhatsappDigits } from '../hooks/useWhatsappDigits'

const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { digits: waDigits } = useWhatsappDigits()
  const [isCompactNav, setIsCompactNav] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  )
  const phoneTel = 'tel:+77776948444'
  const whatsappUrl = useMemo(
    () => buildWhatsAppKpUrl('Здравствуйте! Хочу получить консультацию по весам.', waDigits),
    [waDigits],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(max-width: 768px)')
    const handleChange = (e) => setIsCompactNav(e.matches)
    setIsCompactNav(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const navLinks = useMemo(
    () => [
      {
        key: 'products',
        label: 'Автовесы',
        onClick: () =>
          isHome ? scrollToId('home-cat-car') : navigate('/', { state: { scrollTo: 'home-cat-car' } }),
      },
      {
        key: 'equipment',
        label: 'Оборудование',
        onClick: () =>
          isHome ? scrollToId('home-cat-equipment') : navigate('/', { state: { scrollTo: 'home-cat-equipment' } }),
      },
      {
        key: 'railway',
        label: isCompactNav ? 'ЖД весы' : 'Железнодорожные весы',
        onClick: () =>
          isHome ? scrollToId('home-cat-rail') : navigate('/', { state: { scrollTo: 'home-cat-rail' } }),
      },
      {
        key: 'foundation',
        label: 'Фундамент',
        onClick: () =>
          isHome ? scrollToId('home-cat-foundation') : navigate('/', { state: { scrollTo: 'home-cat-foundation' } }),
      },
      {
        key: 'automation',
        label: 'Автоматизация',
        onClick: () =>
          isHome ? scrollToId('home-cat-automation') : navigate('/', { state: { scrollTo: 'home-cat-automation' } }),
      },
      {
        key: 'services',
        label: 'Услуги',
        onClick: () =>
          isHome ? scrollToId('home-cat-services') : navigate('/', { state: { scrollTo: 'home-cat-services' } }),
      },
      {
        key: 'about',
        label: 'О нас',
        onClick: () =>
          isHome ? scrollToId('home-about') : navigate('/', { state: { scrollTo: 'home-about' } }),
      },
      {
        key: 'contacts',
        label: 'Контакты',
        onClick: () =>
          isHome ? scrollToId('home-footer') : navigate('/', { state: { scrollTo: 'home-footer' } }),
      },
    ],
    [navigate, isHome, isCompactNav],
  )

  const handleCta = useCallback(() => {
    if (isHome) scrollToId('home-lead')
    else navigate('/', { state: { scrollTo: 'home-lead' } })
  }, [isHome, navigate])

  return (
    <div className="bmzMain">
      <BmzTopNav
        onGoHome={() => navigate('/')}
        links={navLinks}
        ctaLabel="Получить КП"
        onCta={handleCta}
      />
      <Outlet />
      <div className="bmzFloatSocial" aria-label="Быстрые контакты">
        <a
          href={phoneTel}
          className="bmzFloatSocialBtn bmzFloatSocialBtn--phone"
          aria-label="Позвонить: 8 777 694 8444"
          title="Позвонить"
        >
          <svg
            className="bmzFloatSocialIcon bmzFloatSocialIcon--svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
            />
          </svg>
        </a>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bmzFloatSocialBtn bmzFloatSocialBtn--whatsapp"
            aria-label="Написать в WhatsApp"
            title="WhatsApp"
          >
            <svg
              className="bmzFloatSocialIcon bmzFloatSocialIcon--waSvg"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#25D366"
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
          </a>
        ) : null}
      </div>
    </div>
  )
}
