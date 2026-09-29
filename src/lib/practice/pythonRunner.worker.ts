import harnessSource from './pythonHarness.py?raw'
import type { HarnessResult } from './jsHarness'
import type { WorkerRequest, WorkerResponse } from './protocol'

// Pyodide (CPython compiled to WebAssembly) is loaded from the CDN on first use and
// cached by the browser afterwards. The worker stays alive between runs because loading
// takes a few seconds; runner.ts terminates it only on a timeout.
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/'

interface PyProxy {
  (...args: unknown[]): unknown
  destroy(): void
}

interface Pyodide {
  runPython(code: string): unknown
  globals: { get(name: string): PyProxy }
  setStdout(options: { batched: (line: string) => void }): void
  setStderr(options: { batched: (line: string) => void }): void
}

const MAX_LOG_LINES = 200
let logs: string[] = []
const capture = (line: string) => {
  if (logs.length < MAX_LOG_LINES) logs.push(line)
  else if (logs.length === MAX_LOG_LINES) logs.push('… output truncated')
}

const ready: Promise<Pyodide> = (async () => {
  const { loadPyodide } = (await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`)) as {
    loadPyodide: (options: { indexURL: string }) => Promise<Pyodide>
  }
  const pyodide = await loadPyodide({ indexURL: PYODIDE_URL })
  pyodide.setStdout({ batched: capture })
  pyodide.setStderr({ batched: capture })
  pyodide.runPython(harnessSource)
  return pyodide
})()

ready.then(
  () => self.postMessage({ type: 'ready' } satisfies WorkerResponse),
  (error: unknown) => {
    const reason = error instanceof Error ? error.message : String(error)
    const message = `Couldn't load the Python runtime (${reason}). Check your connection and try again.`
    self.postMessage({ type: 'load-error', message } satisfies WorkerResponse)
  },
)

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, code, spec, cases, referenceCode } = event.data
  const pyodide = await ready
  logs = []
  const runPractice = pyodide.globals.get('run_practice')
  let result: HarnessResult
  try {
    const json = runPractice(code, JSON.stringify(spec), JSON.stringify(cases), referenceCode ?? null) as string
    result = { ...(JSON.parse(json) as Omit<HarnessResult, 'logs'>), logs }
  } catch (error) {
    result = { error: error instanceof Error ? error.message : String(error), cases: [], logs }
  } finally {
    runPractice.destroy()
  }
  self.postMessage({ type: 'result', id, result } satisfies WorkerResponse)
}
