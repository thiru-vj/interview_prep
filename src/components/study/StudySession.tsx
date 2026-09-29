import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Timer, X } from 'lucide-react'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Markdown } from '@/components/common/Markdown'
import { QuestionCode } from '@/components/question/QuestionCode'
import { gradeCard } from '@/lib/progress'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { StudyCard } from '@/utils/studyDeck'
import { RevealGate } from './RevealGate'
import { ProgressBar } from './ProgressBar'

export interface SessionResult {
  card: StudyCard
  correct: boolean
}

interface StudySessionProps {
  cards: StudyCard[]
  /** Mock interview time limit; omitted for untimed flashcards. */
  timeLimitMinutes?: number
  onFinish: (results: SessionResult[], elapsedMs: number, timedOut: boolean) => void
  onQuit: () => void
}

function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** Runs through a deck: read the prompt, think, reveal, then self-grade. Grades feed spaced repetition. */
export function StudySession({ cards, timeLimitMinutes, onFinish, onQuit }: StudySessionProps) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<SessionResult[]>([])
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  const card = cards[index]
  const deadline = timeLimitMinutes ? startedAt + timeLimitMinutes * 60_000 : null
  const remaining = deadline ? deadline - now : null

  useEffect(() => {
    if (!deadline) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [deadline])

  // Time's up: finish with what's been answered so far.
  useEffect(() => {
    if (remaining !== null && remaining <= 0) onFinish(results, Date.now() - startedAt, true)
  }, [remaining, results, startedAt, onFinish])

  function grade(correct: boolean) {
    if (!card || !revealed) return
    gradeCard(card.ref, correct)
    const next = [...results, { card, correct }]
    if (index + 1 >= cards.length) {
      onFinish(next, Date.now() - startedAt, false)
      return
    }
    setResults(next)
    setIndex(index + 1)
    setRevealed(false)
    window.scrollTo({ top: 0 })
  }

  useHotkeys({
    ' ': () => setRevealed(true),
    '1': () => grade(false),
    ArrowLeft: () => grade(false),
    '2': () => grade(true),
    ArrowRight: () => grade(true),
  })

  if (!card) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Card {index + 1} of {cards.length}
        </span>
        <ProgressBar done={index} total={cards.length} className="min-w-32 flex-1" />
        {remaining !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-sm ${
              remaining < 60_000
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
            aria-label={`Time remaining ${formatClock(remaining)}`}
          >
            <Timer className="h-3.5 w-3.5" aria-hidden="true" />
            {formatClock(remaining)}
          </span>
        )}
        <button
          type="button"
          onClick={onQuit}
          className="text-sm text-slate-500 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
        >
          End session
        </button>
      </div>

      <article className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <DifficultyBadge difficulty={card.difficulty} />
            <span>{card.context}</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">{card.prompt}</h2>
          {card.details && <Markdown content={card.details} />}
        </header>

        <RevealGate
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          prompt="Answer out loud or on paper, then check yourself."
          shortcut="Space"
        >
          <section className="flex flex-col gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <Markdown content={card.answer} />
            {card.example && <Markdown content={card.example} />}
            {card.code && <QuestionCode code={card.code} language={card.codeLanguage ?? null} />}
            <Link
              to={card.ref.href}
              target="_blank"
              className="w-fit text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Open full page ↗
            </Link>
          </section>
        </RevealGate>
      </article>

      {revealed && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">How did you do?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => grade(false)}
              className="inline-flex items-center gap-2 rounded-md border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Missed it <kbd className="font-mono text-xs opacity-60">1</kbd>
            </button>
            <button
              type="button"
              onClick={() => grade(true)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Got it <kbd className="font-mono text-xs opacity-70">2</kbd>
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Missed cards come back sooner; ones you get right are spaced further apart.
          </p>
        </div>
      )}
    </div>
  )
}
