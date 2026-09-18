export type CheatsheetMode = 'normal' | 'explanation'

interface CheatsheetModeToggleProps {
  value: CheatsheetMode
  onChange: (value: CheatsheetMode) => void
}

const OPTIONS: { label: string; value: CheatsheetMode }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Explanation', value: 'explanation' },
]

export function CheatsheetModeToggle({ value, onChange }: CheatsheetModeToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Cheatsheet display mode"
      className="inline-flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
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
