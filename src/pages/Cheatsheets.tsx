import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { CheatsheetTechnologyGrid } from '@/components/cheatsheet/CheatsheetTechnologyGrid'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useCheatsheetTechnologies } from '@/hooks/useCheatsheets'

export function Cheatsheets() {
  const { data: technologies, loading, error } = useCheatsheetTechnologies()

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title="Cheatsheets | Interview Preparation"
        description="Quick-reference cheatsheets for JavaScript, HTML, CSS, React, Redux, Zustand and the DOM — fast revision of methods, tags and concepts."
        canonicalPath="/cheatsheets"
      />
      <Breadcrumbs items={[{ label: 'Cheatsheets' }]} />

      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cheatsheets</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Quick-reference methods, tags and concepts for fast revision. Pick a technology to get started.
        </p>
      </header>

      {loading && <LoadingState label="Loading cheatsheets..." />}
      {error && <ErrorState message="Unable to load cheatsheets. Please try again." />}
      {!loading && !error && technologies && technologies.length === 0 && (
        <EmptyState title="No cheatsheets available yet" />
      )}
      {!loading && !error && technologies && technologies.length > 0 && (
        <CheatsheetTechnologyGrid technologies={technologies} />
      )}
    </div>
  )
}
