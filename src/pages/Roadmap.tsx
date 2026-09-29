import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Map as MapIcon } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { ProgressBar } from '@/components/study/ProgressBar'
import { useDsaData } from '@/hooks/useDsa'
import { useLanguages } from '@/hooks/useLanguages'
import { useTopics } from '@/hooks/useTopics'
import { useProgress } from '@/hooks/useProgress'
import { countByStatus } from '@/lib/progress'

interface Step {
  id: string
  name: string
  description: string | null
  done: number
  total: number
  href: string
  studyHref: string
}

/** A numbered path of topics, highlighting the first one that isn't finished yet. */
function StepList({ steps, unit }: { steps: Step[]; unit: string }) {
  const nextIndex = steps.findIndex((step) => step.total > 0 && step.done < step.total)

  return (
    <ol className="relative flex flex-col gap-3 border-l-2 border-slate-200 pl-6 dark:border-slate-800">
      {steps.map((step, index) => {
        const complete = step.total > 0 && step.done >= step.total
        const isNext = index === nextIndex
        return (
          <li key={step.id} className="relative">
            <span
              className={`absolute -left-[37px] top-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                complete
                  ? 'bg-emerald-500 text-white'
                  : isNext
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-500/20'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
              aria-hidden="true"
            >
              {complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </span>
            <div
              className={`flex flex-col gap-2 rounded-lg border p-4 ${
                isNext
                  ? 'border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-500/5'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.name}
                  {isNext && (
                    <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      Up next
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    to={step.studyHref}
                    className="text-slate-500 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                  >
                    Flashcards
                  </Link>
                  <Link
                    to={step.href}
                    className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {step.done > 0 ? 'Continue' : 'Start'}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
              {step.description && <p className="text-sm text-slate-500 dark:text-slate-400">{step.description}</p>}
              <ProgressBar done={step.done} total={step.total} label={unit} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function DsaRoadmap() {
  const { data, loading, error } = useDsaData()
  const progress = useProgress()
  if (loading) return <LoadingState label="Loading DSA roadmap..." />
  if (error || !data) return <ErrorState message="Unable to load the DSA roadmap." />

  const steps: Step[] = data.topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description,
    done: countByStatus(progress, 'solved', (entry) => entry.kind === 'dsa' && entry.topicId === topic.id),
    total: data.problems.filter((p) => p.topic_id === topic.id).length,
    href: `/dsa?topic=${topic.slug}`,
    studyHref: `/study?mode=flashcards&source=dsa&pattern=${topic.id}`,
  }))
  return <StepList steps={steps} unit="solved" />
}

function LanguageRoadmap({ languageId, languageSlug }: { languageId: string; languageSlug: string }) {
  const { data: topics, loading, error } = useTopics(languageId)
  const progress = useProgress()
  if (loading && !topics) return <LoadingState label="Loading topics..." />
  if (error || !topics) return <ErrorState message="Unable to load topics." />

  const steps: Step[] = topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description,
    done: countByStatus(progress, 'learned', (entry) => entry.topicId === topic.id),
    total: topic.question_count,
    href: `/languages/${languageSlug}/topics/${topic.slug}`,
    studyHref: `/study?mode=flashcards&language=${languageId}&topic=${topic.id}`,
  }))
  return <StepList steps={steps} unit="learned" />
}

export function Roadmap() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: languages } = useLanguages()
  const [track, setTrackState] = useState(searchParams.get('track') ?? 'dsa')

  function setTrack(value: string) {
    setTrackState(value)
    setSearchParams({ track: value }, { replace: true })
  }

  const language = languages?.find((l) => l.slug === track)

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title="Learning Roadmaps | Interview Preparation"
        description="Step-by-step learning paths for DSA patterns and each technology, with your progress."
        canonicalPath="/roadmap"
      />
      <Breadcrumbs items={[{ label: 'Roadmap' }]} />

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <MapIcon className="h-6 w-6 text-blue-600 dark:text-blue-500" aria-hidden="true" />
          Roadmap
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Not sure where to start? Follow the steps in order — each one builds on the last. Your progress is tracked as
          you mark questions learned and solve problems.
        </p>
      </header>

      <div role="tablist" aria-label="Roadmap track" className="flex flex-wrap gap-2">
        {[{ slug: 'dsa', name: 'DSA Patterns' }, ...(languages ?? [])].map((option) => {
          const active = option.slug === track
          return (
            <button
              key={option.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTrack(option.slug)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {option.name}
            </button>
          )
        })}
      </div>

      {track === 'dsa' || (languages && !language) ? (
        <DsaRoadmap />
      ) : language ? (
        <LanguageRoadmap key={language.id} languageId={language.id} languageSlug={language.slug} />
      ) : (
        <LoadingState label="Loading roadmap..." />
      )}
    </div>
  )
}
