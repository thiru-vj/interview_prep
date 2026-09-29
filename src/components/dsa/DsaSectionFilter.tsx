import { Check } from 'lucide-react'
import { DEFAULT_DSA_SECTIONS, DSA_SECTIONS, type DsaSection } from '@/utils/dsa'

interface DsaSectionFilterProps {
  value: DsaSection[]
  /** Receives an updater, so toggles always apply to the latest selection. */
  onChange: (update: (current: DsaSection[]) => DsaSection[]) => void
  /** What "Reset" goes back to — differs by role. */
  defaults?: DsaSection[]
}

const ORDER = DSA_SECTIONS.map((option) => option.value)

export function DsaSectionFilter({ value, onChange, defaults = DEFAULT_DSA_SECTIONS }: DsaSectionFilterProps) {
  const selected = new Set(value)

  function toggle(section: DsaSection) {
    onChange((current) => {
      const next = new Set(current)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      // Keep a stable order so the URL doesn't depend on click order.
      return ORDER.filter((option) => next.has(option))
    })
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">Show</legend>
        <button
          type="button"
          onClick={() => onChange(() => ORDER)}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onChange(() => defaults)}
          className="text-xs font-medium text-slate-500 hover:underline dark:text-slate-400"
        >
          Reset
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {DSA_SECTIONS.map((option) => {
          const isActive = selected.has(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggle(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {isActive && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
