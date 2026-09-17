import type { QuestionWithContext } from '@/types/database'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Markdown } from '@/components/common/Markdown'
import { QuestionCode } from './QuestionCode'

interface QuestionDetailProps {
  question: QuestionWithContext
}

export function QuestionDetail({ question }: QuestionDetailProps) {
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
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{question.question}</h1>
      </header>

      <section aria-labelledby="answer-heading" className="flex flex-col gap-3">
        <h2
          id="answer-heading"
          className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
        >
          Answer
        </h2>
        <Markdown content={question.answer} />
      </section>

      {question.example && (
        <section aria-labelledby="example-heading" className="flex flex-col gap-3">
          <h2
            id="example-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            Example
          </h2>
          <Markdown content={question.example} />
        </section>
      )}

      {question.code && (
        <section aria-labelledby="code-heading" className="flex flex-col gap-3">
          <h2
            id="code-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            Code Example
          </h2>
          <QuestionCode code={question.code} language={question.code_language} />
        </section>
      )}

      {question.tags && question.tags.length > 0 && (
        <section aria-labelledby="tags-heading" className="flex flex-col gap-3">
          <h2
            id="tags-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
