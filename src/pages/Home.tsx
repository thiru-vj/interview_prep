import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/search/SearchBar'
import { LanguageGrid } from '@/components/language/LanguageGrid'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { useLanguages } from '@/hooks/useLanguages'

export function Home() {
  const { data: languages, loading, error } = useLanguages()
  const totalQuestions = languages?.reduce((sum, lang) => sum + lang.question_count, 0) ?? 0

  return (
    <div className="flex flex-col gap-16">
      <Seo
        title="Technical Interview Preparation"
        description="Practice real technical interview questions for Java, JavaScript, React and SQL. Fast, searchable, and free interview preparation."
        canonicalPath="/"
      />

      <section className="flex flex-col items-center gap-6 py-10 text-center">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Technical Interview Preparation
        </h1>
        <p className="max-w-xl text-balance text-slate-500 dark:text-slate-400">
          Practice real interview questions for Java, JavaScript, React and SQL — a fast, searchable reference to revise
          before your next interview.
        </p>
        <div className="w-full max-w-lg">
          <SearchBar />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/languages"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Browse Questions
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {!loading && !error && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {totalQuestions} interview questions and counting
            </span>
          )}
        </div>
      </section>

      <section aria-labelledby="popular-technologies-heading" className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <h2 id="popular-technologies-heading" className="text-xl font-semibold text-slate-900 dark:text-white">
            Popular Technologies
          </h2>
          <Link to="/languages" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            View all
          </Link>
        </div>

        {loading && <LoadingState label="Loading technologies..." />}
        {error && <ErrorState message="Unable to load technologies. Please try again." />}
        {!loading && !error && languages && <LanguageGrid languages={languages} />}
      </section>
    </div>
  )
}
