import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'blue' | 'amber'

interface StatusScreenProps {
  code: string
  icon: LucideIcon
  title: string
  message: ReactNode
  tone?: Tone
  /** Extra content below the actions, e.g. suggested links or an unlock form. */
  children?: ReactNode
}

const TONES: Record<Tone, { badge: string; code: string }> = {
  blue: {
    badge: 'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
    code: 'from-blue-600 to-indigo-400 dark:from-blue-400 dark:to-indigo-300',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
    code: 'from-amber-500 to-rose-400 dark:from-amber-400 dark:to-rose-300',
  },
}

/** Full-page layout shared by the 404 and 403 screens. */
export function StatusScreen({ code, icon: Icon, title, message, tone = 'blue', children }: StatusScreenProps) {
  const navigate = useNavigate()
  const location = useLocation()
  // 'default' means this is the first entry in the session — there is nothing to go back to.
  const canGoBack = location.key !== 'default'
  const styles = TONES[tone]

  return (
    <section
      aria-labelledby="status-title"
      className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center sm:py-20"
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-8 ${styles.badge}`}>
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>

      <p
        className={`mt-6 bg-gradient-to-br bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl ${styles.code}`}
        aria-hidden="true"
      >
        {code}
      </p>

      <h1 id="status-title" className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
        <span className="sr-only">Error {code}: </span>
        {title}
      </h1>
      <div className="mt-3 max-w-md text-slate-500 dark:text-slate-400">{message}</div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
        {canGoBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go back
          </button>
        )}
      </div>

      {children && <div className="mt-12 w-full text-left">{children}</div>}
    </section>
  )
}
