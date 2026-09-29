import type { DsaCodeLanguage, DsaSolutionType } from '@/types/database'

export type DsaSection = 'question' | 'answer' | 'explanation' | 'brute' | 'optimal' | 'alternate' | 'time' | 'space'

export const DSA_SECTIONS: { value: DsaSection; label: string }[] = [
  { value: 'question', label: 'Question' },
  { value: 'answer', label: 'Answer' },
  { value: 'explanation', label: 'Explanation' },
  { value: 'brute', label: 'Brute Force' },
  { value: 'optimal', label: 'Optimal Solution' },
  { value: 'alternate', label: 'Alternate Solutions' },
  { value: 'time', label: 'Time Complexity' },
  { value: 'space', label: 'Space Complexity' },
]

export const DEFAULT_DSA_SECTIONS: DsaSection[] = ['question', 'answer']

/** Admins see every section by default. */
export const ALL_DSA_SECTIONS: DsaSection[] = DSA_SECTIONS.map((section) => section.value)

const SECTION_VALUES = new Set<string>(ALL_DSA_SECTIONS)

/**
 * Parses the `show` query param. A missing param means `defaults`; an empty one
 * (every section switched off) is a valid, distinct state that shows titles only.
 */
export function parseSectionsParam(value: string | null, defaults: DsaSection[] = DEFAULT_DSA_SECTIONS): DsaSection[] {
  if (value === null) return defaults
  return value.split(',').filter((section): section is DsaSection => SECTION_VALUES.has(section))
}

export const DSA_LANGUAGES: { value: DsaCodeLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
]

/** How many solution languages each role may view at once. */
export const MAX_LANGUAGES = { user: 1, admin: 3 } as const

export const SOLUTION_TYPE_LABELS: Record<DsaSolutionType, string> = {
  brute: 'Brute Force',
  optimal: 'Optimal',
  alternate: 'Alternate',
}
