import { getLanguageBySlug } from '@/services/languageService'
import { useAsync } from './useAsync'

export function useLanguage(slug: string | undefined) {
  return useAsync(() => {
    if (!slug) return Promise.resolve(null)
    return getLanguageBySlug(slug)
  }, [slug])
}
