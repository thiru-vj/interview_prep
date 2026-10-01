import { Seo } from '@/components/common/Seo'
import { UnauthorizedState } from '@/components/common/UnauthorizedState'

export function Unauthorized() {
  return (
    <>
      <Seo title="Access Denied | Interview Preparation" />
      <UnauthorizedState />
    </>
  )
}
