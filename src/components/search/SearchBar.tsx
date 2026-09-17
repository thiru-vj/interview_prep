import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

interface SearchBarProps {
  compact?: boolean
  onNavigate?: () => void
}

export function SearchBar({ compact = false, onNavigate }: SearchBarProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}&page=1`)
    onNavigate?.()
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <label htmlFor="site-search" className="sr-only">
        Search questions
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search questions..."
        className={`w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
          compact ? '' : 'py-3 text-base'
        }`}
      />
    </form>
  )
}
