import { getTopicsByLanguage } from '@/services/topicService'
import { useAsync } from './useAsync'

export function useTopics(languageId: string | undefined) {
  return useAsync(() => {
    if (!languageId) return Promise.resolve([])
    return getTopicsByLanguage(languageId)
  }, [languageId])
}
