/**
 * Tracks whether the Supabase backend is unreachable. Once flagged, every
 * service serves demo data for the rest of the session (until reload), so the
 * site never mixes live rows with mock rows or waits on repeated timeouts.
 */
let offline = false
const listeners = new Set<() => void>()

export function isOffline(): boolean {
  return offline
}

export function markOffline(): void {
  if (offline) return
  offline = true
  listeners.forEach((listener) => listener())
}

export function subscribeOffline(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
