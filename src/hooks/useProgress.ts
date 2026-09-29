import { useSyncExternalStore } from 'react'
import { getProgress, itemKey, subscribeProgress, type ItemKind, type ProgressState } from '@/lib/progress'

/** The learner's whole progress state; re-renders when anything in it changes. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribeProgress, getProgress, getProgress)
}

/** Status + bookmark for one item. */
export function useItemProgress(kind: ItemKind, slug: string) {
  const progress = useProgress()
  const key = itemKey(kind, slug)
  return {
    status: progress.statuses[key]?.status ?? null,
    bookmarked: Boolean(progress.bookmarks[key]),
  }
}
