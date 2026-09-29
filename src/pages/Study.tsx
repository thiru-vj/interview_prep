import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BrainCircuit, CalendarClock, Layers, Loader2, Mic } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EmptyState } from '@/components/common/EmptyState'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { DifficultyFilter } from '@/components/question/DifficultyFilter'
import { StudySession, type SessionResult } from '@/components/study/StudySession'
import { useLanguages } from '@/hooks/useLanguages'
import { useTopics } from '@/hooks/useTopics'
import { useAsync } from '@/hooks/useAsync'
import { useProgress } from '@/hooks/useProgress'
import { getProgress, getDueReviews } from '@/lib/progress'
import { getDsaData } from '@/services/dsaService'
import { buildDeck, type DeckSetup, type StudyCard, type StudyMode, type StudySource } from '@/utils/studyDeck'
import type { Difficulty } from '@/types/database'

const MODES: { value: StudyMode; label: string; description: string; icon: typeof Layers }[] = [
  {
    value: 'flashcards',
    label: 'Flashcards',
    description: 'Random cards from a topic. Reveal, then grade yourself.',
    icon: Layers,
  },
  {
    value: 'mock',
    label: 'Mock interview',
    description: 'Mixed difficulty, easy → hard, against the clock.',
    icon: Mic,
  },
  {
    value: 'review',
    label: 'Review queue',
    description: 'Cards you missed or marked for review that are due today.',
    icon: CalendarClock,
  },
]

const COUNTS = [5, 10, 20, 0]
const MINUTES = [10, 20, 30, 45]

type Phase =
  | { name: 'setup' }
  | { name: 'loading' }
  | { name: 'session'; cards: StudyCard[]; key: number }
  | { name: 'summary'; results: SessionResult[]; total: number; elapsedMs: number; timedOut: boolean }

const selectClass =
  'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white'

