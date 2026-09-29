import { Bookmark, CheckCircle2, RotateCcw } from 'lucide-react'
import { setStatus, toggleBookmark, type ItemRef, type ItemStatus } from '@/lib/progress'
import { useItemProgress } from '@/hooks/useProgress'

interface StudyActionsProps {
  item: ItemRef
  /** Show keyboard hints (L / R / B) — only where the page binds those keys. */
  showShortcuts?: boolean
  size?: 'sm' | 'md'
}

const BASE =
  'inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500'
const IDLE =
  'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="hidden rounded border border-current/30 px-1 font-mono text-[10px] opacity-60 sm:inline">
      {children}
    </kbd>
  )
}

/** Learned (or Solved) / Needs review / Bookmark toggles for a question or DSA problem. */
export function StudyActions({ item, showShortcuts = false, size = 'md' }: StudyActionsProps) {
  const { status, bookmarked } = useItemProgress(item.kind, item.slug)
  const doneStatus: ItemStatus = item.kind === 'dsa' ? 'solved' : 'learned'
  const doneLabel = item.kind === 'dsa' ? 'Solved' : 'Learned'
  const sizing = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Study progress">
      <button
        type="button"
        aria-pressed={status === doneStatus}
        onClick={() => setStatus(item, status === doneStatus ? null : doneStatus)}
        className={`${BASE} ${sizing} ${
          status === doneStatus
            ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
            : `${IDLE} hover:border-emerald-300 hover:text-emerald-700`
        }`}
      >
        <CheckCircle2 className={icon} aria-hidden="true" />
        {doneLabel}
        {showShortcuts && <Kbd>L</Kbd>}
      </button>
      <button
        type="button"
        aria-pressed={status === 'review'}
        onClick={() => setStatus(item, status === 'review' ? null : 'review')}
        className={`${BASE} ${sizing} ${
          status === 'review' ? 'border-amber-500 bg-amber-500 text-white hover:bg-amber-600' : IDLE
        }`}
      >
        <RotateCcw className={icon} aria-hidden="true" />
        Needs review
        {showShortcuts && <Kbd>R</Kbd>}
      </button>
      <button
        type="button"
        aria-pressed={bookmarked}
        onClick={() => toggleBookmark(item)}
        className={`${BASE} ${sizing} ${
          bookmarked ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' : IDLE
        }`}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Bookmark className={`${icon} ${bookmarked ? 'fill-current' : ''}`} aria-hidden="true" />
        <span className={size === 'sm' ? 'sr-only sm:not-sr-only' : ''}>{bookmarked ? 'Saved' : 'Save'}</span>
        {showShortcuts && <Kbd>B</Kbd>}
      </button>
    </div>
  )
}
