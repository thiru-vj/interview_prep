import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Braces, ChevronRight, Compass, FileText, Search } from 'lucide-react'
import { StatusScreen } from './StatusScreen'

interface NotFoundStateProps {
  title?: string
  message?: string
}

const SUGGESTIONS = [
  { to: '/languages', label: 'Languages', description: 'Questions by technology', icon: BookOpen },
  { to: '/dsa', label: 'DSA', description: 'Problems and solutions', icon: Braces },
  { to: '/cheatsheets', label: 'Cheatsheets', description: 'Quick reference notes', icon: FileText },
  { to: '/search', label: 'Search', description: 'Find any question', icon: Search },
]

export function NotFoundState({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or may have been moved.",
}: NotFoundStateProps) {
  const { pathname } = useLocation()

  return (
    <StatusScreen
      code="404"
      icon={Compass}
      title={title}
      message={
        <>
          <p>{message}</p>
          <p className="mt-3">
            <code className="break-all rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {pathname}
            </code>
          </p>
        </>
      }
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Try one of these instead
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map(({ to, label, description, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5"
            >
              <Icon
                className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                aria-hidden="true"
              />
              <span className="flex-1">
                <span className="block font-medium text-slate-900 dark:text-white">{label}</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">{description}</span>
              </span>
              <ChevronRight
                className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </StatusScreen>
  )
}
