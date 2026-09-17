import type { TopicWithCount } from '@/types/database'
import { TopicCard } from './TopicCard'

interface TopicListProps {
  languageSlug: string
  topics: TopicWithCount[]
  activeTopicSlug?: string
}

export function TopicList({ languageSlug, topics, activeTopicSlug }: TopicListProps) {
  if (topics.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <TopicCard key={topic.id} languageSlug={languageSlug} topic={topic} active={topic.slug === activeTopicSlug} />
      ))}
    </div>
  )
}
