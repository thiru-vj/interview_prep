import { useState, type FormEvent } from 'react'
import { KeyRound, ShieldCheck, User } from 'lucide-react'
import { useAccess } from '@/hooks/useAccess'
import { adminKeyStatus, isAdminKeyConfigured } from '@/lib/access'
import type { AccessRole } from '@/context/accessContext'

const ROLES: { value: AccessRole; label: string; description: string; icon: typeof User }[] = [
  { value: 'user', label: 'User', description: 'View DSA solutions in one language at a time.', icon: User },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Compare solutions in up to 3 languages. Requires a key.',
    icon: ShieldCheck,
  },
]

export function AccessRoleCard() {
  const { role, restoring, unlockAdmin, switchToUser } = useAccess()
  const [choice, setChoice] = useState<AccessRole>(role)
  const [key, setKey] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'invalid' | 'error'>('idle')

  // Follow the real role once a remembered key finishes re-verifying.
  const [lastRole, setLastRole] = useState(role)
  if (role !== lastRole) {
    setLastRole(role)
    setChoice(role)
  }

  function selectRole(next: AccessRole) {
    setChoice(next)
    setStatus('idle')
    if (next === 'user' && role === 'admin') switchToUser()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!key.trim()) return
    setStatus('checking')
    try {
      const valid = await unlockAdmin(key)
      setStatus(valid ? 'idle' : 'invalid')
      if (valid) setKey('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 id="access-heading" className="text-xl font-semibold text-slate-900 dark:text-white">
          Access
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {restoring
            ? 'Checking saved access…'
            : role === 'admin'
              ? 'You have admin access — the DSA page can show solutions in up to 3 languages.'
              : 'Choose your role. Admin access unlocks multi-language DSA solutions.'}
        </p>
      </div>

      <div role="radiogroup" aria-labelledby="access-heading" className="grid gap-3 sm:grid-cols-2">
        {ROLES.map(({ value, label, description, icon: Icon }) => {
          const isActive = choice === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => selectRole(value)}
              disabled={restoring}
              className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors disabled:opacity-60 ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span>
                <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  {label}
                  {value === role && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Active
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{description}</span>
              </span>
            </button>
          )
        })}
      </div>

      {choice === 'admin' &&
        role !== 'admin' &&
        !restoring &&
        (isAdminKeyConfigured ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label htmlFor="admin-key" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Admin key
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="admin-key"
                  type="password"
                  autoComplete="off"
                  value={key}
                  onChange={(event) => {
                    setKey(event.target.value)
                    setStatus('idle')
                  }}
                  aria-invalid={status === 'invalid'}
                  aria-describedby="admin-key-status"
                  className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={!key.trim() || status === 'checking'}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'checking' ? 'Checking…' : 'Unlock'}
              </button>
            </div>
            <p id="admin-key-status" role="status" className="text-sm text-rose-600 dark:text-rose-400">
              {status === 'invalid' && 'That key is not valid.'}
              {status === 'error' && 'Could not verify the key here — open the site over https or localhost.'}
            </p>
          </form>
        ) : (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            {adminKeyStatus === 'not-a-hash' ? (
              <>
                <code>VITE_DSA_ADMIN_KEY_HASH</code> must be the SHA-256 hash of the key, not the key itself. Run{' '}
                <code>npm run access:hash-key -- &quot;your-key&quot;</code>, put the printed line in <code>.env</code>,
                and restart the dev server.
              </>
            ) : (
              <>
                Admin access isn&apos;t configured for this site. Set <code>VITE_DSA_ADMIN_KEY_HASH</code> in the
                environment (then restart the dev server) to enable it.
              </>
            )}
          </p>
        ))}
    </div>
  )
}
