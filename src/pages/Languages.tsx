import { useMemo, useState } from 'react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LanguageGrid } from '@/components/language/LanguageGrid'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useLanguages } from '@/hooks/useLanguages'
import type { LanguageCategory } from '@/types/database'
import { LANGUAGE_CATEGORIES, getCategoryLabel } from '@/utils/categories'

type CategoryFilter = LanguageCategory | 'all'

export function Languages() {
  const { data: languages, loading, error } = useLanguages()
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')

  const availableCategories = useMemo(
    () => LANGUAGE_CATEGORIES.filter((category) => languages?.some((language) => language.category === category)),
    [languages],
  )

  const groupedLanguages = useMemo(() => {
    if (!languages) return []
    const categoriesToShow = activeCategory === 'all' ? availableCategories : [activeCategory]
    return categoriesToShow
      .map((category) => ({
        category,
        languages: languages.filter((language) => language.category === category),
      }))
      .filter((group) => group.languages.length > 0)
  }, [languages, activeCategory, availableCategories])

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title="All Languages | Interview Preparation"
        description="Browse technical interview questions by language and technology: Java, JavaScript, React, SQL and more."
        canonicalPath="/languages"
      />
      <Breadcrumbs items={[{ label: 'Languages' }]} />

      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Languages</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Choose a technology to start practicing.</p>
      </header>

      {loading && <LoadingState label="Loading languages..." />}
      {error && <ErrorState message="Unable to load languages. Please try again." />}
      {!loading && !error && languages && languages.length === 0 && <EmptyState title="No languages available yet" />}

      {!loading && !error && languages && languages.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-10">
            {groupedLanguages.map((group) => (
              <section key={group.category} aria-labelledby={`category-${group.category}-heading`}>
                <h2
                  id={`category-${group.category}-heading`}
                  className="mb-4 text-lg font-semibold text-slate-900 dark:text-white"
                >
                  {getCategoryLabel(group.category)}
                </h2>
                <LanguageGrid languages={group.languages} />
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
