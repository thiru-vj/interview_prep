import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LanguageGrid } from '@/components/language/LanguageGrid'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useLanguages } from '@/hooks/useLanguages'

export function Languages() {
  const { data: languages, loading, error } = useLanguages()

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
      {!loading && !error && languages && languages.length > 0 && <LanguageGrid languages={languages} />}
    </div>
  )
}
