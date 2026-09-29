import type { DsaTopic } from '@/types/database'

interface DsaTopicFilterProps {
  topics: DsaTopic[]
  counts: Map<string, number>
  total: number
  value: string | null
  onChange: (value: string | null) => void
}

function chipClass(isActive: boolean) {
  return `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
  }`
}

export function DsaTopicFilter({ topics, counts, total, value, onChange }: DsaTopicFilterProps) {
  return (
    <div role="tablist" aria-label="Filter by topic" className="flex flex-wrap gap-2">
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={chipClass(value === null)}
      >
        All <span className="opacity-70">{total}</span>
      </button>
      {topics.map((topic) => {
        const isActive = topic.slug === value
        return (
          <button
            key={topic.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(topic.slug)}
            className={chipClass(isActive)}
          >
            {topic.name} <span className="opacity-70">{counts.get(topic.id) ?? 0}</span>
          </button>
        )
      })}
    </div>
  )
}
