import { getCheatsheetTechnologies, getCheatsheetTechnologyData } from '@/services/cheatsheetService'
import { useAsync } from './useAsync'

export function useCheatsheetTechnologies() {
  return useAsync(() => getCheatsheetTechnologies(), [])
}

export function useCheatsheetTechnology(slug: string | undefined) {
  return useAsync(() => {
    if (!slug) return Promise.resolve(null)
    return getCheatsheetTechnologyData(slug)
  }, [slug])
}
