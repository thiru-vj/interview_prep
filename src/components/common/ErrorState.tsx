import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/50 dark:bg-red-950/30"
    >
      <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden="true" />
      <div>
        <p className="font-medium text-red-700 dark:text-red-400">{title}</p>
        <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          Try again
        </button>
      )}
    </div>
  )
}
