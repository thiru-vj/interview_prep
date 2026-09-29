import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Play, RotateCcw, X } from 'lucide-react'
import type { DsaProblem, PracticeCase, PracticeLanguage } from '@/types/database'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Markdown } from '@/components/common/Markdown'
import { usePracticeDraft } from '@/hooks/usePracticeDraft'
import { preloadPython, runCode, type RunResult } from '@/lib/practice/runner'
import { formatInput, formatOutput, formatValue, inputHint } from '@/lib/practice/format'
import { CodeEditor } from './CodeEditor'
import { PracticeResults } from './PracticeResults'

interface PracticeModalProps {
  problem: DsaProblem
  initialLanguage: PracticeLanguage
  onLanguageChange: (language: PracticeLanguage) => void
  /** Called when a run of the full test suite passes every case. */
  onSolved?: (problem: DsaProblem) => void
  onClose: () => void
}

const LANGUAGES: { value: PracticeLanguage | 'java'; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
]

type Panel = 'tests' | 'custom'

function initialCustomInput(problem: DsaProblem): string[] {
  const args = problem.practice!.cases[0].args
  // Design problems: one call per line reads better than one long array.
  if (problem.practice!.cls) return [`[\n${args.map((op) => `  ${formatValue(op)}`).join(',\n')}\n]`]
  return args.map(formatValue)
}

