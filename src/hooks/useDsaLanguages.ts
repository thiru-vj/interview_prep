import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DsaCodeLanguage } from '@/types/database'
import type { AccessRole } from '@/context/accessContext'
import { DSA_LANGUAGES, MAX_LANGUAGES } from '@/utils/dsa'

const STORAGE_KEY = 'interview-prep-dsa-languages'
const VALID = new Set<string>(DSA_LANGUAGES.map((language) => language.value))

function getInitialLanguages(): DsaCodeLanguage[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (Array.isArray(stored)) {
      const valid = stored.filter((value): value is DsaCodeLanguage => VALID.has(value))
      if (valid.length > 0) return valid
    }
  } catch {
    // unavailable or malformed — fall back to the default
  }
  return ['javascript']
}

/**
 * The viewer's chosen solution languages, remembered across visits. The stored
 * selection is never trimmed when the role changes — `languages` is just capped
 * to the role's limit — so a returning admin gets their full selection back
 * even though the page briefly renders as a user while the key re-verifies.
 */
export function useDsaLanguages(role: AccessRole) {
  const [selected, setSelected] = useState<DsaCodeLanguage[]>(getInitialLanguages)
  const max = MAX_LANGUAGES[role]

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
    } catch {
      // ignore write failures
    }
  }, [selected])

  const toggleLanguage = useCallback(
    (language: DsaCodeLanguage) => {
      setSelected((prev) => {
        const current = prev.slice(0, max)
        if (max === 1) return [language]
        if (current.includes(language)) {
          // Always keep at least one language selected.
          return current.length === 1 ? current : current.filter((value) => value !== language)
        }
        return current.length >= max ? current : [...current, language]
      })
    },
    [max],
  )

  // Keep display order stable (JavaScript, Java, Python) regardless of click order.
  const languages = useMemo(() => {
    const capped = new Set(selected.slice(0, max))
    return DSA_LANGUAGES.map((language) => language.value).filter((value) => capped.has(value))
  }, [selected, max])

  return { languages, max, toggleLanguage }
}
