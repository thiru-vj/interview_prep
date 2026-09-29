import { withFallback } from '@/lib/withFallback'
import { mockQueries } from './mockQueries'
import type { Topic, TopicWithCount } from '@/types/database'

/** All topics for a language, each annotated with its live question count. */
export function getTopicsByLanguage(languageId: string): Promise<TopicWithCount[]> {
  return withFallback(
    async (supabase) => {
      const { data: topics, error } = await supabase
        .from('topics')
        .select('*')
        .eq('language_id', languageId)
        .order('display_order', { ascending: true })

      if (error) throw error
      if (!topics) return []

      const counts = await Promise.all(
        topics.map((topic) =>
          supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', topic.id),
        ),
      )

      return topics.map((topic, index) => ({
        ...topic,
        question_count: counts[index].count ?? 0,
      }))
    },
    () => mockQueries.getTopicsByLanguage(languageId),
  )
}

export function getTopicBySlug(languageId: string, slug: string): Promise<Topic | null> {
  return withFallback(
    async (supabase) => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('language_id', languageId)
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error
      return data
    },
    () => mockQueries.getTopicBySlug(languageId, slug),
  )
}
