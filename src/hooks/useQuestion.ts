import { getQuestionBySlug } from '@/services/questionService'
import { useAsync } from './useAsync'

export function useQuestion(slug: string | undefined) {
  return useAsync(() => {
    if (!slug) return Promise.resolve(null)
    return getQuestionBySlug(slug)
  }, [slug])
}
