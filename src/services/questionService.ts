import { supabase } from '@/lib/supabase'
import type { Difficulty, QuestionWithContext } from '@/types/database'
import { buildPaginatedResult, getRange, PAGE_SIZE, type PaginatedResult } from '@/utils/pagination'

const QUESTION_WITH_CONTEXT_SELECT = `
  *,
  language:languages!questions_language_id_fkey ( id, name, slug ),
  topic:topics!questions_topic_id_fkey ( id, name, slug )
`

export interface QuestionFilters {
  difficulty?: Difficulty | null
  frequentlyAsked?: boolean
}

function applyFilters<T extends { eq: (col: string, val: unknown) => T }>(query: T, filters?: QuestionFilters): T {
  let next = query
  if (filters?.difficulty) next = next.eq('difficulty', filters.difficulty)
  if (filters?.frequentlyAsked) next = next.eq('is_frequently_asked', true)
  return next
}

export async function getQuestionCount(languageId: string, filters?: QuestionFilters): Promise<number> {
  const query = supabase.from('questions').select('id', { count: 'exact', head: true }).eq('language_id', languageId)

  const { count, error } = await applyFilters(query, filters)
  if (error) throw error
  return count ?? 0
}

export async function getQuestionsByLanguage(
  languageId: string,
  page: number,
  pageSize: number = PAGE_SIZE,
  filters?: QuestionFilters,
): Promise<PaginatedResult<QuestionWithContext>> {
  const { from, to } = getRange(page, pageSize)

  const query = supabase
    .from('questions')
    .select(QUESTION_WITH_CONTEXT_SELECT, { count: 'exact' })
    .eq('language_id', languageId)

  const { data, count, error } = await applyFilters(query, filters)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
    .range(from, to)

  if (error) throw error
  return buildPaginatedResult((data ?? []) as unknown as QuestionWithContext[], count ?? 0, page, pageSize)
}

export async function getQuestionsByTopic(
  topicId: string,
  page: number,
  pageSize: number = PAGE_SIZE,
  filters?: QuestionFilters,
): Promise<PaginatedResult<QuestionWithContext>> {
  const { from, to } = getRange(page, pageSize)

  const query = supabase
    .from('questions')
    .select(QUESTION_WITH_CONTEXT_SELECT, { count: 'exact' })
    .eq('topic_id', topicId)

  const { data, count, error } = await applyFilters(query, filters)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
    .range(from, to)

  if (error) throw error
  return buildPaginatedResult((data ?? []) as unknown as QuestionWithContext[], count ?? 0, page, pageSize)
}

export async function getQuestionBySlug(slug: string): Promise<QuestionWithContext | null> {
  const { data, error } = await supabase
    .from('questions')
    .select(QUESTION_WITH_CONTEXT_SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data as unknown as QuestionWithContext | null
}

export async function searchQuestions(
  searchQuery: string,
  page: number,
  pageSize: number = PAGE_SIZE,
): Promise<PaginatedResult<QuestionWithContext>> {
  const trimmed = searchQuery.trim()
  if (!trimmed) {
    return buildPaginatedResult([], 0, page, pageSize)
  }

  const { from, to } = getRange(page, pageSize)
  const tsQuery = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `${term}:*`)
    .join(' & ')

  const { data, count, error } = await supabase
    .from('questions')
    .select(QUESTION_WITH_CONTEXT_SELECT, { count: 'exact' })
    .textSearch('search_vector', tsQuery, { type: 'plain', config: 'english' })
    .order('display_order', { ascending: true })
    .range(from, to)

  if (error) throw error
  return buildPaginatedResult((data ?? []) as unknown as QuestionWithContext[], count ?? 0, page, pageSize)
}

/** Lightweight ordered id/slug list used to compute previous/next navigation within a browsing context. */
export interface QuestionNavItem {
  id: string
  slug: string
  question: string
}

async function getOrderedNavList(column: 'language_id' | 'topic_id', contextId: string): Promise<QuestionNavItem[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, slug, question')
    .eq(column, contextId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export interface AdjacentQuestions {
  previous: QuestionNavItem | null
  next: QuestionNavItem | null
  position: number
  total: number
}

export async function getAdjacentQuestions(
  context: { type: 'language' | 'topic'; id: string },
  currentQuestionId: string,
): Promise<AdjacentQuestions> {
  const list = await getOrderedNavList(context.type === 'language' ? 'language_id' : 'topic_id', context.id)
  const index = list.findIndex((item) => item.id === currentQuestionId)

  if (index === -1) {
    return { previous: null, next: null, position: 0, total: list.length }
  }

  return {
    previous: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
    position: index + 1,
    total: list.length,
  }
}
