import { runPracticeJs } from './jsHarness'
import type { WorkerRequest, WorkerResponse } from './protocol'

// A fresh worker is created for every run (see runner.ts), so user code never shares
// state between runs and an infinite loop is stopped by terminating the worker.
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, code, spec, cases, referenceCode } = event.data
  const result = runPracticeJs(code, spec, cases, referenceCode)
  self.postMessage({ type: 'result', id, result } satisfies WorkerResponse)
}