function Label({ children }: { children: string }) {
  return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{children}</span>
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

export function Study() {
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const mode: StudyMode = MODES.some((m) => m.value === modeParam) ? (modeParam as StudyMode) : 'flashcards'

  const progress = useProgress()
  const dueCount = getDueReviews(progress).length

  const [source, setSource] = useState<StudySource>(searchParams.get('source') === 'dsa' ? 'dsa' : 'questions')
  // Links from the roadmap preselect a technology/topic or DSA pattern.
  const [languageId, setLanguageId] = useState<string | null>(searchParams.get('language'))
  const [topicId, setTopicId] = useState<string | null>(searchParams.get('topic'))
  const [dsaTopicId, setDsaTopicId] = useState<string | null>(searchParams.get('pattern'))
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [count, setCount] = useState(10)
  const [minutes, setMinutes] = useState(20)
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [error, setError] = useState<string | null>(null)

  const { data: languages } = useLanguages()
  const effectiveLanguageId = languageId ?? languages?.[0]?.id ?? null
  const { data: topics } = useTopics(effectiveLanguageId ?? undefined)
  const { data: dsa } = useAsync(() => (source === 'dsa' ? getDsaData() : Promise.resolve(null)), [source])
  // Don't let a session start (and report "no cards") before the technology list has loaded.
  const optionsLoading = mode !== 'review' && source === 'questions' && !effectiveLanguageId

  function setMode(next: StudyMode) {
    const params = new URLSearchParams(searchParams)
    params.set('mode', next)
    setSearchParams(params, { replace: true })
  }

  async function start(cardsOverride?: StudyCard[]) {
    setError(null)
    if (cardsOverride) {
      setPhase({ name: 'session', cards: cardsOverride, key: Date.now() })
      return
    }
    setPhase({ name: 'loading' })
    const setup: DeckSetup = {
      mode,
      source,
      languageId: effectiveLanguageId,
      topicId,
      dsaTopicId,
      difficulty,
      count,
    }
    try {
      // Read progress at start time — the review queue is a snapshot for this session.
      const cards = await buildDeck(setup, getProgress())
      if (cards.length === 0) {
        setError(
          mode === 'review' ? 'Nothing is due for review right now. Nice work!' : 'No cards match those settings.',
        )
        setPhase({ name: 'setup' })
        return
      }
      setPhase({ name: 'session', cards, key: Date.now() })
    } catch {
      setError("Couldn't load cards. Please try again.")
      setPhase({ name: 'setup' })
    }
  }

  const finish = useCallback(
    (results: SessionResult[], elapsedMs: number, timedOut: boolean) =>
      setPhase((current) =>
        current.name === 'session'
          ? { name: 'summary', results, total: current.cards.length, elapsedMs, timedOut }
          : current,
      ),
    [],
  )

  const currentMode = MODES.find((m) => m.value === mode)!

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title="Study: Flashcards & Mock Interviews | Interview Preparation"
        description="Test yourself with flashcards, timed mock interviews and a spaced-repetition review queue."
        canonicalPath="/study"
      />
      <Breadcrumbs items={[{ label: 'Study' }]} />

      {phase.name === 'session' && (
        <StudySession
          key={phase.key}
          cards={phase.cards}
          timeLimitMinutes={mode === 'mock' ? minutes : undefined}
          onFinish={finish}
          onQuit={() => setPhase({ name: 'setup' })}
        />
      )}

      {phase.name === 'summary' && (
        <Summary {...phase} onRetryMissed={(cards) => start(cards)} onNew={() => setPhase({ name: 'setup' })} />
      )}

      {(phase.name === 'setup' || phase.name === 'loading') && (
        <>
          <header>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <BrainCircuit className="h-6 w-6 text-blue-600 dark:text-blue-500" aria-hidden="true" />
              Study
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Reading answers isn&apos;t the same as knowing them. Test yourself, then grade honestly — missed cards
              come back sooner.
            </p>
          </header>

          <div role="radiogroup" aria-label="Study mode" className="grid gap-3 sm:grid-cols-3">
            {MODES.map((option) => {
              const Icon = option.icon
              const active = option.value === mode
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(option.value)}
                  className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                    {option.value === 'review' && dueCount > 0 && (
                      <span className="rounded-full bg-amber-500 px-2 text-xs text-white">{dueCount} due</span>
                    )}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{option.description}</span>
                </button>
              )
            })}
          </div>

          <section
            aria-label={`${currentMode.label} settings`}
            className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40"
          >
            {mode !== 'review' && (
              <>
                <div className="flex flex-col gap-2">
                  <Label>Study</Label>
                  <div role="radiogroup" aria-label="Source" className="flex flex-wrap gap-2">
                    <Chip active={source === 'questions'} onClick={() => setSource('questions')}>
                      Interview questions
                    </Chip>
                    <Chip active={source === 'dsa'} onClick={() => setSource('dsa')}>
                      DSA problems
                    </Chip>
                  </div>
                </div>

                {source === 'questions' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <Label>Technology</Label>
                      <select
                        className={selectClass}
                        value={effectiveLanguageId ?? ''}
                        onChange={(event) => {
                          setLanguageId(event.target.value)
                          setTopicId(null)
                        }}
                      >
                        {(languages ?? []).map((language) => (
                          <option key={language.id} value={language.id}>
                            {language.name} ({language.question_count})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <Label>Topic</Label>
                      <select
                        className={selectClass}
                        value={topicId ?? ''}
                        onChange={(event) => setTopicId(event.target.value || null)}
                      >
                        <option value="">All topics</option>
                        {(topics ?? []).map((topic) => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name} ({topic.question_count})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col gap-1.5 sm:max-w-sm">
                    <Label>Pattern</Label>
                    <select
                      className={selectClass}
                      value={dsaTopicId ?? ''}
                      onChange={(event) => setDsaTopicId(event.target.value || null)}
                    >
                      <option value="">All patterns</option>
                      {(dsa?.topics ?? []).map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {mode === 'flashcards' && (
                  <div className="flex flex-col gap-2">
                    <Label>Difficulty</Label>
                    <DifficultyFilter value={difficulty} onChange={setDifficulty} />
                  </div>
                )}
              </>
            )}

            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col gap-2">
                <Label>Cards</Label>
                <div role="radiogroup" aria-label="Number of cards" className="flex flex-wrap gap-2">
                  {COUNTS.map((value) => (
                    <Chip key={value} active={count === value} onClick={() => setCount(value)}>
                      {value === 0 ? 'All' : value}
                    </Chip>
                  ))}
                </div>
              </div>
              {mode === 'mock' && (
                <div className="flex flex-col gap-2">
                  <Label>Time limit</Label>
                  <div role="radiogroup" aria-label="Time limit" className="flex flex-wrap gap-2">
                    {MINUTES.map((value) => (
                      <Chip key={value} active={minutes === value} onClick={() => setMinutes(value)}>
                        {value} min
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => start()}
                disabled={phase.name === 'loading' || optionsLoading || (mode === 'review' && dueCount === 0)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {(phase.name === 'loading' || optionsLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {optionsLoading ? 'Loading…' : `Start ${currentMode.label.toLowerCase()}`}
              </button>
              {mode === 'review' && dueCount === 0 && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Nothing due. Mark items &ldquo;Needs review&rdquo; or miss a flashcard to fill the queue.
                </span>
              )}
            </div>
          </section>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Keys during a session: <kbd className="font-mono">Space</kbd> reveal · <kbd className="font-mono">1</kbd>{' '}
            missed · <kbd className="font-mono">2</kbd> got it
          </p>
        </>
      )}
    </div>
  )
}

interface SummaryProps {
  results: SessionResult[]
  total: number
  elapsedMs: number
  timedOut: boolean
  onRetryMissed: (cards: StudyCard[]) => void
  onNew: () => void
}

function Summary({ results, total, elapsedMs, timedOut, onRetryMissed, onNew }: SummaryProps) {
  const correct = results.filter((r) => r.correct).length
  const missed = results.filter((r) => !r.correct).map((r) => r.card)
  const percent = results.length > 0 ? Math.round((correct / results.length) * 100) : 0

  if (results.length === 0) {
    return (
      <EmptyState
        title={timedOut ? "Time's up" : 'Session ended'}
        message="No cards were graded this time."
        action={
          <button type="button" onClick={onNew} className="text-sm font-medium text-blue-600 hover:underline">
            Start another session
          </button>
        }
      />
    )
  }

  return (
    <section aria-labelledby="summary-heading" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 id="summary-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
          {timedOut ? "Time's up!" : 'Session complete'}
        </h1>
        <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{percent}%</p>
        <p className="text-slate-500 dark:text-slate-400">
          {correct} of {results.length} correct
          {results.length < total ? ` (${total - results.length} not reached)` : ''} · {formatDuration(elapsedMs)}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => onRetryMissed(missed)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry {missed.length} missed
            </button>
          )}
          <button
            type="button"
            onClick={onNew}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            New session
          </button>
          <Link
            to="/progress"
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:underline dark:text-slate-300"
          >
            View progress
          </Link>
        </div>
      </div>

      {missed.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Review these</h2>
          <ul className="flex flex-col gap-2">
            {missed.map((card) => (
              <li key={card.ref.href}>
                <Link
                  to={card.ref.href}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3 text-sm hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-500/5"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{card.prompt}</span>
                  <DifficultyBadge difficulty={card.difficulty} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
