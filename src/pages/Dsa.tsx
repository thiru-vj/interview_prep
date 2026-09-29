import { Suspense, lazy, useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { DifficultyFilter } from '@/components/question/DifficultyFilter'
import { FaqToggle } from '@/components/question/FaqToggle'
import { Pagination } from '@/components/pagination/Pagination'
import { DsaSearchInput } from '@/components/dsa/DsaSearchInput'
import { DsaTopicFilter } from '@/components/dsa/DsaTopicFilter'
import { DsaSectionFilter } from '@/components/dsa/DsaSectionFilter'
import { DsaLanguageSelector } from '@/components/dsa/DsaLanguageSelector'
import { DsaProblemCard } from '@/components/dsa/DsaProblemCard'
import { useDsaData } from '@/hooks/useDsa'
import { useAccess } from '@/hooks/useAccess'
import { useDsaLanguages } from '@/hooks/useDsaLanguages'
import { useProgress } from '@/hooks/useProgress'
import { RevealToggle } from '@/components/study/RevealToggle'
import { itemKey, recordVisit, setStatus, type ProgressState } from '@/lib/progress'
import { dsaRef } from '@/utils/study'
import { parsePageParam } from '@/utils/pagination'
import { ALL_DSA_SECTIONS, DEFAULT_DSA_SECTIONS, parseSectionsParam, type DsaSection } from '@/utils/dsa'
import { useLearningMode } from '@/hooks/useLearningMode'
import type { Difficulty, DsaProblem, PracticeLanguage } from '@/types/database'

// CodeMirror and the runner only load when someone actually opens the practice editor.
const PracticeModal = lazy(() => import('@/components/practice/PracticeModal'))

const PRACTICE_LANGUAGE_KEY = 'interview-prep-practice-language'

function getPracticeLanguage(fallback: string | undefined): PracticeLanguage {
  try {
    const stored = localStorage.getItem(PRACTICE_LANGUAGE_KEY)
    if (stored === 'javascript' || stored === 'python') return stored
  } catch {
    // unavailable — use the fallback
  }
  return fallback === 'python' ? 'python' : 'javascript'
}

function savePracticeLanguage(language: PracticeLanguage) {
  try {
    localStorage.setItem(PRACTICE_LANGUAGE_KEY, language)
  } catch {
    // ignore write failures
  }
}

const PAGE_SIZE = 20
const DIFFICULTIES = new Set<string>(['easy', 'medium', 'hard'])

type StatusFilter = 'todo' | 'solved' | 'review' | 'saved'
const STATUS_FILTERS: { value: StatusFilter | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'todo', label: 'Unsolved' },
  { value: 'solved', label: 'Solved' },
  { value: 'review', label: 'Needs review' },
  { value: 'saved', label: 'Saved' },
]

function matchesStatus(problem: DsaProblem, filter: StatusFilter | null, progress: ProgressState): boolean {
  if (!filter) return true
  const key = itemKey('dsa', problem.slug)
  const status = progress.statuses[key]?.status
  if (filter === 'saved') return Boolean(progress.bookmarks[key])
  if (filter === 'todo') return status !== 'solved'
  return status === filter
}

function matchesQuery(problem: DsaProblem, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    problem.title.toLowerCase().includes(needle) ||
    problem.question.toLowerCase().includes(needle) ||
    (problem.tags?.some((tag) => tag.toLowerCase().includes(needle)) ?? false)
  )
}

