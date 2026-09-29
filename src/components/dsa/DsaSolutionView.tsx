import type { DsaCodeLanguage, DsaSolution, DsaSolutionType } from '@/types/database'
import { Markdown } from '@/components/common/Markdown'
import { DsaLazyCode } from './DsaLazyCode'
import { SOLUTION_TYPE_LABELS } from '@/utils/dsa'

const TYPE_STYLES: Record<DsaSolutionType, string> = {
  brute: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  optimal: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  alternate: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
}

interface DsaSolutionViewProps {
  solution: DsaSolution
  languages: DsaCodeLanguage[]
}

export function DsaSolutionView({ solution, languages }: DsaSolutionViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${TYPE_STYLES[solution.type]}`}
        >
          {SOLUTION_TYPE_LABELS[solution.type]}
        </span>
        <h4 className="font-medium text-slate-900 dark:text-white">{solution.name}</h4>
      </div>
      {solution.description && <Markdown content={solution.description} />}
      <div className={`grid gap-3 ${languages.length > 1 ? 'xl:grid-cols-2' : ''}`}>
        {languages.map((language) => (
          <DsaLazyCode key={language} code={solution.code[language]} language={language} />
        ))}
      </div>
    </div>
  )
}
