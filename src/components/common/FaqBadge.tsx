import { Star } from 'lucide-react'

interface FaqBadgeProps {
  className?: string
}

export function FaqBadge({ className = '' }: FaqBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20 ${className}`}
    >
      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
      Frequently Asked
    </span>
  )
}
