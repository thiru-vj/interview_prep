import { Link } from 'react-router-dom'
import type { TopicWithCount } from '@/types/database'

interface TopicCardProps {
  languageSlug: string
  topic: TopicWithCount
  active?: boolean
}

export function TopicCard({ languageSlug, topic, active = false }: TopicCardProps) {
  return (
    <Link
      to={`/languages/${languageSlug}/topics/${topic.slug}`}
      className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
        active
          ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-500/5'
      }`}
    >
      <span className="font-medium">{topic.name}</span>
      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{topic.question_count} Questions</span>
    </Link>
  )
}
