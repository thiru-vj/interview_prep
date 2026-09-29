import type { DsaProblem, QuestionWithContext } from '@/types/database'
import type { ItemRef } from '@/lib/progress'

const WORDS_PER_MINUTE = 200

/** Rough reading time for an answer (plus example and code), rounded up to whole minutes. */
export function readingMinutes(...parts: (string | null | undefined)[]): number {
  const words = parts.reduce((sum, part) => sum + (part ? part.split(/\s+/).filter(Boolean).length : 0), 0)
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function questionRef(
  question: Pick<QuestionWithContext, 'slug' | 'question' | 'language_id' | 'topic_id'>,
): ItemRef {
  return {
    kind: 'question',
    slug: question.slug,
    title: question.question,
    href: `/questions/${question.slug}`,
    languageId: question.language_id,
    topicId: question.topic_id,
  }
}

export function dsaRef(problem: Pick<DsaProblem, 'slug' | 'title' | 'topic_id'>): ItemRef {
  return {
    kind: 'dsa',
    slug: problem.slug,
    title: problem.title,
    href: `/dsa?q=${encodeURIComponent(problem.title)}#${problem.slug}`,
    topicId: problem.topic_id,
  }
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Stable pick for "today" — the same item all day, a different one tomorrow. */
export function pickForDay<T>(items: readonly T[], day: string): T | undefined {
  if (items.length === 0) return undefined
  let hash = 0
  for (const char of day) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return items[hash % items.length]
}
