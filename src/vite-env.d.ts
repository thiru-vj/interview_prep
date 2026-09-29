/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** SHA-256 (hex) of the admin access key — see README "Admin access". Optional: admin unlock is disabled without it. */
  readonly VITE_DSA_ADMIN_KEY_HASH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
