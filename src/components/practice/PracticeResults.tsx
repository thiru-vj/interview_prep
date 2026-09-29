import { useState } from 'react'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { DsaPractice } from '@/types/database'
import type { RunResult } from '@/lib/practice/runner'
import { formatInput, formatOutput } from '@/lib/practice/format'

interface PracticeResultsProps {
  spec: DsaPractice
  result: RunResult
  custom: boolean
}

function Block({ label, children, tone = 'default' }: { label: string; children: string; tone?: 'default' | 'error' }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <pre
        className={`overflow-x-auto whitespace-pre-wrap break-all rounded-md px-3 py-2 font-mono text-[13px] ${
          tone === 'error'
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
        }`}
      >
        {children}
      </pre>
    </div>
  )
}

export function PracticeResults({ spec, result, custom }: PracticeResultsProps) {
  const firstFailure = result.cases.findIndex((c) => c.passed === false)
  const [selected, setSelected] = useState(Math.max(0, firstFailure))

  if (result.status !== 'ok') {
    return (
      <div className="flex flex-col gap-3" role="status">
        <p className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
          {result.status === 'timeout' ? (
            <Clock className="h-4 w-4" aria-hidden="true" />
          ) : (
            <XCircle className="h-4 w-4" aria-hidden="true" />
          )}
          {result.status === 'timeout' ? 'Time Limit Exceeded' : 'Error'}
        </p>
        <Block label="Details" tone="error">
          {result.error ?? 'Unknown error'}
        </Block>
        {result.logs.length > 0 && <Block label="Output (stdout)">{result.logs.join('\n')}</Block>}
      </div>
    )
  }

  const passed = result.cases.filter((c) => c.passed).length
  const total = result.cases.length
  const allPassed = passed === total
  const hasRuntimeError = result.cases.some((c) => c.error)
  const current = result.cases[Math.min(selected, total - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1" role="status">
        {custom ? (
          <p className="font-semibold text-slate-900 dark:text-white">
            {current?.passed === undefined ? 'Ran' : current.passed ? 'Matches expected' : 'Differs from expected'}
          </p>
        ) : (
          <p
            className={`flex items-center gap-2 font-semibold ${
              allPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {allPassed ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <XCircle className="h-4 w-4" aria-hidden="true" />
            )}
            {allPassed ? 'Accepted' : hasRuntimeError ? 'Runtime Error' : 'Wrong Answer'} — {passed} / {total} test
            cases passed
          </p>
        )}
        <span className="text-xs text-slate-500 dark:text-slate-400">{result.durationMs} ms</span>
      </div>

      {total > 1 && (
        <div role="tablist" aria-label="Test cases" className="flex flex-wrap gap-2">
          {result.cases.map((c, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === selected}
              onClick={() => setSelected(i)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                i === selected
                  ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${c.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                aria-hidden="true"
              />
              Case {i + 1}
              <span className="sr-only">{c.passed ? '(passed)' : '(failed)'}</span>
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="flex flex-col gap-3">
          {formatInput(spec, current.input).map((line) => (
            <Block key={line.label} label={line.label}>
              {line.value}
            </Block>
          ))}
          {current.error ? (
            <Block label="Error" tone="error">
              {current.error}
            </Block>
          ) : (
            <Block label="Your output">{formatOutput(spec, current.actual)}</Block>
          )}
          {'expected' in current && <Block label="Expected">{formatOutput(spec, current.expected)}</Block>}
        </div>
      )}

      {result.logs.length > 0 && <Block label="Output (stdout)">{result.logs.join('\n')}</Block>}
    </div>
  )
}
