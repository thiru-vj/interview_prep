import { Star } from 'lucide-react'

interface FaqToggleProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function FaqToggle({ value, onChange }: FaqToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        value
          ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
          : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white'
      }`}
    >
      <Star className={`h-3.5 w-3.5 ${value ? 'fill-current' : ''}`} aria-hidden="true" />
      Frequently Asked
    </button>
  )
}
