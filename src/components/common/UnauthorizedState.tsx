import { ShieldAlert } from 'lucide-react'
import { AccessRoleCard } from '@/components/access/AccessRoleCard'
import { StatusScreen } from './StatusScreen'

interface UnauthorizedStateProps {
  title?: string
  message?: string
}

/**
 * Shown in place of admin-only content. The unlock form is inline, so entering a valid
 * key re-renders the guarded route straight away without leaving the page.
 */
export function UnauthorizedState({
  title = 'Admin access required',
  message = "You don't have permission to view this page. Unlock admin access with your key to continue.",
}: UnauthorizedStateProps) {
  return (
    <StatusScreen code="403" icon={ShieldAlert} tone="amber" title={title} message={<p>{message}</p>}>
      <AccessRoleCard initialChoice="admin" />
    </StatusScreen>
  )
}
