import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { NotFoundState } from '@/components/common/NotFoundState'
import { QuestionDetail } from '@/components/question/QuestionDetail'
import { QuestionNavigation } from '@/components/question/QuestionNavigation'
import { RelatedQuestions } from '@/components/question/RelatedQuestions'
import { useQuestion } from '@/hooks/useQuestion'
import { useAdjacentQuestions } from '@/hooks/useAdjacentQuestions'
import { useProgress } from '@/hooks/useProgress'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useLearningMode } from '@/hooks/useLearningMode'
import { itemKey, recordVisit, setStatus, toggleBookmark } from '@/lib/progress'
import { questionRef } from '@/utils/study'

interface LocationState {
  returnTo?: string
}

export function Question() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: question, loading, error } = useQuestion(slug)
  const progress = useProgress()
  const { enabled: learningMode } = useLearningMode()
  // Which question's answer has been revealed — moving to another question hides it again.
  const [revealedSlug, setRevealedSlug] = useState<string | null>(null)

  const returnTo = (location.state as LocationState | null)?.returnTo

  const context = useMemo(() => {
    if (!question) return null
    if (returnTo?.includes('/topics/')) {
      return { type: 'topic' as const, id: question.topic.id }
    }
    return { type: 'language' as const, id: question.language.id }
  }, [question, returnTo])

  const { data: adjacent } = useAdjacentQuestions(context, question?.id)

  // Only record once the loaded question matches the URL (useAsync keeps stale data while loading).
  const current = question && question.slug === slug ? question : null
  useEffect(() => {
    if (current) recordVisit(questionRef(current))
  }, [current])

  const revealed = !learningMode || revealedSlug === slug
  const status = current ? progress.statuses[itemKey('question', current.slug)]?.status : undefined
  const navState = returnTo ? { returnTo } : undefined

  useHotkeys(
    {
      ArrowLeft: () => adjacent?.previous && navigate(`/questions/${adjacent.previous.slug}`, { state: navState }),
      ArrowRight: () => adjacent?.next && navigate(`/questions/${adjacent.next.slug}`, { state: navState }),
      ' ': () => setRevealedSlug(slug ?? null),
      l: () => current && setStatus(questionRef(current), status === 'learned' ? null : 'learned'),
      r: () => current && setStatus(questionRef(current), status === 'review' ? null : 'review'),
      b: () => current && toggleBookmark(questionRef(current)),
    },
    Boolean(current),
  )

  if (loading && !current) return <LoadingState label="Loading question..." />
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

      <QuestionDetail question={question} revealed={revealed} onReveal={() => setRevealedSlug(question.slug)} />

      {adjacent && (
        <QuestionNavigation
          previous={adjacent.previous}
          next={adjacent.next}
          position={adjacent.position}
          total={adjacent.total}
          state={navState}
        />
      )}

      <RelatedQuestions question={question} state={navState} />

      <p className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">
        Shortcuts: <kbd className="font-mono">Space</kbd> reveal · <kbd className="font-mono">←</kbd>/
        <kbd className="font-mono">→</kbd> previous/next · <kbd className="font-mono">L</kbd> learned ·{' '}
        <kbd className="font-mono">R</kbd> review · <kbd className="font-mono">B</kbd> bookmark ·{' '}
        <kbd className="font-mono">?</kbd> all shortcuts
      </p>
    </div>
  )
}
