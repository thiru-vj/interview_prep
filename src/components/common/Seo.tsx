import { useEffect } from 'react'

interface SeoProps {
  title: string
  description?: string
  canonicalPath?: string
}

const SITE_NAME = 'Interview Prep'

function setMetaTag(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(path: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', `${window.location.origin}${path}`)
}

/** Sets document title, meta description and canonical URL for the current route. */
export function Seo({ title, description, canonicalPath }: SeoProps) {
  useEffect(() => {
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

    if (description) {
      setMetaTag('description', description)
    }

    if (canonicalPath) {
      setCanonical(canonicalPath)
    }
  }, [title, description, canonicalPath])

  return null
}
