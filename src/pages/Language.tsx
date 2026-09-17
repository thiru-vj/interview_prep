import { useMemo } from 'react'
import { useParams, useSearchParams, useLocation } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { NotFoundState } from '@/components/common/NotFoundState'
import { TopicList } from '@/components/topic/TopicList'
import { QuestionList } from '@/components/question/QuestionList'
import { DifficultyFilter } from '@/components/question/DifficultyFilter'
import { Pagination } from '@/components/pagination/Pagination'
import { useLanguage } from '@/hooks/useLanguage'
import { useTopics } from '@/hooks/useTopics'
import { useQuestionsByLanguage } from '@/hooks/useQuestions'
import { parsePageParam } from '@/utils/pagination'
import type { Difficulty } from '@/types/database'

export function Language() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const page = parsePageParam(searchParams.get('page'))
  const difficulty = (searchParams.get('difficulty') as Difficulty | null) ?? null

  const { data: language, loading: languageLoading, error: languageError } = useLanguage(slug)
  const { data: topics, loading: topicsLoading } = useTopics(language?.id)
  const {
    data: result,
    loading: questionsLoading,
    error: questionsError,
  } = useQuestionsByLanguage(language?.id, page, { difficulty })

  const returnTo = `${location.pathname}${location.search}`

  function updateParams(next: { page?: number; difficulty?: Difficulty | null }) {
    const params = new URLSearchParams(searchParams)
    if (next.difficulty !== undefined) {
      if (next.difficulty) params.set('difficulty', next.difficulty)
      else params.delete('difficulty')
      params.set('page', '1')
    }
    if (next.page !== undefined) {
      params.set('page', String(next.page))
    }
    setSearchParams(params)
  }

  const startIndex = useMemo(() => (page - 1) * (result?.pageSize ?? 25) + 1, [page, result?.pageSize])

  if (languageLoading) return <LoadingState label="Loading language..." />
  if (languageError) return <ErrorState message="Unable to load this language. Please try again." />
  if (!language) return <NotFoundState title="Language not found" message="We couldn't find that technology." />

  return (
    <div className="flex flex-col gap-8">
      <Seo
        title={`${language.name} Interview Questions | Interview Preparation`}
        description={language.description ?? `Practice ${language.name} interview questions.`}
        canonicalPath={`/languages/${language.slug}`}
      />
      <Breadcrumbs items={[{ label: 'Languages', to: '/languages' }, { label: language.name }]} />

      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{language.name} Interview Questions</h1>
        {language.description && <p className="mt-1 text-slate-500 dark:text-slate-400">{language.description}</p>}
      </header>

      {!topicsLoading && topics && topics.length > 0 && (
        <section aria-labelledby="topics-heading" className="flex flex-col gap-3">
          <h2 id="topics-heading" className="text-lg font-semibold text-slate-900 dark:text-white">
            Topics
          </h2>
          <TopicList languageSlug={language.slug} topics={topics} />
        </section>
      )}

      <section aria-labelledby="questions-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="questions-heading" className="text-lg font-semibold text-slate-900 dark:text-white">
            All Questions
          </h2>
          <DifficultyFilter value={difficulty} onChange={(value) => updateParams({ difficulty: value })} />
        </div>

        {questionsLoading && <LoadingState label="Loading questions..." />}
        {questionsError && <ErrorState message="Unable to load questions. Please try again." />}
        {!questionsLoading && !questionsError && result && result.data.length === 0 && (
          <EmptyState message="Try a different difficulty filter." />
        )}
        {!questionsLoading && !questionsError && result && result.data.length > 0 && (
          <>
            <QuestionList questions={result.data} startIndex={startIndex} returnTo={returnTo} />
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              pageSize={result.pageSize}
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          </>
        )}
      </section>
    </div>
  )
}
