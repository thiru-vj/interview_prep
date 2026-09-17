import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { NotFoundState } from '@/components/common/NotFoundState'
import { QuestionDetail } from '@/components/question/QuestionDetail'
import { QuestionNavigation } from '@/components/question/QuestionNavigation'
import { useQuestion } from '@/hooks/useQuestion'
import { useAdjacentQuestions } from '@/hooks/useAdjacentQuestions'

interface LocationState {
  returnTo?: string
}

export function Question() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const { data: question, loading, error } = useQuestion(slug)

  const returnTo = (location.state as LocationState | null)?.returnTo

  const context = useMemo(() => {
    if (!question) return null
    if (returnTo?.includes('/topics/')) {
      return { type: 'topic' as const, id: question.topic.id }
    }
    return { type: 'language' as const, id: question.language.id }
  }, [question, returnTo])

  const { data: adjacent } = useAdjacentQuestions(context, question?.id)

  if (loading) return <LoadingState label="Loading question..." />
  if (error) return <ErrorState message="Unable to load this question. Please try again." />
  if (!question) return <NotFoundState title="Question not found" message="We couldn't find that question." />

  const backHref = returnTo ?? `/languages/${question.language.slug}`

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title={`${question.question} | ${question.language.name} Interview Questions`}
        description={question.answer.slice(0, 155)}
        canonicalPath={`/questions/${question.slug}`}
      />
      <div className="flex items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Languages', to: '/languages' },
            { label: question.language.name, to: `/languages/${question.language.slug}` },
            { label: question.topic.name, to: `/languages/${question.language.slug}/topics/${question.topic.slug}` },
            { label: question.question },
          ]}
        />
      </div>

      <Link
        to={backHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to questions
      </Link>

      <QuestionDetail question={question} />

      {adjacent && (
        <QuestionNavigation
          previous={adjacent.previous}
          next={adjacent.next}
          position={adjacent.position}
          total={adjacent.total}
        />
      )}
    </div>
  )
}
