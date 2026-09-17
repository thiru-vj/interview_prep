import { getLanguages } from '@/services/languageService'
import { useAsync } from './useAsync'

export function useLanguages() {
  return useAsync(() => getLanguages(), [])
}