export default function PracticeModal({
  problem,
  initialLanguage,
  onLanguageChange,
  onSolved,
  onClose,
}: PracticeModalProps) {
  const spec = problem.practice!
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [language, setLanguage] = useState<PracticeLanguage>(initialLanguage)
  const { code, setCode, reset, isModified } = usePracticeDraft(problem.slug, language, spec.starter[language])
  const [panel, setPanel] = useState<Panel>('tests')
  const [customInput, setCustomInput] = useState(() => initialCustomInput(problem))
  const [customError, setCustomError] = useState<string | null>(null)
  const [running, setRunning] = useState<'idle' | 'loading-runtime' | 'running'>('idle')
  const [run, setRun] = useState<{ result: RunResult; custom: boolean; id: number } | null>(null)
  const [solvedNow, setSolvedNow] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      // Don't call dialog.close() here: it fires `close` → onClose, which would drop the
      // `practice` param (StrictMode re-runs this effect). Unmounting removes the dialog anyway.
    }
  }, [])

  useEffect(() => {
    if (language === 'python') preloadPython()
  }, [language])

  function selectLanguage(next: PracticeLanguage) {
    setLanguage(next)
    setRun(null)
    onLanguageChange(next)
  }

  const execute = useCallback(async () => {
    if (running !== 'idle') return
    let cases: PracticeCase[] = spec.cases
    const custom = panel === 'custom'
    if (custom) {
      try {
        const parsed = customInput.map((text, i) => {
          try {
            return JSON.parse(text) as unknown
          } catch {
            throw new Error(`${spec.cls ? 'Calls' : spec.params[i]} isn't valid JSON`)
          }
        })
        const args = spec.cls ? parsed[0] : parsed
        if (!Array.isArray(args)) throw new Error('Calls must be a JSON array of [method, ...args] entries')
        cases = [{ args }]
        setCustomError(null)
      } catch (error) {
        setCustomError((error as Error).message)
        return
      }
    }
    setRunning('running')
    const reference = problem.solutions.find((s) => s.type === 'optimal')?.code[language]
    const result = await runCode({
      language,
      code,
      spec,
      cases,
      referenceCode: custom ? reference : undefined,
      onLoading: () => setRunning('loading-runtime'),
    })
    setRun((prev) => ({ result, custom, id: (prev?.id ?? 0) + 1 }))
    setRunning('idle')
    const allPassed =
      !custom &&
      result.status === 'ok' &&
      !result.error &&
      result.cases.length > 0 &&
      result.cases.every((c) => c.passed === true)
    if (allPassed) {
      setSolvedNow(true)
      onSolved?.(problem)
    }
  }, [running, spec, panel, customInput, problem, language, code, onSolved])

  const examples = spec.cases.slice(0, 3)

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="practice-title"
      className="m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-slate-950/60 sm:m-auto sm:h-[92vh] sm:w-[min(1400px,96vw)] sm:rounded-xl"
    >
      <div className="flex h-full flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 id="practice-title" className="min-w-0 truncate text-base font-semibold">
            {problem.title}
          </h2>
          <DifficultyBadge difficulty={problem.difficulty} />
          {solvedNow && (
            <span
              role="status"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              All tests passed — marked as solved
            </span>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close practice"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] overflow-y-auto lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-1 lg:overflow-hidden">
          {/* Problem statement + examples */}
          <section
            aria-label="Problem"
            className="flex flex-col gap-5 border-b border-slate-200 p-4 dark:border-slate-800 lg:overflow-y-auto lg:border-b-0 lg:border-r"
          >
            <Markdown content={problem.question} />
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Examples</h3>
              {examples.map((example, i) => (
                <div
                  key={i}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="mb-1 font-sans text-xs font-medium text-slate-500 dark:text-slate-400">
                    Example {i + 1}
                  </p>
                  {formatInput(spec, example.args).map((line) => (
                    <p key={line.label} className="whitespace-pre-wrap break-all">
                      <span className="text-slate-500 dark:text-slate-400">{line.label} = </span>
                      {line.value}
                    </p>
                  ))}
                  <p className="mt-1 whitespace-pre-wrap break-all">
                    <span className="text-slate-500 dark:text-slate-400">output = </span>
                    {formatOutput(spec, example.expect)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Editor + results */}
          <section aria-label="Code" className="flex min-h-[640px] flex-col lg:min-h-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
              <div
                role="radiogroup"
                aria-label="Language"
                className="inline-flex gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900"
              >
                {LANGUAGES.map((option) => {
                  const disabled = option.value === 'java'
                  const active = option.value === language
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={disabled}
                      title={disabled ? 'Running Java in the browser is coming soon' : undefined}
                      onClick={() => !disabled && selectLanguage(option.value as PracticeLanguage)}
                      className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        active
                          ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      {option.label}
                      {disabled && (
                        <span className="rounded bg-slate-200 px-1 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                          Soon
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={reset}
                disabled={!isModified}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Replace your code with the starter template"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>
              <button
                type="button"
                onClick={execute}
                disabled={running !== 'idle'}
                className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-70"
                title="Run (Ctrl + Enter)"
              >
                {running === 'idle' ? (
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                )}
                {running === 'loading-runtime'
                  ? 'Loading Python…'
                  : running === 'running'
                    ? 'Running…'
                    : panel === 'custom'
                      ? 'Run custom input'
                      : 'Run tests'}
              </button>
            </div>

            <div className="min-h-[280px] flex-[3] border-b border-slate-200 dark:border-slate-800">
              <CodeEditor
                value={code}
                language={language}
                onChange={setCode}
                onRun={execute}
                label={`${problem.title} solution in ${language === 'python' ? 'Python' : 'JavaScript'}`}
              />
            </div>

            <div className="flex min-h-[220px] flex-[2] flex-col">
              <div
                role="tablist"
                aria-label="Run mode"
                className="flex gap-1 border-b border-slate-200 px-3 dark:border-slate-800"
              >
                {(
                  [
                    ['tests', `Test cases (${spec.cases.length})`],
                    ['custom', 'Custom input'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={panel === value}
                    onClick={() => setPanel(value)}
                    className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                      panel === value
                        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {panel === 'custom' && (
                  <div className="mb-4 flex flex-col gap-3">
                    {customInput.map((text, i) => {
                      const label = spec.cls
                        ? 'calls — [method, ...args] per entry; "new" is the constructor'
                        : spec.params[i]
                      const hint = spec.cls ? undefined : inputHint(spec, i)
                      return (
                        <label key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="font-mono">{label}</span>
                            {hint && <span className="font-normal"> — {hint}</span>}
                          </span>
                          <textarea
                            value={text}
                            onChange={(event) =>
                              setCustomInput((prev) => prev.map((v, j) => (j === i ? event.target.value : v)))
                            }
                            rows={spec.cls ? 6 : 1}
                            spellCheck={false}
                            className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-[13px] text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </label>
                      )
                    })}
                    {customError && <p className="text-sm text-rose-600 dark:text-rose-400">{customError}</p>}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Values are JSON. The expected output is computed with the reference solution.
                    </p>
                  </div>
                )}

                {run && run.custom === (panel === 'custom') ? (
                  <PracticeResults key={run.id} spec={spec} result={run.result} custom={run.custom} />
                ) : (
                  panel === 'tests' && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Run your code against {spec.cases.length} test cases. Press <kbd className="font-mono">Ctrl</kbd>{' '}
                      + <kbd className="font-mono">Enter</kbd> in the editor to run.
                    </p>
                  )
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </dialog>
  )
}
