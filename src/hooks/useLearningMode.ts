import { useCallback } from 'react'
import { setPrefs } from '@/lib/progress'
import { useAccess } from './useAccess'
import { useProgress } from './useProgress'

/**
 * Learning mode hides answers and solutions until the learner reveals them. Users start
 * with it on; admins start with everything visible. Either can switch it, and the choice
 * is remembered separately for each role.
 */
export function useLearningMode() {
  const { role } = useAccess()
  const { prefs } = useProgress()
  const enabled = prefs.learningMode[role] ?? role !== 'admin'

  const setEnabled = useCallback(
    (value: boolean) => setPrefs({ learningMode: { ...prefs.learningMode, [role]: value } }),
    [prefs.learningMode, role],
  )

  return { enabled, setEnabled }
}
