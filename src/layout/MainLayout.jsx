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
      { key: 'products', label: 'Автовесы', onClick: () => navigate('/products') },
      {
        key: 'found',
        label: 'Фундамент',
        onClick: () =>
          isHome ? scrollToId('home-about') : navigate('/', { state: { scrollTo: 'home-about' } }),
      },
      {
        key: 'auto',
        label: 'Автоматизация',
        onClick: () =>
          isHome ? scrollToId('home-categories') : navigate('/', { state: { scrollTo: 'home-categories' } }),
      },
      {
        key: 'equip',
        label: 'Оборудование',
        onClick: () =>
          isHome ? scrollToId('home-categories') : navigate('/', { state: { scrollTo: 'home-categories' } }),
      },
      {
        key: 'services',
        label: 'Услуги',
        onClick: () =>
          isHome ? scrollToId('home-categories') : navigate('/', { state: { scrollTo: 'home-categories' } }),
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
