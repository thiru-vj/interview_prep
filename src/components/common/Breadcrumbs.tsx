import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: Crumb[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <li className="flex items-center gap-1.5">
          <Link to="/" className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white" aria-label="Home">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-slate-900 dark:hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium text-slate-900 dark:text-white' : ''}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
