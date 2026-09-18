import { supabase } from '@/lib/supabase'
import type {
  CheatsheetCategory,
  CheatsheetCategoryWithItems,
  CheatsheetItem,
  CheatsheetTechnology,
  CheatsheetTechnologyWithCount,
} from '@/types/database'

/**
 * All cheatsheet technologies ordered for display, each annotated with its live item count.
 * Mirrors languageService.getLanguages().
 */
export async function getCheatsheetTechnologies(): Promise<CheatsheetTechnologyWithCount[]> {
  const { data: technologies, error } = await supabase
    .from('cheatsheet_technologies')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  if (!technologies) return []

  const counts = await Promise.all(
    technologies.map((technology) =>
      supabase.from('cheatsheet_items').select('id', { count: 'exact', head: true }).eq('technology_id', technology.id),
    ),
  )

  return technologies.map((technology, index) => ({
    ...technology,
    item_count: counts[index].count ?? 0,
  }))
}

export async function getCheatsheetTechnologyBySlug(slug: string): Promise<CheatsheetTechnology | null> {
  const { data, error } = await supabase.from('cheatsheet_technologies').select('*').eq('slug', slug).maybeSingle()

  if (error) throw error
  return data
}

export interface CheatsheetTechnologyData {
  technology: CheatsheetTechnology
  categories: CheatsheetCategoryWithItems[]
}

/**
 * Fetches a technology plus every category and item belonging to it, in three
 * queries, and groups items under their category client-side. Grouping
 * client-side (rather than ordering by a joined column) keeps the query
 * simple and avoids relying on cross-table ordering support.
 */
export async function getCheatsheetTechnologyData(slug: string): Promise<CheatsheetTechnologyData | null> {
  const technology = await getCheatsheetTechnologyBySlug(slug)
  if (!technology) return null

  const [{ data: categories, error: categoriesError }, { data: items, error: itemsError }] = await Promise.all([
    supabase
      .from('cheatsheet_categories')
      .select('*')
      .eq('technology_id', technology.id)
      .order('display_order', { ascending: true }),
    supabase
      .from('cheatsheet_items')
      .select('*')
      .eq('technology_id', technology.id)
      .order('display_order', { ascending: true }),
  ])

  if (categoriesError) throw categoriesError
  if (itemsError) throw itemsError

  const itemsByCategory = new Map<string, CheatsheetItem[]>()
  for (const item of items ?? []) {
    const bucket = itemsByCategory.get(item.category_id)
    if (bucket) bucket.push(item)
    else itemsByCategory.set(item.category_id, [item])
  }

  const withItems: CheatsheetCategoryWithItems[] = (categories ?? []).map((category: CheatsheetCategory) => ({
    ...category,
    items: itemsByCategory.get(category.id) ?? [],
  }))

  return { technology, categories: withItems }
}
