import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { SearchBar } from '@/components/search/SearchBar'
import { LanguageGrid } from '@/components/language/LanguageGrid'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { AccessRoleCard } from '@/components/access/AccessRoleCard'
import { HomeStudyPanel } from '@/components/study/HomeStudyPanel'
import { useLanguages } from '@/hooks/useLanguages'

export function Home() {
  const { data: languages, loading, error } = useLanguages()
  const totalQuestions = languages?.reduce((sum, lang) => sum + lang.question_count, 0) ?? 0
  // Name the technologies actually in the database rather than a hard-coded list.
  const languageNames = languages?.length
    ? new Intl.ListFormat('en', { type: 'conjunction' }).format(
        languages.length > 6 ? [...languages.slice(0, 6).map((l) => l.name), 'more'] : languages.map((l) => l.name),
      )
    : 'frontend, backend and databases'
  const { hash } = useLocation()

  // Links like /#access (from the DSA page) should land on the access card.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <div className="flex flex-col gap-16">
      <Seo
        title="Technical Interview Preparation"
        description="Learn and practice technical interview questions for frontend, backend and databases, plus DSA problems with an in-browser code editor, cheatsheets, flashcards and mock interviews. Free."
        canonicalPath="/"
      />

      <section className="flex flex-col items-center gap-6 pt-10 text-center">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Technical Interview Preparation
        </h1>
        <p className="max-w-xl text-balance text-slate-500 dark:text-slate-400">
          Interview questions for {languageNames}, DSA problems you can code right in the browser, and cheatsheets.
          Follow a roadmap, test yourself with flashcards and mock interviews, and track what you&apos;ve learned.
        </p>
        <div className="w-full max-w-lg">
          <SearchBar />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Start learning
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/languages"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Browse Questions
          </Link>
          <Link
            to="/dsa"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            DSA Problems
          </Link>
          <Link
            to="/study?mode=mock"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Mock Interview
          </Link>
          {!loading && !error && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {totalQuestions} interview questions and counting
            </span>
          )}
        </div>
      </section>

      <HomeStudyPanel />

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

      <section id="access" aria-label="Access" className="scroll-mt-24">
        <AccessRoleCard />
      </section>
    </div>
  )
}
