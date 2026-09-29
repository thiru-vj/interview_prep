import { memo, useState, type ReactNode } from 'react'
import { ChevronDown, Eye, Lightbulb, SquareTerminal } from 'lucide-react'
import type { DsaCodeLanguage, DsaProblem, DsaSolutionType } from '@/types/database'
import type { DsaSection } from '@/utils/dsa'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { FaqBadge } from '@/components/common/FaqBadge'
import { Markdown } from '@/components/common/Markdown'
import { StudyActions } from '@/components/study/StudyActions'
import { dsaRef } from '@/utils/study'
import { DsaSolutionView } from './DsaSolutionView'
import { DsaComplexityTable } from './DsaComplexityTable'

interface DsaProblemCardProps {
  problem: DsaProblem
  index: number
  topicName: string | undefined
  /** The problem's topic, shown as the pattern hint in study mode. */
  patternName: string | undefined
  sections: Set<DsaSection>
  languages: DsaCodeLanguage[]
  /** Learning mode: answers and solutions are revealed step by step instead of shown up front. */
  studyMode: boolean
  /** Opens the practice editor for this problem; the button is hidden when omitted. */
  onPractice?: (slug: string) => void
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</h3>
      {children}
    </section>
  )
}

const SOLUTION_SECTIONS: { type: DsaSolutionType; label: string }[] = [
  { type: 'brute', label: 'Brute Force' },
  { type: 'optimal', label: 'Optimal Solution' },
  { type: 'alternate', label: 'Alternate Solutions' },
]

/** Study-mode reveal steps: nothing → pattern hint → answer & explanation → solutions & complexity. */
type Step = 0 | 1 | 2 | 3

const STEP_BUTTON =
  'inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20'

// Memoized: each card renders several Markdown blocks and highlighted code, and the page
// re-renders on every filter keystroke — unchanged cards shouldn't pay for that.
export const DsaProblemCard = memo(function DsaProblemCard({
  problem,
  index,
  topicName,
  patternName,
  sections,
  languages,
  studyMode,
  onPractice,
}: DsaProblemCardProps) {
  const [step, setStep] = useState<Step>(0)
  const [open, setOpen] = useState(true)
  const bodyId = `${problem.slug}-body`
  const visible = studyMode ? step : 3
  const showTime = sections.has('time') && visible >= 3
  const showSpace = sections.has('space') && visible >= 3
  const canPractice = Boolean(onPractice && problem.practice)

  const hasAnswerStep = sections.has('answer') || sections.has('explanation')
  const hasSolutionStep = ['brute', 'optimal', 'alternate', 'time', 'space'].some((s) => sections.has(s as DsaSection))
  const nextStep: { step: Step; label: string } | null =
    visible === 0
      ? { step: 1, label: 'Show hint' }
      : visible === 1 && hasAnswerStep
        ? { step: 2, label: 'Show answer' }
        : visible <= 2 && hasSolutionStep
          ? { step: 3, label: 'Show solutions' }
          : null

  return (
    <article
      id={problem.slug}
      className="flex scroll-mt-20 flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls={bodyId}
              className="group flex items-start gap-2 text-left"
            >
              <ChevronDown
                className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:text-slate-600 dark:group-hover:text-slate-300 ${
                  open ? '' : '-rotate-90'
                }`}
                aria-hidden="true"
              />
              <span>
                <span className="mr-2 text-slate-400 dark:text-slate-500">{index}.</span>
                {problem.title}
              </span>
            </button>
          </h2>
          {canPractice && (
            <button
              type="button"
              onClick={() => onPractice!(problem.slug)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
              aria-label={`Practice ${problem.title} in the code editor`}
              title="Practice in the code editor"
            >
              <SquareTerminal className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Practice</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.is_frequently_asked && <FaqBadge />}
            {topicName && <span className="text-xs text-slate-500 dark:text-slate-400">{topicName}</span>}
          </div>
          <StudyActions item={dsaRef(problem)} size="sm" />
        </div>
      </header>

      {/* Hidden rather than unmounted, so collapsing keeps the reveal step and loaded code. */}
      <div id={bodyId} hidden={!open} className={`${open ? 'flex' : 'hidden'} flex-col gap-5`}>
        {sections.has('question') && (
          <Section label="Question">
            <Markdown content={problem.question} />
          </Section>
        )}

        {studyMode && visible >= 1 && (
          <Section label="Hint">
            <div className="flex flex-col gap-1 rounded-md border-l-4 border-violet-500 bg-violet-50/60 px-4 py-2 text-sm text-slate-700 dark:bg-violet-500/5 dark:text-slate-300">
              {patternName && (
                <p>
                  <span className="font-medium">Pattern:</span> {patternName}
                </p>
              )}
              {problem.tags && problem.tags.length > 0 && (
                <p>
                  <span className="font-medium">Think about:</span> {problem.tags.join(', ')}
                </p>
              )}
              {problem.practice && (
                <p className="text-slate-500 dark:text-slate-400">
                  Try coding it in the Practice editor before peeking.
                </p>
              )}
            </div>
          </Section>
        )}

        {visible >= 2 && sections.has('answer') && (
          <Section label="Answer">
            <div className="rounded-md border-l-4 border-blue-500 bg-blue-50/60 px-4 py-2 dark:bg-blue-500/5">
              <Markdown content={problem.answer} />
            </div>
          </Section>
        )}

        {visible >= 2 && sections.has('explanation') && (
          <Section label="Explanation">
            <Markdown content={problem.explanation} />
          </Section>
        )}

        {(showTime || showSpace) && (
          <Section label={showTime && showSpace ? 'Complexity' : showTime ? 'Time Complexity' : 'Space Complexity'}>
            <DsaComplexityTable solutions={problem.solutions} showTime={showTime} showSpace={showSpace} />
          </Section>
        )}

        {visible >= 3 &&
          SOLUTION_SECTIONS.filter(({ type }) => sections.has(type)).map(({ type, label }) => {
            const solutions = problem.solutions.filter((solution) => solution.type === type)
            if (solutions.length === 0) return null
            return (
              <Section key={type} label={label}>
                <div className="flex flex-col gap-6">
                  {solutions.map((solution) => (
                    <DsaSolutionView key={solution.name} solution={solution} languages={languages} />
                  ))}
                </div>
              </Section>
            )
          })}

        {studyMode && nextStep && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" onClick={() => setStep(nextStep.step)} className={STEP_BUTTON}>
              {nextStep.step === 1 ? (
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
              {nextStep.label}
            </button>
            {nextStep.step < 3 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm text-slate-500 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
              >
                Reveal everything
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
})
