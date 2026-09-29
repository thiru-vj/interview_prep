import { useEffect, useState } from 'react'

const isDarkNow = () => document.documentElement.classList.contains('dark')

/**
 * Tracks the `dark` class on <html>. Unlike useTheme (whose state is per component),
 * this follows theme toggles made anywhere on the page.
 */
export function useIsDark() {
  const [isDark, setIsDark] = useState(isDarkNow)

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(isDarkNow()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
