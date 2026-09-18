import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CheatsheetItem } from '@/types/database'
import { QuestionCode } from '@/components/question/QuestionCode'
import type { CheatsheetMode } from './CheatsheetModeToggle'

interface CheatsheetItemCardProps {
  item: CheatsheetItem
  mode: CheatsheetMode
}

export function CheatsheetItemCard({ item, mode }: CheatsheetItemCardProps) {
  const [expanded, setExpanded] = useState(mode === 'explanation')

  useEffect(() => {
    setExpanded(mode === 'explanation')
  }, [mode])

  const showDetails = mode === 'explanation' || expanded
  const isAccordion = mode === 'normal'

  return (
    <div
      className={`flex flex-col rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${
        isAccordion && expanded ? 'col-span-full' : ''
      }`}
    >
      {isAccordion ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="flex flex-col gap-0.5 px-3 py-2 text-left"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">{item.name}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </span>
          {!expanded && item.syntax && (
            <span className="truncate font-mono text-xs text-slate-400 dark:text-slate-500">{item.syntax}</span>
          )}
        </button>
      ) : (
        <h3 className="px-4 pt-4 font-mono text-base font-semibold text-slate-900 dark:text-white">{item.name}</h3>
      )}

      {showDetails && (
        <div className={`flex flex-col gap-3 ${isAccordion ? 'px-3 pb-3' : 'p-4 pt-3'}`}>
          {item.description && <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>}

          {item.syntax && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Syntax</p>
              <code className="mt-0.5 block whitespace-pre-wrap break-words rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {item.syntax}
              </code>
            </div>
          )}

          {item.parameters && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Parameters
              </p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{item.parameters}</p>
            </div>
          )}

          {item.returns && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Returns</p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{item.returns}</p>
            </div>
          )}

          {item.example && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Example
              </p>
              <QuestionCode code={item.example} language={item.code_language} wrap />
            </div>
          )}

          {item.notes && (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              {item.notes}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
