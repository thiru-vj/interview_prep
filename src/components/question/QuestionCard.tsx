import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { QuestionWithContext } from '@/types/database'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'

interface QuestionCardProps {
  question: QuestionWithContext
  index: number
  /** Where to navigate back to when the user returns from the detail page (preserves page/filter state). */
  returnTo?: string
}

export function QuestionCard({ question, index, returnTo }: QuestionCardProps) {
  return (
    <Link
      to={`/questions/${question.slug}`}
      state={returnTo ? { returnTo } : undefined}
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-blue-500/5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">#{index}</span>
        <p className="font-medium text-slate-900 dark:text-white">{question.question}</p>
        {question.is_frequently_asked && (
          <Star
            className="mt-0.5 h-4 w-4 shrink-0 fill-purple-500 text-purple-500"
            aria-label="Frequently asked question"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-7">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {question.topic.name}
        </span>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
    </Link>
  )
}
