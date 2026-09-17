import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls to top on every route (pathname) change — pagination/filter changes update query params only. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return null
}
