import { withFallback } from '@/lib/withFallback'
import { mockQuestions } from '@/lib/mockData'
import { mockQueries } from './mockQueries'
import { QUESTION_WITH_CONTEXT_SELECT } from './questionService'
import type { Difficulty, Question, QuestionWithContext } from '@/types/database'

/** Upper bound for a study deck / index fetch — the whole bank is a few thousand rows at most. */
const MAX_ROWS = 2000

function mockWithContext(questions: Question[]): QuestionWithContext[] {
  return questions.map((q) => mockQueries.getQuestionBySlug(q.slug)).filter((q): q is QuestionWithContext => !!q)
}

export interface StudyScope {
  languageId: string
  topicId?: string | null
  difficulty?: Difficulty | null
}

/** Every question in a language (or one topic of it) — the pool flashcards and mock interviews draw from. */
export function getStudyQuestions(scope: StudyScope): Promise<QuestionWithContext[]> {
  return withFallback(
    async (supabase) => {
      let query = supabase
        .from('questions')
        .select(QUESTION_WITH_CONTEXT_SELECT)
        .eq(scope.topicId ? 'topic_id' : 'language_id', scope.topicId ?? scope.languageId)
      if (scope.difficulty) query = query.eq('difficulty', scope.difficulty)
      const { data, error } = await query.order('display_order', { ascending: true }).limit(MAX_ROWS)
      if (error) throw error
      return (data ?? []) as unknown as QuestionWithContext[]
    },
    () =>
      mockWithContext(
        mockQuestions.filter(
          (q) =>
            (scope.topicId ? q.topic_id === scope.topicId : q.language_id === scope.languageId) &&
            (!scope.difficulty || q.difficulty === scope.difficulty),
        ),
      ),
  )
}

/** Full questions for a set of slugs (the review queue / bookmarks), in no particular order. */
export function getQuestionsBySlugs(slugs: string[]): Promise<QuestionWithContext[]> {
  if (slugs.length === 0) return Promise.resolve([])
  return withFallback(
    async (supabase) => {
      const { data, error } = await supabase.from('questions').select(QUESTION_WITH_CONTEXT_SELECT).in('slug', slugs)
      if (error) throw error
      return (data ?? []) as unknown as QuestionWithContext[]
    },
    () => mockWithContext(mockQuestions.filter((q) => slugs.includes(q.slug))),
  )
}

export interface RelatedQuestion {
  slug: string
  question: string
  difficulty: Difficulty
}

/** Other questions in the same topic, those sharing the most tags first. */
export function getRelatedQuestions(
  question: Pick<Question, 'id' | 'topic_id' | 'tags'>,
  limit = 4,
): Promise<RelatedQuestion[]> {
  type Row = RelatedQuestion & { id: string; tags: string[] | null }
  const rank = (rows: Row[]) => {
    const tags = new Set(question.tags ?? [])
    return rows
      .filter((row) => row.id !== question.id)
      .map((row, index) => ({ row, index, overlap: (row.tags ?? []).filter((tag) => tags.has(tag)).length }))
      .sort((a, b) => b.overlap - a.overlap || a.index - b.index)
      .slice(0, limit)
      .map(({ row }) => ({ slug: row.slug, question: row.question, difficulty: row.difficulty }))
  }

  return withFallback(
    async (supabase) => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, slug, question, difficulty, tags')
        .eq('topic_id', question.topic_id)
        .order('display_order', { ascending: true })
        .limit(MAX_ROWS)
      if (error) throw error
      return rank((data ?? []) as Row[])
    },
    () => rank(mockQuestions.filter((q) => q.topic_id === question.topic_id)),
  )
}

export interface QuestionIndexItem {
  slug: string
  question: string
  difficulty: Difficulty
  language_id: string
  topic_id: string
}

/** A lightweight list of every question — enough to pick the question of the day. */
export function getQuestionIndex(): Promise<QuestionIndexItem[]> {
  return withFallback(
    async (supabase) => {
      const { data, error } = await supabase
        .from('questions')
        .select('slug, question, difficulty, language_id, topic_id')
        .order('slug', { ascending: true })
        .limit(MAX_ROWS)
      if (error) throw error
      return (data ?? []) as QuestionIndexItem[]
    },
    () =>
      [...mockQuestions]
        .sort((a, b) => a.slug.localeCompare(b.slug))
        .map(({ slug, question, difficulty, language_id, topic_id }) => ({
          slug,
          question,
          difficulty,
          language_id,
          topic_id,
        })),
  )
}
