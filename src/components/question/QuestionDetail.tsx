import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { QuestionWithContext } from '@/types/database'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { FaqBadge } from '@/components/common/FaqBadge'
import { Markdown } from '@/components/common/Markdown'
import { RevealGate } from '@/components/study/RevealGate'
import { StudyActions } from '@/components/study/StudyActions'
import { questionRef, readingMinutes } from '@/utils/study'
import { QuestionCode } from './QuestionCode'

interface QuestionDetailProps {
  question: QuestionWithContext
  /** Whether the answer, example and code are visible (they start hidden unless auto-reveal is on). */
  revealed: boolean
  onReveal: () => void
}

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </h2>
  )
}

export function QuestionDetail({ question, revealed, onReveal }: QuestionDetailProps) {
  const minutes = readingMinutes(question.answer, question.example, question.code)

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            {question.language.name}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {question.topic.name}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
          {question.is_frequently_asked && <FaqBadge />}
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {minutes} min read
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{question.question}</h1>
        <StudyActions item={questionRef(question)} showShortcuts />
      </header>

      <RevealGate revealed={revealed} onReveal={onReveal} shortcut="Space">
        <section aria-labelledby="answer-heading" className="flex flex-col gap-3">
          <SectionHeading id="answer-heading">Answer</SectionHeading>
          <Markdown content={question.answer} />
        </section>

        {question.example && (
          <section aria-labelledby="example-heading" className="flex flex-col gap-3">
            <SectionHeading id="example-heading">Example</SectionHeading>
            <Markdown content={question.example} />
          </section>
        )}

        {question.code && (
          <section aria-labelledby="code-heading" className="flex flex-col gap-3">
            <SectionHeading id="code-heading">Code Example</SectionHeading>
            <QuestionCode code={question.code} language={question.code_language} />
          </section>
        )}
      </RevealGate>

      {question.tags && question.tags.length > 0 && (
        <section aria-labelledby="tags-heading" className="flex flex-col gap-3">
          <SectionHeading id="tags-heading">Tags</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}&page=1`}
                className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                title={`Find questions tagged “${tag}”`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
