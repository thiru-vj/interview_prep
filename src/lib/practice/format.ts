import type { DsaPractice } from '@/types/database'

/** Compact, LeetCode-style rendering of a JSON value: `[2,7,11,15]`, `"abc"`, `true`. */
export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  return JSON.stringify(value) ?? String(value)
}

export interface LabelledValue {
  label: string
  value: string
}

/** Human-readable input lines for a test case, e.g. `nums = [2,7,11,15]`. */
export function formatInput(spec: DsaPractice, args: unknown[]): LabelledValue[] {
  if (spec.cls) {
    const calls = (args as unknown[][]).map(([op, ...rest]) => {
      const name = op === 'new' ? spec.cls : String(op)
      return `${name}(${rest.map(formatValue).join(', ')})`
    })
    return [{ label: 'calls', value: calls.join('\n') }]
  }
  return args.map((arg, i) => {
    const label = spec.params[i] ?? `arg${i + 1}`
    if (spec.opts?.in?.[i] === 'cycle' && Array.isArray(arg)) {
      return { label, value: `${formatValue(arg[0])}, pos = ${formatValue(arg[1])}` }
    }
    return { label, value: formatValue(arg) }
  })
}

/** Output for display; design problems show one result per call. */
export function formatOutput(spec: DsaPractice, value: unknown): string {
  if (spec.cls && Array.isArray(value)) return value.map(formatValue).join('\n')
  return formatValue(value)
}

/** Placeholder hint for a custom-input field, explaining non-obvious formats. */
export function inputHint(spec: DsaPractice, index: number): string | undefined {
  const type = spec.opts?.in?.[index]
  if (spec.opts?.intersect) {
    return ['values unique to list A', 'values unique to list B', 'values of the shared tail'][index]
  }
  switch (type) {
    case 'list':
      return 'linked list as an array, e.g. [1,2,3]'
    case 'lists':
      return 'array of linked lists, e.g. [[1,4],[2,3]]'
    case 'tree':
      return 'level order with nulls, e.g. [3,9,20,null,null,15,7]'
    case 'cycle':
      return '[values, pos] — pos is where the tail links back (-1 = no cycle)'
    case 'node':
      return 'the node’s value'
    case 'graph':
      return '1-indexed adjacency list, e.g. [[2,4],[1,3],[2,4],[1,3]]'
    default:
      return undefined
  }
}
