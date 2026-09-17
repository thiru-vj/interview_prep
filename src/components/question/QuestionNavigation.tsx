import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { QuestionNavItem } from '@/services/questionService'

interface QuestionNavigationProps {
  previous: QuestionNavItem | null
  next: QuestionNavItem | null
  position: number
  total: number
}

export function QuestionNavigation({ previous, next, position, total }: QuestionNavigationProps) {
  if (total === 0) return null

  return (
    <nav
      aria-label="Question navigation"
      className="flex items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-800"
    >
      {previous ? (
        <Link
          to={`/questions/${previous.slug}`}
          className="flex min-w-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Previous Question</span>
          <span className="sm:hidden">Previous</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
        {position} of {total}
      </span>

      {next ? (
        <Link
          to={`/questions/${next.slug}`}
          className="flex min-w-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span className="hidden sm:inline">Next Question</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  )
}
