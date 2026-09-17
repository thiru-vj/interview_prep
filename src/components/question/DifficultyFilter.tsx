import type { Difficulty } from '@/types/database'

interface DifficultyFilterProps {
  value: Difficulty | null
  onChange: (value: Difficulty | null) => void
}

const OPTIONS: { label: string; value: Difficulty | null }[] = [
  { label: 'All', value: null },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
]

export function DifficultyFilter({ value, onChange }: DifficultyFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by difficulty"
      className="inline-flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
