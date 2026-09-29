import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Flame, History, RotateCcw } from 'lucide-react'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { useAsync } from '@/hooks/useAsync'
import { useProgress } from '@/hooks/useProgress'
import { countByStatus, getDueReviews, getStreak, localDay } from '@/lib/progress'
import { getQuestionIndex } from '@/services/studyService'
import { pickForDay } from '@/utils/study'

function QuestionOfTheDay() {
  const { data } = useAsync(() => getQuestionIndex(), [])
  const today = pickForDay(data ?? [], localDay())
  if (!today) return null

  return (
    <Link
      to={`/questions/${today.slug}`}
      className="group flex flex-col gap-3 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 transition-colors hover:border-blue-400 dark:border-blue-900 dark:from-blue-500/10 dark:to-slate-900 dark:hover:border-blue-700"
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Question of the day
      </span>
      <p className="font-medium text-slate-900 dark:text-white">{today.question}</p>
      <span className="mt-auto flex items-center justify-between gap-2">
        <DifficultyBadge difficulty={today.difficulty} />
        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
          Try it
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </span>
    </Link>
  )
}

/** Home-page learning dashboard: continue, due reviews, streak, and the question of the day. */
export function HomeStudyPanel() {
  const progress = useProgress()
  const recent = progress.recent.slice(0, 3)
  const due = getDueReviews(progress).length
  const streak = getStreak(progress)
  const learned = countByStatus(progress, 'learned')
  const solved = countByStatus(progress, 'solved')
  const hasProgress = recent.length > 0 || learned > 0 || solved > 0 || due > 0

  return (
    <section aria-labelledby="your-learning-heading" className="grid gap-4 lg:grid-cols-3">
      <h2 id="your-learning-heading" className="sr-only">
        Your learning
      </h2>
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        {hasProgress ? (
          <>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
              <span>
                <strong className="text-slate-900 dark:text-white">{learned}</strong> learned
              </span>
              <span>
                <strong className="text-slate-900 dark:text-white">{solved}</strong> solved
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
                <strong className="text-slate-900 dark:text-white">{streak}</strong> day streak
              </span>
              <Link to="/progress" className="ml-auto font-medium text-blue-600 hover:underline dark:text-blue-400">
                My progress
              </Link>
            </div>

            {due > 0 && (
              <Link
                to="/study?mode=review"
                className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
              >
                <span className="inline-flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {due} card{due === 1 ? '' : 's'} due for review
                </span>
                <span className="font-medium">Review now →</span>
              </Link>
            )}

            {recent.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <History className="h-3.5 w-3.5" aria-hidden="true" />
                  Continue where you left off
                </h3>
                <ul className="flex flex-col gap-1">
                  {recent.map((item) => (
                    <li key={`${item.kind}:${item.slug}`}>
                      <Link
                        to={item.href}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {item.kind === 'dsa' ? 'DSA' : 'Q&A'}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">How to use this site</h3>
            <ol className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              {[
                ['Pick a path', 'Follow the Roadmap, topic by topic, or jump into any technology.'],
                ['Think first', 'Answers stay hidden until you reveal them. Say your answer, then check.'],
                ['Track it', 'Mark questions Learned or Needs review, and bookmark the ones you want to keep.'],
                ['Test yourself', 'Use flashcards, timed mock interviews and the review queue in Study.'],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{title}.</strong> {text}
                  </span>
                </li>
              ))}
            </ol>
            <Link to="/roadmap" className="w-fit text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              Start with the roadmap →
            </Link>
          </div>
        )}
      </div>

      <QuestionOfTheDay />
    </section>
  )
}
