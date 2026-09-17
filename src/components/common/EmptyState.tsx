import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ title = 'No questions found', message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      <SearchX className="h-6 w-6 text-slate-400" aria-hidden="true" />
      <p className="font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {message && <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
