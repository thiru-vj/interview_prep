import type { LanguageCategory } from '@/types/database'

interface CategoryMeta {
  label: string
  badgeClassName: string
}

export const LANGUAGE_CATEGORIES: LanguageCategory[] = ['frontend', 'backend', 'database']

const CATEGORY_META: Record<LanguageCategory, CategoryMeta> = {
  frontend: {
    label: 'Frontend',
    badgeClassName: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  },
  backend: {
    label: 'Backend',
    badgeClassName: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  database: {
    label: 'Database',
    badgeClassName: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
}

export function getCategoryLabel(category: LanguageCategory): string {
  return CATEGORY_META[category]?.label ?? category
}

export function getCategoryBadgeClassName(category: LanguageCategory): string {
  return CATEGORY_META[category]?.badgeClassName ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}
