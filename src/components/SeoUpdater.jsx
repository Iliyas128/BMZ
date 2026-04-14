import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'BMZ Engineering'

const DESC_HOME =
  'Производство и поставка автомобильных и железнодорожных весов в Казахстане: проектирование, фундамент, монтаж, поверка и сервис. ТОО BMZ Engineering, Астана.'

const DESC_CATALOG =
  'Каталог весового оборудования: автомобильные, железнодорожные весы, автоматизация и оборудование. Запросить коммерческое предложение — BMZ Engineering.'

const DESC_DEFAULT =
  'BMZ Engineering — промышленные весы, монтаж и сервис по Казахстану. Консультация и коммерческое предложение по запросу.'

function upsertMetaByName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertMetaByProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLinkCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function titleForPath(pathname) {
  if (pathname.startsWith('/auelbek')) return `Администрирование — ${SITE}`
  if (pathname === '/') return `${SITE} — автомобильные и железнодорожные весы | Казахстан`
  if (pathname === '/products') return `Каталог весового оборудования | ${SITE}`
  if (pathname.startsWith('/products/')) return `Каталог | ${SITE}`
  return `${SITE}`
}

function descriptionForPath(pathname) {
  if (pathname.startsWith('/auelbek')) return 'Служебный раздел.'
  if (pathname === '/') return DESC_HOME
  if (pathname.startsWith('/products')) return DESC_CATALOG
  return DESC_DEFAULT
}

const JSONLD_ID = 'bmz-org-jsonld'

export default function SeoUpdater() {
  const { pathname } = useLocation()

  useEffect(() => {
    const origin = window.location.origin
    const url = `${origin}${pathname}`
    const isAdmin = pathname.startsWith('/auelbek')

    const title = titleForPath(pathname)
    const description = descriptionForPath(pathname)

    document.title = title

    upsertMetaByName('description', description)
    upsertMetaByName('robots', isAdmin ? 'noindex, nofollow' : 'index, follow')

    upsertMetaByProperty('og:title', title)
    upsertMetaByProperty('og:description', description)
    upsertMetaByProperty('og:url', url)
    upsertMetaByProperty('og:type', 'website')
    upsertMetaByProperty('og:site_name', SITE)
    upsertMetaByProperty('og:locale', 'ru_KZ')
    upsertMetaByProperty('og:image', `${origin}/BMZ.png`)

    upsertMetaByName('twitter:card', 'summary_large_image')
    upsertMetaByName('twitter:title', title)
    upsertMetaByName('twitter:description', description)

    upsertLinkCanonical(url)

    if (pathname === '/' && !isAdmin) {
      let script = document.getElementById(JSONLD_ID)
      if (!script) {
        script = document.createElement('script')
        script.id = JSONLD_ID
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE,
        url: `${origin}/`,
        description: DESC_HOME,
        telephone: '+77776948444',
        email: 'info@bmz-engineering.kz',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Астана',
          addressCountry: 'KZ',
        },
      })
    } else {
      const script = document.getElementById(JSONLD_ID)
      if (script) script.remove()
    }
  }, [pathname])

  return null
}
