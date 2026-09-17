import { getTopicBySlug } from '@/services/topicService'
import { useAsync } from './useAsync'

export function useTopic(languageId: string | undefined, slug: string | undefined) {
  return useAsync(() => {
    if (!languageId || !slug) return Promise.resolve(null)
    return getTopicBySlug(languageId, slug)
  }, [languageId, slug])
}
