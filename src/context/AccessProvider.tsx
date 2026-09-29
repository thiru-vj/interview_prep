import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { verifyAdminKey } from '@/lib/access'
import { AccessContext, type AccessContextValue, type AccessRole } from './accessContext'

const STORAGE_KEY = 'interview-prep-admin-key'

function readStoredKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredKey(key: string | null) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage unavailable — admin access just won't survive a reload
  }
}

/**
 * Holds the viewer's role. The entered key (not a boolean flag) is remembered,
 * and re-verified against the configured hash on every load — so rotating the
 * key in the environment revokes previously unlocked browsers.
 */
export function AccessProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AccessRole>('user')
  const [restoring, setRestoring] = useState(() => readStoredKey() !== null)

  useEffect(() => {
    const stored = readStoredKey()
    if (!stored) return
    let cancelled = false
    verifyAdminKey(stored)
      .catch(() => false)
      .then((valid) => {
        if (cancelled) return
        if (valid) setRole('admin')
        else writeStoredKey(null)
        setRestoring(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const unlockAdmin = useCallback(async (key: string) => {
    const valid = await verifyAdminKey(key)
    if (valid) {
      writeStoredKey(key.trim())
      setRole('admin')
    }
    return valid
  }, [])

  const switchToUser = useCallback(() => {
    writeStoredKey(null)
    setRole('user')
  }, [])

  const value = useMemo<AccessContextValue>(
    () => ({ role, restoring, unlockAdmin, switchToUser }),
    [role, restoring, unlockAdmin, switchToUser],
  )

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}
