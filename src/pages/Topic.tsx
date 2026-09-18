import { useMemo } from 'react'
import { useParams, useSearchParams, useLocation } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { NotFoundState } from '@/components/common/NotFoundState'
import { QuestionList } from '@/components/question/QuestionList'
import { DifficultyFilter } from '@/components/question/DifficultyFilter'
import { FaqToggle } from '@/components/question/FaqToggle'
import { Pagination } from '@/components/pagination/Pagination'
import { useLanguage } from '@/hooks/useLanguage'
import { useTopic } from '@/hooks/useTopic'
import { useQuestionsByTopic } from '@/hooks/useQuestions'
import { parsePageParam } from '@/utils/pagination'
import type { Difficulty } from '@/types/database'

export function Topic() {
  const { slug, topicSlug } = useParams<{ slug: string; topicSlug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const page = parsePageParam(searchParams.get('page'))
  const difficulty = (searchParams.get('difficulty') as Difficulty | null) ?? null
  const frequentlyAsked = searchParams.get('faq') === 'true'

  const { data: language, loading: languageLoading, error: languageError } = useLanguage(slug)
  const { data: topic, loading: topicLoading, error: topicError } = useTopic(language?.id, topicSlug)
  const {
    data: result,
    loading: questionsLoading,
    error: questionsError,
  } = useQuestionsByTopic(topic?.id, page, { difficulty, frequentlyAsked })

  const returnTo = `${location.pathname}${location.search}`

  function updateParams(next: { page?: number; difficulty?: Difficulty | null; faq?: boolean }) {
    const params = new URLSearchParams(searchParams)
    if (next.difficulty !== undefined) {
      if (next.difficulty) params.set('difficulty', next.difficulty)
      else params.delete('difficulty')
      params.set('page', '1')
    }
    if (next.faq !== undefined) {
      if (next.faq) params.set('faq', 'true')
      else params.delete('faq')
      params.set('page', '1')
    }
    if (next.page !== undefined) {
      params.set('page', String(next.page))
    }
    setSearchParams(params)
  }

  const startIndex = useMemo(() => (page - 1) * (result?.pageSize ?? 25) + 1, [page, result?.pageSize])

  const loading = languageLoading || topicLoading
  const error = languageError || topicError

  if (loading) return <LoadingState label="Loading topic..." />
  if (error) return <ErrorState message="Unable to load this topic. Please try again." />
  if (!language) return <NotFoundState title="Language not found" message="We couldn't find that technology." />
  if (!topic) return <NotFoundState title="Topic not found" message="We couldn't find that topic." />

  return (
    <div className="flex flex-col gap-8">
      <Seo
        title={`${language.name} ${topic.name} Interview Questions | Interview Preparation`}
        description={topic.description ?? `Practice ${language.name} ${topic.name} interview questions.`}
        canonicalPath={`/languages/${language.slug}/topics/${topic.slug}`}
      />
      <Breadcrumbs
        items={[
          { label: 'Languages', to: '/languages' },
          { label: language.name, to: `/languages/${language.slug}` },
          { label: topic.name },
        ]}
      />

      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {language.name} {topic.name} Interview Questions
        </h1>
        {topic.description && <p className="mt-1 text-slate-500 dark:text-slate-400">{topic.description}</p>}
      </header>

      <section aria-labelledby="questions-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="questions-heading" className="sr-only">
            Questions
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <FaqToggle value={frequentlyAsked} onChange={(value) => updateParams({ faq: value })} />
            <DifficultyFilter value={difficulty} onChange={(value) => updateParams({ difficulty: value })} />
          </div>
        </div>

        {questionsLoading && <LoadingState label="Loading questions..." />}
        {questionsError && <ErrorState message="Unable to load questions. Please try again." />}
        {!questionsLoading && !questionsError && result && result.data.length === 0 && (
          <EmptyState message="Try a different filter." />
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
