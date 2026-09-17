import { searchQuestions } from '@/services/questionService'
import { PAGE_SIZE } from '@/utils/pagination'
import { useAsync } from './useAsync'

export function useSearchQuestions(query: string, page: number, pageSize: number = PAGE_SIZE) {
  return useAsync(() => {
    if (!query.trim()) return Promise.resolve({ data: [], total: 0, page, pageSize, totalPages: 1 })
    return searchQuestions(query, page, pageSize)
  }, [query, page, pageSize])
}
