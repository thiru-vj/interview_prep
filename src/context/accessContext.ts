import { createContext } from 'react'

export type AccessRole = 'user' | 'admin'

export interface AccessContextValue {
  role: AccessRole
  /** True while a key remembered from a previous visit is being re-verified. */
  restoring: boolean
  /** Verifies the key and switches to admin if it matches. Resolves to whether it matched. */
  unlockAdmin: (key: string) => Promise<boolean>
  switchToUser: () => void
}

export const AccessContext = createContext<AccessContextValue | null>(null)
