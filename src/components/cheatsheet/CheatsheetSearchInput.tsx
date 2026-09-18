import { Search } from 'lucide-react'

interface CheatsheetSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function CheatsheetSearchInput({ value, onChange }: CheatsheetSearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor="cheatsheet-search" className="sr-only">
        Search this cheatsheet
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id="cheatsheet-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search this cheatsheet..."
        className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </div>
  )
}
