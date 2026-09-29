/**
 * Admin access check for the DSA page's multi-language view.
 *
 * Only a SHA-256 hash of the key is shipped (VITE_DSA_ADMIN_KEY_HASH), so the
 * key itself never appears in the bundle. This is a UI gate, not a security
 * boundary: all solutions are publicly readable through the anon Supabase key,
 * and admin mode only changes how many languages are shown at once.
 */
const ADMIN_KEY_HASH = (import.meta.env.VITE_DSA_ADMIN_KEY_HASH ?? '').trim().toLowerCase()

/**
 * `missing`: no value set. `not-a-hash`: something is set but it isn't a SHA-256 hex digest —
 * almost always the plain key pasted in by mistake (generate the hash with
 * `npm run access:hash-key -- "your-key"`).
 */
export const adminKeyStatus: 'ok' | 'missing' | 'not-a-hash' = !ADMIN_KEY_HASH
  ? 'missing'
  : /^[0-9a-f]{64}$/.test(ADMIN_KEY_HASH)
    ? 'ok'
    : 'not-a-hash'

export const isAdminKeyConfigured = adminKeyStatus === 'ok'

async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Key verification needs a secure context (https or localhost).')
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function verifyAdminKey(key: string): Promise<boolean> {
  if (!isAdminKeyConfigured || !key) return false
  return (await sha256Hex(key.trim())) === ADMIN_KEY_HASH
}
