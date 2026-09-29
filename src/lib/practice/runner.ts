import type { DsaPractice, PracticeCase, PracticeLanguage } from '@/types/database'
import type { HarnessResult } from './jsHarness'
import type { WorkerRequest, WorkerResponse } from './protocol'

export type { CaseResult, HarnessResult } from './jsHarness'

export interface RunResult extends HarnessResult {
  status: 'ok' | 'error' | 'timeout'
  durationMs: number
}

export interface RunRequest {
  language: PracticeLanguage
  code: string
  spec: DsaPractice
  cases: PracticeCase[]
  referenceCode?: string
  /** Called if the run has to wait for the Python runtime to download (first run only). */
  onLoading?: () => void
}

const TIME_LIMIT_MS: Record<PracticeLanguage, number> = { javascript: 5_000, python: 10_000 }

let pythonWorker: Worker | null = null
let pythonReady: Promise<void> | null = null
let pythonLoaded = false
let nextId = 1

function resetPython() {
  pythonWorker?.terminate()
  pythonWorker = null
  pythonReady = null
  pythonLoaded = false
}

function getPythonWorker(): { worker: Worker; ready: Promise<void> } {
  if (!pythonWorker || !pythonReady) {
    const worker = new Worker(new URL('./pythonRunner.worker.ts', import.meta.url), { type: 'module' })
    const ready = new Promise<void>((resolve, reject) => {
      const onMessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === 'ready') resolve()
        else if (event.data.type === 'load-error') reject(new Error(event.data.message))
        else return
        worker.removeEventListener('message', onMessage)
      }
      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', () => reject(new Error("Couldn't start the Python runtime.")), { once: true })
    })
    ready.then(
      () => (pythonLoaded = true),
      // A failed load shouldn't poison later attempts.
      () => {
        if (pythonWorker === worker) resetPython()
      },
    )
    pythonWorker = worker
    pythonReady = ready
  }
  return { worker: pythonWorker, ready: pythonReady }
}

/** Starts downloading the Python runtime ahead of the first run (e.g. when Python is selected). */
export function preloadPython() {
  getPythonWorker()
}

function execute(worker: Worker, request: WorkerRequest, timeoutMs: number) {
  return new Promise<HarnessResult | 'timeout'>((resolve) => {
    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type !== 'result' || event.data.id !== request.id) return
      clearTimeout(timer)
      worker.removeEventListener('message', onMessage)
      resolve(event.data.result)
    }
    const timer = setTimeout(() => {
      worker.removeEventListener('message', onMessage)
      resolve('timeout')
    }, timeoutMs)
    worker.addEventListener('message', onMessage)
    worker.postMessage(request)
  })
}

/** Runs code in a Web Worker against the given cases, enforcing a time limit. */
export async function runCode({
  language,
  code,
  spec,
  cases,
  referenceCode,
  onLoading,
}: RunRequest): Promise<RunResult> {
  const request: WorkerRequest = { id: nextId++, code, spec, cases, referenceCode }
  const limit = TIME_LIMIT_MS[language]
  let worker: Worker

  if (language === 'python') {
    const python = getPythonWorker()
    if (!pythonLoaded) onLoading?.()
    try {
      await python.ready
    } catch (error) {
      return { status: 'error', error: (error as Error).message, cases: [], logs: [], durationMs: 0 }
    }
    worker = python.worker
  } else {
    worker = new Worker(new URL('./jsRunner.worker.ts', import.meta.url), { type: 'module' })
  }

  const started = performance.now()
  const outcome = await execute(worker, request, limit)
  const durationMs = Math.round(performance.now() - started)
  // JavaScript workers are single-use; a Python worker is only discarded when it's stuck.
  if (language === 'javascript') worker.terminate()
  else if (outcome === 'timeout') resetPython()

  if (outcome === 'timeout') {
    return {
      status: 'timeout',
      error: `Time limit exceeded (${limit / 1000}s) — look for an infinite loop or a too-slow approach.`,
      cases: [],
      logs: [],
      durationMs,
    }
  }
  return { ...outcome, status: outcome.error ? 'error' : 'ok', durationMs }
}
