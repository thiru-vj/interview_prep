import { useCallback, useEffect, useState } from 'react'
import type { PracticeLanguage } from '@/types/database'

const draftKey = (slug: string, language: PracticeLanguage) => `interview-prep-practice:${slug}:${language}`

function readDraft(slug: string, language: PracticeLanguage): string | null {
  try {
    return localStorage.getItem(draftKey(slug, language))
  } catch {
    return null
  }
}

/**
 * The code in the practice editor for one problem + language, saved to localStorage as
 * you type so closing the modal (or switching language) never loses work.
 */
export function usePracticeDraft(slug: string, language: PracticeLanguage, starter: string) {
  const [state, setState] = useState(() => ({ slug, language, code: readDraft(slug, language) ?? starter }))

  // Switching problem or language loads that combination's draft.
  if (state.slug !== slug || state.language !== language) {
    setState({ slug, language, code: readDraft(slug, language) ?? starter })
  }

  useEffect(() => {
    try {
      if (state.code === starter) localStorage.removeItem(draftKey(state.slug, state.language))
      else localStorage.setItem(draftKey(state.slug, state.language), state.code)
    } catch {
      // storage unavailable — the draft just won't persist
    }
  }, [state, starter])

  const setCode = useCallback((code: string) => setState((prev) => ({ ...prev, code })), [])
  const reset = useCallback(() => setState((prev) => ({ ...prev, code: starter })), [starter])

  return { code: state.code, setCode, reset, isModified: state.code !== starter }
}
