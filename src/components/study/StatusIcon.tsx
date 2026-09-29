import { Bookmark, CheckCircle2, RotateCcw } from 'lucide-react'
import type { ItemKind } from '@/lib/progress'
import { useItemProgress } from '@/hooks/useProgress'

/** Compact status markers for list cards: learned/solved, needs review, bookmarked. */
export function StatusIcon({ kind, slug }: { kind: ItemKind; slug: string }) {
  const { status, bookmarked } = useItemProgress(kind, slug)
  if (!status && !bookmarked) return null

  return (
    <span className="flex shrink-0 items-center gap-1">
      {(status === 'learned' || status === 'solved') && (
        <CheckCircle2
          className="h-4 w-4 text-emerald-500"
          aria-label={status === 'solved' ? 'Solved' : 'Learned'}
          role="img"
        />
      )}
      {status === 'review' && <RotateCcw className="h-4 w-4 text-amber-500" aria-label="Needs review" role="img" />}
      {bookmarked && <Bookmark className="h-4 w-4 fill-blue-500 text-blue-500" aria-label="Bookmarked" role="img" />}
    </span>
  )
}
