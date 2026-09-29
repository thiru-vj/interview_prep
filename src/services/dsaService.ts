import { withFallback } from '@/lib/withFallback'
import { mockQueries } from './mockQueries'
import type { DsaProblem, DsaTopic } from '@/types/database'

export interface DsaData {
  topics: DsaTopic[]
  problems: DsaProblem[]
}

/**
 * Fetches every DSA topic and problem in two queries. The whole bank is only a
 * few hundred rows, so the DSA page loads it once and does all filtering
 * (topic, difficulty, FAQ, search, visible sections) client-side.
 * Problems come back ordered by topic display order, then by their own order.
 */
export function getDsaData(): Promise<DsaData> {
  return withFallback(async (supabase) => {
    const [{ data: topics, error: topicsError }, { data: problems, error: problemsError }] = await Promise.all([
      supabase.from('dsa_topics').select('*').order('display_order', { ascending: true }),
      supabase.from('dsa_problems').select('*').order('display_order', { ascending: true }),
    ])

    if (topicsError) throw topicsError
    if (problemsError) throw problemsError

    const topicOrder = new Map((topics ?? []).map((topic: DsaTopic, index) => [topic.id, index]))
    const sorted = [...(problems ?? [])].sort(
      (a: DsaProblem, b: DsaProblem) =>
        (topicOrder.get(a.topic_id) ?? 0) - (topicOrder.get(b.topic_id) ?? 0) || a.display_order - b.display_order,
    )

    return { topics: topics ?? [], problems: sorted }
  }, mockQueries.getDsaData)
}
