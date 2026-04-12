import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import BmzTopNav from '../components/BmzTopNav'

const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

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
    </div>
  )
}
