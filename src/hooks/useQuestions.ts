import { getQuestionsByLanguage, getQuestionsByTopic, type QuestionFilters } from '@/services/questionService'
import { PAGE_SIZE } from '@/utils/pagination'
import { useAsync } from './useAsync'

/** Paginated + filtered questions for a whole language listing page. */
export function useQuestionsByLanguage(
  languageId: string | undefined,
  page: number,
  filters: QuestionFilters,
  pageSize: number = PAGE_SIZE,
) {
  return useAsync(() => {
    if (!languageId) return Promise.resolve({ data: [], total: 0, page, pageSize, totalPages: 1 })
    return getQuestionsByLanguage(languageId, page, pageSize, filters)
  }, [languageId, page, pageSize, filters.difficulty])
}

/** Paginated + filtered questions for a single topic listing page. */
export function useQuestionsByTopic(
  topicId: string | undefined,
  page: number,
  filters: QuestionFilters,
  pageSize: number = PAGE_SIZE,
) {
  return useAsync(() => {
    if (!topicId) return Promise.resolve({ data: [], total: 0, page, pageSize, totalPages: 1 })
    return getQuestionsByTopic(topicId, page, pageSize, filters)
  }, [topicId, page, pageSize, filters.difficulty])
}
