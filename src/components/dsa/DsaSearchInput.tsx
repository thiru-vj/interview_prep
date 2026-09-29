import { useState } from 'react'
import { Search } from 'lucide-react'

interface DsaSearchInputProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Keeps its own text state instead of rendering `value` directly: the URL (and so
 * `value`) updates in a transition, and a controlled input bound to it would drop
 * keystrokes typed while a heavy re-render is still pending.
 */
export function DsaSearchInput({ value, onChange }: DsaSearchInputProps) {
  const [text, setText] = useState(value)
  const [lastValue, setLastValue] = useState(value)

  // Follow external changes (e.g. "Clear filters" navigating to /dsa).
  if (value !== lastValue) {
    setLastValue(value)
    if (value !== text) setText(value)
  }

  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor="dsa-search" className="sr-only">
        Search DSA problems
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id="dsa-search"
        type="search"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          onChange(event.target.value)
        }}
        placeholder="Search problems or tags..."
        className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </div>
  )
}
