import type { DsaSolution } from '@/types/database'
import { SOLUTION_TYPE_LABELS } from '@/utils/dsa'

interface DsaComplexityTableProps {
  solutions: DsaSolution[]
  showTime: boolean
  showSpace: boolean
}

export function DsaComplexityTable({ solutions, showTime, showSpace }: DsaComplexityTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Approach
            </th>
            {showTime && (
              <th scope="col" className="px-3 py-2 font-medium">
                Time
              </th>
            )}
            {showSpace && (
              <th scope="col" className="px-3 py-2 font-medium">
                Space
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {solutions.map((solution) => (
            <tr key={`${solution.type}-${solution.name}`}>
              <th scope="row" className="px-3 py-2 font-normal text-slate-700 dark:text-slate-300">
                <span className="font-medium">{SOLUTION_TYPE_LABELS[solution.type]}</span>
                <span className="text-slate-500 dark:text-slate-400"> — {solution.name}</span>
              </th>
              {showTime && <td className="px-3 py-2 font-mono text-slate-900 dark:text-white">{solution.time}</td>}
              {showSpace && <td className="px-3 py-2 font-mono text-slate-900 dark:text-white">{solution.space}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
