import type { DsaPractice, PracticeCase } from '@/types/database'
import type { HarnessResult } from './jsHarness'

export interface WorkerRequest {
  id: number
  code: string
  spec: DsaPractice
  cases: PracticeCase[]
  /** Reference solution, used to compute the expected output of custom cases. */
  referenceCode?: string
}

export type WorkerResponse =
  { type: 'result'; id: number; result: HarnessResult } | { type: 'ready' } | { type: 'load-error'; message: string }
