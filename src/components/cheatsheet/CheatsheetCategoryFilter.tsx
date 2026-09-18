import type { CheatsheetCategory } from '@/types/database'

interface CheatsheetCategoryFilterProps {
  categories: CheatsheetCategory[]
  value: string | null
  onChange: (value: string | null) => void
}

export function CheatsheetCategoryFilter({ categories, value, onChange }: CheatsheetCategoryFilterProps) {
  return (
    <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-2">
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          value === null
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const isActive = category.slug === value
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(category.slug)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
