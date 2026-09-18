import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { NotFoundState } from '@/components/common/NotFoundState'
import { CheatsheetCategoryFilter } from '@/components/cheatsheet/CheatsheetCategoryFilter'
import { CheatsheetModeToggle, type CheatsheetMode } from '@/components/cheatsheet/CheatsheetModeToggle'
import { CheatsheetSearchInput } from '@/components/cheatsheet/CheatsheetSearchInput'
import { CheatsheetItemCard } from '@/components/cheatsheet/CheatsheetItemCard'
import { useCheatsheetTechnology } from '@/hooks/useCheatsheets'
import type { CheatsheetItem } from '@/types/database'

function matchesQuery(item: CheatsheetItem, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    item.name.toLowerCase().includes(needle) ||
    (item.syntax?.toLowerCase().includes(needle) ?? false) ||
    (item.tags?.some((tag) => tag.toLowerCase().includes(needle)) ?? false)
  )
}

export function CheatsheetTechnology() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedCategory = searchParams.get('category')
  const mode: CheatsheetMode = searchParams.get('mode') === 'explanation' ? 'explanation' : 'normal'
  const query = searchParams.get('q') ?? ''

  const { data, loading, error } = useCheatsheetTechnology(slug)

  function updateParams(next: { category?: string | null; mode?: CheatsheetMode; q?: string }) {
    const params = new URLSearchParams(searchParams)
    if (next.category !== undefined) {
      if (next.category) params.set('category', next.category)
      else params.delete('category')
    }
    if (next.mode !== undefined) {
      if (next.mode === 'explanation') params.set('mode', 'explanation')
      else params.delete('mode')
    }
    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q)
      else params.delete('q')
    }
    setSearchParams(params, { replace: true })
  }

  const visibleCategories = useMemo(() => {
    if (!data) return []
    return data.categories
      .filter((category) => !selectedCategory || category.slug === selectedCategory)
      .map((category) => ({ ...category, items: category.items.filter((item) => matchesQuery(item, query)) }))
      .filter((category) => category.items.length > 0)
  }, [data, selectedCategory, query])

  if (loading) return <LoadingState label="Loading cheatsheet..." />
  if (error) return <ErrorState message="Unable to load this cheatsheet. Please try again." />
  if (!data) return <NotFoundState title="Cheatsheet not found" message="We couldn't find that technology." />

  const { technology, categories } = data

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title={`${technology.name} Cheatsheet | Interview Preparation`}
        description={technology.description ?? `Quick-reference ${technology.name} cheatsheet.`}
        canonicalPath={`/cheatsheets/${technology.slug}`}
      />
      <Breadcrumbs items={[{ label: 'Cheatsheets', to: '/cheatsheets' }, { label: technology.name }]} />

      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{technology.name} Cheatsheet</h1>
        {technology.description && <p className="mt-1 text-slate-500 dark:text-slate-400">{technology.description}</p>}
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CheatsheetSearchInput value={query} onChange={(value) => updateParams({ q: value })} />
        <CheatsheetModeToggle value={mode} onChange={(value) => updateParams({ mode: value })} />
      </div>

      {categories.length > 0 && (
        <CheatsheetCategoryFilter
          categories={categories}
          value={selectedCategory}
          onChange={(value) => updateParams({ category: value })}
        />
      )}

      {visibleCategories.length === 0 && (
        <EmptyState title="No matching entries" message="Try a different search term or category." />
      )}

      <div className="flex flex-col gap-8">
        {visibleCategories.map((category) => (
          <section key={category.id} aria-labelledby={`category-${category.slug}-heading`}>
            <h2
              id={`category-${category.slug}-heading`}
              className="mb-3 text-lg font-semibold text-slate-900 dark:text-white"
            >
              {category.name}
            </h2>
            <div
              className={
                mode === 'normal'
                  ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'
                  : 'grid grid-cols-1 gap-4 lg:grid-cols-2'
              }
            >
              {category.items.map((item) => (
                <CheatsheetItemCard key={item.id} item={item} mode={mode} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
