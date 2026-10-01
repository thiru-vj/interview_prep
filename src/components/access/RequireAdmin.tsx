import { Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAccess } from '@/hooks/useAccess'
import { LoadingState } from '@/components/common/LoadingState'
import { Unauthorized } from '@/pages/Unauthorized'

/**
 * Route guard for admin-only pages. Use as a layout route (`<Route element={<RequireAdmin />}>`)
 * or wrap an element directly. Non-admins see the 403 screen at the same URL.
 */
export function RequireAdmin({ children }: { children?: ReactNode }) {
  const { role, restoring } = useAccess()

  if (restoring) return <LoadingState label="Checking access..." />
  if (role !== 'admin') return <Unauthorized />
  return children ?? <Outlet />
}
