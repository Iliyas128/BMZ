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
      { key: 'products', label: 'Автовесы', to: '/products/c/avtomobilnye-vesy' },
      { key: 'rail', label: 'ЖД весы', to: '/products/c/zheleznodorozhnye-vesy' },
      { key: 'found', label: 'Фундамент', to: '/products/c/fundament' },
      { key: 'auto', label: 'Автоматизация', to: '/products/c/avtomatizatsiya' },
      { key: 'equip', label: 'Оборудование', to: '/products/c/oborudovanie' },
      { key: 'services', label: 'Услуги', to: '/products/c/uslugi' },
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
