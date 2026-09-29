import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { markOffline } from '@/lib/offline'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Requests slower than this are treated as "server unreachable" so the UI falls back to demo data. */
const REQUEST_TIMEOUT_MS = 8000

/**
 * fetch wrapper that aborts slow requests and flags the backend as offline on
 * network failures, timeouts, or 5xx responses (e.g. a paused project).
 */
const resilientFetch: typeof fetch = async (input, init) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  init?.signal?.addEventListener('abort', () => controller.abort())

  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    if (response.status >= 500) markOffline()
    return response
  } catch (error) {
    markOffline()
    throw error
  } finally {
    clearTimeout(timer)
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables — showing demo data. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

// Public anon client only — this key is safe to expose in frontend code
// because Row Level Security restricts it to read-only SELECT access.
// Null when env vars are missing; services then serve demo data instead of crashing.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, { global: { fetch: resilientFetch } })
    : null
