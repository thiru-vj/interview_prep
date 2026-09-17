import { useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { SearchBar } from '@/components/search/SearchBar'
import { QuestionList } from '@/components/question/QuestionList'
import { Pagination } from '@/components/pagination/Pagination'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useSearchQuestions } from '@/hooks/useSearchQuestions'
import { parsePageParam } from '@/utils/pagination'

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const query = searchParams.get('q') ?? ''
  const page = parsePageParam(searchParams.get('page'))

  const { data: result, loading, error } = useSearchQuestions(query, page)
  const returnTo = `${location.pathname}${location.search}`

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    setSearchParams(params)
  }

  const startIndex = useMemo(() => (page - 1) * (result?.pageSize ?? 25) + 1, [page, result?.pageSize])

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title={query ? `Search: ${query} | Interview Preparation` : 'Search | Interview Preparation'}
        description="Search technical interview questions by keyword, tag, language or topic."
        canonicalPath="/search"
      />
      <Breadcrumbs items={[{ label: 'Search' }]} />

      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Search Questions</h1>
        <div className="max-w-lg">
          <SearchBar />
        </div>
      </header>

      {!query.trim() && (
        <EmptyState title="Start typing to search" message="Search by question, answer, tag, language or topic." />
      )}

      {query.trim() && loading && <LoadingState label="Searching..." />}
      {query.trim() && error && <ErrorState message="Unable to search right now. Please try again." />}
      {query.trim() && !loading && !error && result && result.data.length === 0 && (
        <EmptyState title={`No results for "${query}"`} message="Try a different keyword." />
      )}
      {query.trim() && !loading && !error && result && result.data.length > 0 && (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {result.total} result{result.total === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
          <QuestionList questions={result.data} startIndex={startIndex} returnTo={returnTo} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}
