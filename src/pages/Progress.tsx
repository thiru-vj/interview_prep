import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, CheckCircle2, Download, Flame, RotateCcw, Trash2, Upload } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { RevealToggle } from '@/components/study/RevealToggle'
import { useProgress } from '@/hooks/useProgress'
import {
  countByStatus,
  exportProgress,
  getDueReviews,
  getStreak,
  importProgress,
  resetProgress,
  toggleBookmark,
  type ItemRef,
} from '@/lib/progress'

function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {icon}
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

function KindTag({ kind }: { kind: ItemRef['kind'] }) {
  return (
    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {kind === 'dsa' ? 'DSA' : 'Q&A'}
    </span>
  )
}

function ItemList({
  title,
  items,
  empty,
  action,
}: {
  title: string
  items: ItemRef[]
  empty: string
  action?: (item: ItemRef) => ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title} <span className="text-sm font-normal text-slate-400">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {empty}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {items.map((item) => (
            <li key={`${item.kind}:${item.slug}`} className="flex items-center gap-3 px-4 py-2.5">
              <KindTag kind={item.kind} />
              <Link
                to={item.href}
                className="min-w-0 flex-1 truncate text-sm text-slate-800 hover:text-blue-600 hover:underline dark:text-slate-200 dark:hover:text-blue-400"
              >
                {item.title}
              </Link>
              {action?.(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function Progress() {
  const progress = useProgress()
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const learned = countByStatus(progress, 'learned')
  const solved = countByStatus(progress, 'solved')
  const due = getDueReviews(progress)
  const streak = getStreak(progress)
  const bookmarks = Object.values(progress.bookmarks).sort((a, b) => b.addedAt - a.addedAt)
  const review = Object.values(progress.statuses)
    .filter((entry) => entry.status === 'review')
    .sort((a, b) => b.updatedAt - a.updatedAt)

  function handleExport() {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interview-prep-progress-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'ok', text: 'Progress exported. Keep the file somewhere safe.' })
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!window.confirm('Importing replaces all progress in this browser with the file’s contents. Continue?')) return
    try {
      importProgress(await file.text())
      setMessage({ tone: 'ok', text: 'Progress imported.' })
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Import failed.' })
    }
  }

  function handleReset() {
    if (!window.confirm('Delete all progress, bookmarks and review history in this browser? This cannot be undone.'))
      return
    resetProgress()
    setMessage({ tone: 'ok', text: 'Progress cleared.' })
  }

  return (
    <div className="flex flex-col gap-8">
      <Seo title="My Progress | Interview Preparation" canonicalPath="/progress" />
      <Breadcrumbs items={[{ label: 'My Progress' }]} />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Progress</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Saved in this browser only — export it to back it up or move it to another device.
          </p>
        </div>
        <RevealToggle />
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Questions learned" value={learned} icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />} />
        <Stat label="DSA problems solved" value={solved} icon={<CheckCircle2 className="h-6 w-6 text-blue-500" />} />
        <Stat label="Due for review" value={due.length} icon={<RotateCcw className="h-6 w-6 text-amber-500" />} />
        <Stat label="Day streak" value={streak} icon={<Flame className="h-6 w-6 text-orange-500" />} />
      </div>

      {due.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/60 dark:bg-amber-500/10">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {due.length} card{due.length === 1 ? ' is' : 's are'} due for review.
          </p>
          <Link
            to="/study?mode=review"
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            Start review
          </Link>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <ItemList
          title="Saved"
          items={bookmarks}
          empty="Bookmark questions and problems to build your own list."
          action={(item) => (
            <button
              type="button"
              onClick={() => toggleBookmark(item)}
              className="text-slate-400 hover:text-rose-600"
              aria-label={`Remove ${item.title} from saved`}
              title="Remove"
            >
              <Bookmark className="h-4 w-4 fill-current" aria-hidden="true" />
            </button>
          )}
        />
        <ItemList title="Needs review" items={review} empty="Nothing marked for review." />
      </div>

      <ItemList title="Recently viewed" items={progress.recent} empty="Questions and problems you open show up here." />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Backup</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export progress
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import progress
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
        {message && (
          <p
            role="status"
            className={`text-sm ${message.tone === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}
          >
            {message.text}
          </p>
        )}
      </section>
    </div>
  )
}
