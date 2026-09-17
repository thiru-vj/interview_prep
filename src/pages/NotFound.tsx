import { Seo } from '@/components/common/Seo'
import { NotFoundState } from '@/components/common/NotFoundState'

export function NotFound() {
  return (
    <>
      <Seo title="Page Not Found | Interview Preparation" />
      <NotFoundState />
    </>
  )
}
