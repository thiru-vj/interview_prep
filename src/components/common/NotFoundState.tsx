import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

interface NotFoundStateProps {
  title?: string
  message?: string
}

export function NotFoundState({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or may have been moved.",
}: NotFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-6xl font-bold text-slate-200 dark:text-slate-800">404</p>
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        Back to Home
      </Link>
    </div>
  )
}
