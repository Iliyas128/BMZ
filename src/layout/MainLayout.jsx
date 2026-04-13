import { useCallback, useMemo } from 'react'
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
  const instagramUrl = 'https://www.instagram.com/bmz.engineering/?utm_source=ig_web_button_share_sheet'
  const whatsappUrl = useMemo(
    () => buildWhatsAppKpUrl('Здравствуйте! Хочу получить консультацию по весам.', waDigits),
    [waDigits],
  )

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
        label: 'Железнодорожные весы',
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
    ],
    [navigate, isHome],
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
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bmzFloatSocialBtn bmzFloatSocialBtn--instagram"
          aria-label="Открыть Instagram"
          title="Instagram"
        >
          <img src="/instagram.png" alt="" className="bmzFloatSocialIcon" loading="lazy" decoding="async" />
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
            <img src="/whatsapp.png" alt="" className="bmzFloatSocialIcon" loading="lazy" decoding="async" />
          </a>
        ) : null}
      </div>
    </div>
  )
}
