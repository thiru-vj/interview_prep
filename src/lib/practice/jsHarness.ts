/**
 * Runs JavaScript practice code against a problem's test cases. Executed inside a Web
 * Worker (see jsRunner.worker.ts), never on the page itself.
 *
 * Mirrors pythonHarness.py — both must convert inputs, outputs and normalisers the same
 * way (and match the types validated by scripts/generate-dsa-seed.mjs). Deliberately has
 * no runtime imports so it can also be exercised directly from Node.
 */
import type { DsaPractice, PracticeCase, PracticeInType, PracticeNorm, PracticeOutType } from '../../types/database'

export interface CaseResult {
  input: unknown[]
  expected?: unknown
  actual?: unknown
  passed?: boolean
  error?: string
}

export interface HarnessResult {
  /** Set when the code couldn't be loaded at all (syntax error, missing function, ...). */
  error?: string
  cases: CaseResult[]
  logs: string[]
}

class ListNode {
  val: unknown
  next: ListNode | null
  constructor(val: unknown = 0, next: ListNode | null = null) {
    this.val = val
    this.next = next
  }
}

class TreeNode {
  val: unknown
  left: TreeNode | null
  right: TreeNode | null
  constructor(val: unknown = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

class Node {
  val: unknown
  neighbors: Node[]
  constructor(val: unknown = 0, neighbors: Node[] = []) {
    this.val = val
    this.neighbors = neighbors
  }
}

function toList(values: unknown[]): ListNode | null {
  const dummy = new ListNode()
  let tail = dummy
  for (const v of values) tail = tail.next = new ListNode(v)
  return dummy.next
}

function fromList(head: unknown): unknown {
  if (!(head instanceof ListNode)) return head ?? []
  const out: unknown[] = []
  // Cap the walk so a cyclic result can't hang the runner.
  for (let node: ListNode | null = head; node && out.length < 10_000; node = node.next) out.push(node.val)
  return out
}

function toTree(values: unknown[]): TreeNode | null {
  if (values.length === 0 || values[0] === null) return null
  const root = new TreeNode(values[0])
  const queue = [root]
  let i = 1
  for (let q = 0; q < queue.length && i < values.length; q++) {
    const node = queue[q]
    if (i < values.length && values[i] !== null) queue.push((node.left = new TreeNode(values[i])))
    i++
    if (i < values.length && values[i] !== null) queue.push((node.right = new TreeNode(values[i])))
    i++
  }
  return root
}

function fromTree(root: unknown): unknown {
  if (root !== null && !(root instanceof TreeNode)) return root
  const out: unknown[] = []
  const queue: (TreeNode | null)[] = [root as TreeNode | null]
  for (let q = 0; q < queue.length && out.length < 100_000; q++) {
    const node = queue[q]
    if (node) {
      out.push(node.val)
      queue.push(node.left, node.right)
    } else {
      out.push(null)
    }
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

/** `[values, pos]` → a list whose tail links back to index `pos` (-1 = no cycle). */
function toCycle(arg: unknown): ListNode | null {
  const [values, pos] = arg as [unknown[], number]
  const head = toList(values)
  if (head && pos >= 0) {
    let tail = head
    let target: ListNode = head
    for (let i = 0; tail.next; i++) {
      if (i === pos) target = tail
      tail = tail.next
    }
    if (pos === values.length - 1) target = tail
    tail.next = target
  }
  return head
}

/** 1-indexed adjacency list → the first node of a graph. */
function toGraph(adjacency: unknown): Node | null {
  const adj = adjacency as number[][]
  if (adj.length === 0) return null
  const nodes = adj.map((_, i) => new Node(i + 1))
  adj.forEach((neighbors, i) => (nodes[i].neighbors = neighbors.map((v) => nodes[v - 1])))
  return nodes[0]
}

function fromGraph(node: unknown): unknown {
  if (!(node instanceof Node)) return node ?? []
  const seen = new Map<unknown, Node>([[node.val, node]])
  const queue = [node]
  for (let q = 0; q < queue.length; q++) {
    for (const next of queue[q].neighbors ?? []) {
      if (next && !seen.has(next.val)) {
        seen.set(next.val, next)
        queue.push(next)
      }
    }
  }
  return [...seen.keys()]
    .sort((a, b) => Number(a) - Number(b))
    .map((v) => (seen.get(v)!.neighbors ?? []).map((n) => n?.val))
}

const IN: Record<PracticeInType, (v: unknown) => unknown> = {
  list: (v) => toList(v as unknown[]),
  tree: (v) => toTree(v as unknown[]),
  cycle: toCycle,
  node: (v) => new TreeNode(v),
  lists: (v) => (v as unknown[][]).map(toList),
  graph: toGraph,
}

const OUT: Record<PracticeOutType, (v: unknown) => unknown> = {
  list: fromList,
  tree: fromTree,
  val: (v) => (v && typeof v === 'object' && 'val' in v ? (v as { val: unknown }).val : null),
  graph: fromGraph,
  self: (v) => v,
}

const jsonKey = (v: unknown) => JSON.stringify(v) ?? 'undefined'
const byKey = (a: unknown, b: unknown) => {
  const ka = jsonKey(a)
  const kb = jsonKey(b)
  return ka < kb ? -1 : ka > kb ? 1 : 0
}
const sortDeep = (v: unknown): unknown => (Array.isArray(v) ? v.map(sortDeep).sort(byKey) : v)
const asArray = (v: unknown) => (Array.isArray(v) ? v : [v])

const NORMS: Record<PracticeNorm, (v: unknown) => unknown> = {
  sortDeep,
  sortOuter: (v) => [...asArray(v)].sort(byKey),
  sortFlat: (v) => [...asArray(v)].sort(byKey),
  sortInner: (v) => asArray(v).map((row) => [...asArray(row)].sort(byKey)),
  // Any palindrome of the right length is accepted.
  palin: (v) => (typeof v === 'string' ? [v.length, v === [...v].reverse().join('')] : v),
}

/** Converts a result into plain JSON data (undefined → null, cycles and functions made printable). */
function toPlain(value: unknown): unknown {
  if (value === undefined) return null
  const seen = new WeakSet<object>()
  try {
    const text = JSON.stringify(value, (_key, v: unknown) => {
      if (v === undefined) return null
      if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`
      if (typeof v === 'bigint') return Number(v)
      if (v instanceof Set) return [...v]
      if (v instanceof Map) return Object.fromEntries(v)
      if (typeof v === 'number' && !Number.isFinite(v)) return String(v)
      if (v && typeof v === 'object') {
        if (seen.has(v)) return '[Circular]'
        seen.add(v)
      }
      return v
    })
    return text === undefined ? null : JSON.parse(text)
  } catch {
    return String(value)
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return `Thrown: ${String(error)}`
}

function formatLog(args: unknown[]): string {
  return args.map((a) => (typeof a === 'string' ? a : JSON.stringify(toPlain(a)))).join(' ')
}

const MAX_LOG_LINES = 200

/** Evaluates `code` and returns the value bound to `name` (a function or class). */
function loadEntry(code: string, name: string, logs: string[]): unknown {
  const push = (...args: unknown[]) => {
    if (logs.length < MAX_LOG_LINES) logs.push(formatLog(args))
    else if (logs.length === MAX_LOG_LINES) logs.push('… output truncated')
  }
  const sandboxConsole = { log: push, info: push, warn: push, error: push, debug: push, table: push }
  const factory = new Function(
    'ListNode',
    'TreeNode',
    'Node',
    'console',
    `"use strict";\n${code}\n;return typeof ${name} !== 'undefined' ? ${name} : undefined;`,
  )
  return factory(ListNode, TreeNode, Node, sandboxConsole)
}

/** Runs one test case against a loaded function/class, returning the comparable output. */
function runCase(entry: unknown, spec: DsaPractice, rawArgs: unknown[]): unknown {
  const opts = spec.opts ?? {}

  if (spec.cls) {
    const Cls = entry as new (...args: unknown[]) => Record<string, (...args: unknown[]) => unknown>
    let instance: Record<string, (...args: unknown[]) => unknown> | undefined
    return (structuredClone(rawArgs) as unknown[][]).map(([op, ...args]) => {
      if (op === 'new') {
        instance = new Cls(...args)
        return null
      }
      if (!instance) throw new Error('The first operation must construct the class')
      const method = instance[op as string]
      if (typeof method !== 'function') throw new TypeError(`${spec.cls}.${String(op)} is not a function`)
      return method.apply(instance, args) ?? null
    })
  }

  const fn = entry as (...args: unknown[]) => unknown
  if (opts.intersect) {
    const [a, b, shared] = rawArgs as unknown[][]
    const tail = toList(shared)
    const join = (values: unknown[]) => {
      const head = toList(values)
      if (!head) return tail
      let node = head
      while (node.next) node = node.next
      node.next = tail
      return head
    }
    return OUT.val(fn(join(a), join(b)))
  }

  const args = (structuredClone(rawArgs) as unknown[]).map((a, i) => {
    const type = opts.in?.[i]
    return type ? IN[type](a) : a
  })
  const out = fn(...args)
  if (opts.mutates) return OUT[opts.mutates](args[0])
  if (opts.prefix) return [out, (args[0] as unknown[]).slice(0, Number(out))]
  return opts.out ? OUT[opts.out](out) : out
}

export function runPracticeJs(
  code: string,
  spec: DsaPractice,
  cases: PracticeCase[],
  referenceCode?: string,
): HarnessResult {
  const logs: string[] = []
  const name = spec.cls ?? spec.fn ?? ''
  const kind = spec.cls ? 'class' : 'function'

  let entry: unknown
  try {
    entry = loadEntry(code, name, logs)
  } catch (error) {
    return { error: describeError(error), cases: [], logs }
  }
  if (typeof entry !== 'function') {
    return { error: `Expected a ${kind} named "${name}" — keep the starter signature.`, cases: [], logs }
  }

  // Custom cases have no stored answer: compute it with the reference solution.
  let reference: unknown
  if (referenceCode && cases.some((c) => !('expect' in c))) {
    try {
      reference = loadEntry(referenceCode, name, [])
    } catch {
      reference = undefined
    }
  }

  const norm = spec.opts?.norm ? NORMS[spec.opts.norm] : (v: unknown) => v
  const results = cases.map((testCase): CaseResult => {
    const result: CaseResult = { input: testCase.args }
    let hasExpected = 'expect' in testCase
    if (hasExpected) {
      result.expected = testCase.expect
    } else if (typeof reference === 'function') {
      try {
        result.expected = toPlain(runCase(reference, spec, testCase.args))
        hasExpected = true
      } catch (error) {
        result.expected = `Reference solution failed: ${describeError(error)} — check the input format.`
      }
    }
    try {
      result.actual = toPlain(runCase(entry, spec, testCase.args))
    } catch (error) {
      result.error = describeError(error)
      if (hasExpected) result.passed = false
      return result
    }
    if (hasExpected) result.passed = jsonKey(norm(result.actual)) === jsonKey(norm(result.expected))
    return result
  })

  return { cases: results, logs }
}
