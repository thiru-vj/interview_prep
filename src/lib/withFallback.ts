import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { isOffline, markOffline } from '@/lib/offline'

/**
 * Runs a live Supabase query, serving demo data instead when the backend is
 * missing, unreachable, or the query fails — so a backend outage never crashes a page.
 */
export async function withFallback<T>(
  live: (db: SupabaseClient) => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (!supabase) {
    markOffline()
    return fallback()
  }
  if (isOffline()) return fallback()

  try {
    return await live(supabase)
  } catch (error) {
    console.warn('Supabase request failed — serving demo data instead.', error)
    return fallback()
  }
}
