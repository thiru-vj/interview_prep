import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

// Public anon client only — this key is safe to expose in frontend code
// because Row Level Security restricts it to read-only SELECT access.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
