import { supabase } from '@/lib/supabase'
import type { Topic, TopicWithCount } from '@/types/database'

/** All topics for a language, each annotated with its live question count. */
export async function getTopicsByLanguage(languageId: string): Promise<TopicWithCount[]> {
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
}

export async function getTopicBySlug(languageId: string, slug: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('language_id', languageId)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}
