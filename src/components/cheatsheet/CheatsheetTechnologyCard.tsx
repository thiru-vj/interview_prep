import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { CheatsheetTechnologyWithCount } from '@/types/database'
import { getCheatsheetIcon } from '@/utils/icons'

interface CheatsheetTechnologyCardProps {
  technology: CheatsheetTechnologyWithCount
}

export function CheatsheetTechnologyCard({ technology }: CheatsheetTechnologyCardProps) {
  const Icon = getCheatsheetIcon(technology.icon)

  return (
    <Link
      to={`/cheatsheets/${technology.slug}`}
      className="group flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {/* Icon is picked from a static lookup table, not created fresh each render. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <ArrowRight
          className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600"
          aria-hidden="true"
        />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{technology.name}</h3>
        {technology.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{technology.description}</p>
        )}
      </div>
      <p className="mt-auto text-sm font-medium text-blue-600 dark:text-blue-400">
        {technology.item_count} {technology.item_count === 1 ? 'Entry' : 'Entries'}
      </p>
    </Link>
  )
}