export function Dsa() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { role } = useAccess()
  const { languages, max, toggleLanguage } = useDsaLanguages(role)

  const selectedTopic = searchParams.get('topic')
  const difficultyParam = searchParams.get('difficulty')
  const difficulty = difficultyParam && DIFFICULTIES.has(difficultyParam) ? (difficultyParam as Difficulty) : null
  const frequentlyAsked = searchParams.get('faq') === 'true'
  const query = searchParams.get('q') ?? ''
  const showParam = searchParams.get('show')
  const defaultSections = role === 'admin' ? ALL_DSA_SECTIONS : DEFAULT_DSA_SECTIONS
  const sections = useMemo(() => parseSectionsParam(showParam, defaultSections), [showParam, defaultSections])
  const sectionSet = useMemo(() => new Set(sections), [sections])
  const page = parsePageParam(searchParams.get('page'))
  const practiceSlug = searchParams.get('practice')
  const statusParam = searchParams.get('status')
  const statusFilter = STATUS_FILTERS.find((option) => option.value === statusParam)?.value ?? null
  const progress = useProgress()
  const { enabled: studyMode } = useLearningMode()
  // Status only feeds the filter when one is active, so marking a problem doesn't re-filter the list otherwise.
  const filterProgress = statusFilter ? progress : null

  // Kept in a ref so openPractice stays stable and the memoized cards don't re-render.
  const setParamsRef = useRef(setSearchParams)
  useEffect(() => {
    setParamsRef.current = setSearchParams
  })

  // The open practice problem lives in the URL: shareable, and Back closes the editor.
  const openPractice = useCallback((slug: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('practice', slug)
    setParamsRef.current(params)
  }, [])
  const closePractice = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('practice')) return
    params.delete('practice')
    setParamsRef.current(params, { replace: true })
  }, [])

  const { data, loading, error } = useDsaData()

  function updateParams(next: {
    topic?: string | null
    difficulty?: Difficulty | null
    faq?: boolean
    q?: string
    status?: StatusFilter | null
    show?: (current: DsaSection[]) => DsaSection[]
    page?: number
  }) {
    // Read the live URL rather than `searchParams`: React Router applies URL changes as a
    // transition, so for a moment after a click `searchParams` still holds the previous
    // value — building on it would drop a quick second click.
    const params = new URLSearchParams(window.location.search)
    const setOrDelete = (key: string, value: string | null) => {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    if (next.topic !== undefined) setOrDelete('topic', next.topic)
    if (next.difficulty !== undefined) setOrDelete('difficulty', next.difficulty)
    if (next.faq !== undefined) setOrDelete('faq', next.faq ? 'true' : null)
    if (next.q !== undefined) setOrDelete('q', next.q)
    if (next.status !== undefined) setOrDelete('status', next.status)
    if (next.show !== undefined) params.set('show', next.show(parseSectionsParam(params.get('show'), defaultSections)).join(','))
    // Any filter change starts from the first page again; section toggles don't change the result set.
    if (next.page !== undefined) setOrDelete('page', next.page > 1 ? String(next.page) : null)
    else if (next.show === undefined) params.delete('page')
    setSearchParams(params, { replace: next.q !== undefined || next.show !== undefined })
  }

  const topicsById = useMemo(() => new Map((data?.topics ?? []).map((topic) => [topic.id, topic])), [data])

  // Topic counts reflect the other active filters, so each chip shows what clicking it would give.
  const { filtered, topicCounts, totalAcrossTopics } = useMemo(() => {
    const counts = new Map<string, number>()
    let total = 0
    const matches: DsaProblem[] = []
    for (const problem of data?.problems ?? []) {
      if (difficulty && problem.difficulty !== difficulty) continue
      if (frequentlyAsked && !problem.is_frequently_asked) continue
      if (!matchesQuery(problem, query)) continue
      if (filterProgress && !matchesStatus(problem, statusFilter, filterProgress)) continue
      counts.set(problem.topic_id, (counts.get(problem.topic_id) ?? 0) + 1)
      total++
      if (!selectedTopic || topicsById.get(problem.topic_id)?.slug === selectedTopic) matches.push(problem)
    }
    return { filtered: matches, topicCounts: counts, totalAcrossTopics: total }
  }, [data, difficulty, frequentlyAsked, query, selectedTopic, topicsById, statusFilter, filterProgress])

  const practiceProblem = practiceSlug ? data?.problems.find((p) => p.slug === practiceSlug && p.practice) : undefined

  const markSolved = useCallback((problem: DsaProblem) => setStatus(dsaRef(problem), 'solved'), [])

  // Opening a problem in the editor counts as "viewing" it for Continue-where-you-left-off.
  useEffect(() => {
    if (practiceProblem) recordVisit(dsaRef(practiceProblem))
  }, [practiceProblem])

  // Links like /dsa?q=...#two-sum (from bookmarks, recent, the roadmap) land on that problem once it renders.
  const hasData = Boolean(data)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hasData && hash) document.getElementById(decodeURIComponent(hash))?.scrollIntoView()
  }, [hasData])

  if (loading) return <LoadingState label="Loading DSA problems..." />
  if (error || !data) return <ErrorState message="Unable to load DSA problems. Please try again." />

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title="DSA Interview Problems | Interview Preparation"
        description="Data structures and algorithms interview problems by topic, with brute force and optimal solutions in JavaScript, Java and Python, explanations and time/space complexity."
        canonicalPath="/dsa"
      />
      <Breadcrumbs items={[{ label: 'DSA' }]} />

      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">DSA Problems</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {data.problems.length} problems across {data.topics.length} topics — with brute force, optimal and alternate
            solutions, explanations and complexity.
          </p>
        </div>
        {role === 'admin' && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Admin access
          </span>
        )}
      </header>

      <div className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <DsaSearchInput value={query} onChange={(value) => updateParams({ q: value })} />
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyFilter value={difficulty} onChange={(value) => updateParams({ difficulty: value })} />
            <FaqToggle value={frequentlyAsked} onChange={(value) => updateParams({ faq: value })} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="radiogroup" aria-label="Filter by your progress" className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((option) => {
              const active = option.value === statusFilter
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateParams({ status: option.value })}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <RevealToggle />
        </div>

        {data.topics.length > 0 && (
          <DsaTopicFilter
            topics={data.topics}
            counts={topicCounts}
            total={totalAcrossTopics}
            value={selectedTopic}
            onChange={(value) => updateParams({ topic: value })}
          />
        )}

        <div className="flex flex-col gap-5 border-t border-slate-200 pt-4 dark:border-slate-800 lg:flex-row lg:items-start lg:justify-between">
          <DsaSectionFilter
            value={sections}
            defaults={defaultSections}
            onChange={(update) => updateParams({ show: update })}
          />
          <DsaLanguageSelector value={languages} max={max} onToggle={toggleLanguage} />
        </div>
      </div>

      {data.problems.length === 0 && (
        <EmptyState title="No DSA problems yet" message="Run supabase/seed-dsa.sql to load the problem bank." />
      )}
      {data.problems.length > 0 && filtered.length === 0 && (
        <EmptyState
          title="No matching problems"
          message="Try a different search term, topic or difficulty."
          action={
            <Link to="/dsa" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              Clear filters
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-4">
        {pageItems.map((problem, index) => (
          <DsaProblemCard
            key={problem.id}
            problem={problem}
            index={(currentPage - 1) * PAGE_SIZE + index + 1}
            topicName={selectedTopic ? undefined : topicsById.get(problem.topic_id)?.name}
            patternName={topicsById.get(problem.topic_id)?.name}
            sections={sectionSet}
            languages={languages}
            studyMode={studyMode}
            onPractice={openPractice}
          />
        ))}
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={(value) => {
          updateParams({ page: value })
          window.scrollTo({ top: 0 })
        }}
      />

      {practiceProblem && (
        <Suspense fallback={null}>
          <PracticeModal
            key={practiceProblem.slug}
            problem={practiceProblem}
            initialLanguage={getPracticeLanguage(languages[0])}
            onLanguageChange={savePracticeLanguage}
            onSolved={markSolved}
            onClose={closePractice}
          />
        </Suspense>
      )}
    </div>
  )
}
