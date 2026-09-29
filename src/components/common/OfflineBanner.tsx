import { useSyncExternalStore } from 'react'
import { WifiOff } from 'lucide-react'
import { isOffline, subscribeOffline } from '@/lib/offline'

/** Shown once the backend is flagged unreachable, so visitors know they're viewing demo content. */
export function OfflineBanner() {
  const offline = useSyncExternalStore(subscribeOffline, isOffline)
  if (!offline) return null

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Can't reach the server right now — showing demo content. Refresh to try again.</span>
    </div>
  )
}
