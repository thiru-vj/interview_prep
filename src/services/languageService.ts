import { withFallback } from '@/lib/withFallback'
import { mockQueries } from './mockQueries'
import type { LanguageWithCount, Language } from '@/types/database'

/**
 * All languages ordered for display, each annotated with its live question count.
 * Counts come from Supabase (via a head-count query per language) rather than
 * being hard-coded, satisfying the "counts must come dynamically" requirement.
 */
export function getLanguages(): Promise<LanguageWithCount[]> {
  return withFallback(async (supabase) => {
    const { data: languages, error } = await supabase
      .from('languages')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    if (!languages) return []

    const counts = await Promise.all(
      languages.map((language) =>
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('language_id', language.id),
      ),
    )

    return languages.map((language, index) => ({
      ...language,
      question_count: counts[index].count ?? 0,
    }))
  }, mockQueries.getLanguages)
}

export function getLanguageBySlug(slug: string): Promise<Language | null> {
  return withFallback(
    async (supabase) => {
      const { data, error } = await supabase.from('languages').select('*').eq('slug', slug).maybeSingle()

      if (error) throw error
      return data
    },
    () => mockQueries.getLanguageBySlug(slug),
  )
}
