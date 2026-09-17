import { getAdjacentQuestions } from '@/services/questionService'
import { useAsync } from './useAsync'

/**
 * Computes previous/next navigation for a question within its current browsing
 * context — either "all questions in this language" or "questions in this topic".
 */
export function useAdjacentQuestions(
  context: { type: 'language' | 'topic'; id: string } | null,
  currentQuestionId: string | undefined,
) {
  return useAsync(() => {
    if (!context || !currentQuestionId) {
      return Promise.resolve({ previous: null, next: null, position: 0, total: 0 })
    }
    return getAdjacentQuestions(context, currentQuestionId)
  }, [context?.type, context?.id, currentQuestionId])
}
