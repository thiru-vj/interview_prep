import { Link } from 'react-router-dom'
import type { Question } from '@/types/database'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { StatusIcon } from '@/components/study/StatusIcon'
import { useAsync } from '@/hooks/useAsync'
import { getRelatedQuestions } from '@/services/studyService'

interface RelatedQuestionsProps {
  question: Pick<Question, 'id' | 'topic_id' | 'tags'>
  /** Carried to the related question so its Back link / Prev-Next keep the browsing context. */
  state?: unknown
}

export function RelatedQuestions({ question, state }: RelatedQuestionsProps) {
  const { data } = useAsync(() => getRelatedQuestions(question), [question.id])
  if (!data || data.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="flex flex-col gap-3">
      <h2
        id="related-heading"
        className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
      >
        Related questions
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {data.map((related) => (
          <li key={related.slug}>
            <Link
              to={`/questions/${related.slug}`}
              state={state}
              className="flex h-full items-start justify-between gap-3 rounded-md border border-slate-200 px-4 py-3 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-500/5"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">{related.question}</span>
              <span className="flex shrink-0 items-center gap-2">
                <StatusIcon kind="question" slug={related.slug} />
                <DifficultyBadge difficulty={related.difficulty} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
