#!/usr/bin/env node
/**
 * Generates supabase/seed-dsa.sql from the DSA problem banks under
 * scripts/seed-data-dsa/.
 *
 * - scripts/seed-data-dsa/topics.json lists the topics (name, slug, description)
 *   in display order.
 * - scripts/seed-data-dsa/<topic-slug>.md holds that topic's problems. Unlike the
 *   question/cheatsheet banks these are Markdown, not JSON — every problem carries
 *   several multi-line code solutions in three languages, which are unreadable
 *   as escaped JSON strings. See scripts/seed-data-dsa/README.md for the format.
 *
 * The script validates every problem, derives slugs from titles, and emits a
 * single idempotent SQL file (upsert by slug), so it can be re-run any time the
 * source files change.
 *
 * Usage: node scripts/generate-dsa-seed.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'seed-data-dsa')
const OUTPUT_FILE = join(__dirname, '..', 'supabase', 'seed-dsa.sql')

const DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const SOLUTION_TYPES = new Set(['brute', 'optimal', 'alternate'])
const CODE_LANGUAGES = ['javascript', 'java', 'python']
const PROBLEM_KEYS = new Set(['difficulty', 'faq', 'tags'])
const SOLUTION_KEYS = new Set(['type', 'name', 'time', 'space'])
const SECTIONS = new Set(['question', 'answer', 'explanation', 'solution', 'tests'])

// Test-case input/output conversions and result normalisers understood by the practice
// runners (src/lib/practice/jsHarness.ts and pythonHarness.py) — keep the three in sync.
const PRACTICE_IN = new Set(['list', 'tree', 'cycle', 'node', 'lists', 'graph'])
const PRACTICE_OUT = new Set(['list', 'tree', 'val', 'graph', 'self'])
const PRACTICE_NORMS = new Set(['sortDeep', 'sortOuter', 'sortFlat', 'sortInner', 'palin'])

function sqlString(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return 'null'
  return `ARRAY[${tags.map((t) => sqlString(t)).join(',')}]::text[]`
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Splits a Markdown file into `## ` problem blocks, each split into `### `
 * sections. Header detection is fence-aware, so `# comments` inside code
 * blocks (Python!) are never mistaken for headings.
 */
function splitBlocks(lines, marker) {
  const blocks = []
  let current = null
  let inFence = false
  for (const line of lines) {
    if (line.startsWith('```')) inFence = !inFence
    if (!inFence && line.startsWith(marker)) {
      current = { heading: line.slice(marker.length).trim(), lines: [] }
      blocks.push(current)
    } else if (current) {
      current.lines.push(line)
    }
  }
  return blocks
}

/** Reads leading `key: value` lines, returning them plus the remaining lines. */
function readMeta(lines, allowedKeys, context) {
  const meta = {}
  let index = 0
  while (index < lines.length && lines[index].trim() === '') index++
  while (index < lines.length) {
    const match = /^([a-z]+):\s*(.*)$/.exec(lines[index])
    if (!match || !allowedKeys.has(match[1])) break
    if (match[1] in meta) throw new Error(`${context}: duplicate "${match[1]}"`)
    meta[match[1]] = match[2].trim()
    index++
  }
  return { meta, rest: lines.slice(index) }
}

function parseSolution(lines, context) {
  const { meta, rest } = readMeta(lines, SOLUTION_KEYS, context)
  const code = {}
  const prose = []
  let fence = null

  for (const line of rest) {
    if (fence) {
      if (line.startsWith('```')) {
        if (fence.lang in code) throw new Error(`${context}: duplicate ${fence.lang} code block`)
        code[fence.lang] = fence.lines.join('\n').replace(/\s+$/, '')
        fence = null
      } else {
        fence.lines.push(line)
      }
    } else if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      if (!CODE_LANGUAGES.includes(lang)) throw new Error(`${context}: unsupported code block language "${lang}"`)
      fence = { lang, lines: [] }
    } else {
      prose.push(line)
    }
  }
  if (fence) throw new Error(`${context}: unterminated ${fence.lang} code block`)

  const errors = []
  if (!SOLUTION_TYPES.has(meta.type)) errors.push(`type must be one of ${[...SOLUTION_TYPES].join(' | ')}`)
  if (!meta.name) errors.push('name is required')
  if (!meta.time) errors.push('time is required')
  if (!meta.space) errors.push('space is required')
  for (const lang of CODE_LANGUAGES) {
    if (!code[lang]) errors.push(`missing ${lang} code block`)
  }
  if (errors.length > 0) throw new Error(`${context}:\n  - ${errors.join('\n  - ')}`)

  const description = prose.join('\n').trim()
  return {
    type: meta.type,
    name: meta.name,
    description: description || null,
    time: meta.time,
    space: meta.space,
    code: { javascript: code.javascript, java: code.java, python: code.python },
  }
}

/** camelCase → snake_case, the naming convention for Python solutions. */
export function snakeCase(name) {
  return name.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
}

function parseTests(lines, context) {
  const match = /```json\n([\s\S]*?)\n```/.exec(lines.join('\n'))
  if (!match) throw new Error(`${context}: "### Tests" needs a json code block`)
  try {
    return JSON.parse(match[1])
  } catch (err) {
    throw new Error(`${context}: invalid JSON in "### Tests": ${err.message}`)
  }
}

function paramNames(signature) {
  return signature
    .split(',')
    .map((p) => p.split('=')[0].trim())
    .filter(Boolean)
}

/** First solution signature matching `pattern` without default parameters — defaults are implementation details. */
function findSignature(solutions, lang, pattern) {
  const signatures = solutions.map((s) => pattern.exec(s.code[lang])).filter(Boolean)
  return signatures.find((m) => !m[1].includes('=')) ?? signatures[0]
}

function nodeTypesComment(spec, lang) {
  const opts = spec.opts ?? {}
  const types = new Set([...(opts.in ?? []), opts.out, opts.mutates, opts.intersect && 'list'])
  const js = lang === 'javascript'
  const lines = []
  if (['list', 'cycle', 'lists'].some((t) => types.has(t))) {
    lines.push(js ? 'ListNode { val, next } — new ListNode(val, next)' : 'ListNode: .val, .next — ListNode(val, next)')
  }
  if (['tree', 'node'].some((t) => types.has(t))) {
    lines.push(
      js
        ? 'TreeNode { val, left, right } — new TreeNode(val, left, right)'
        : 'TreeNode: .val, .left, .right — TreeNode(val, left, right)',
    )
  }
  if (types.has('graph')) {
    lines.push(
      js ? 'Node { val, neighbors } — new Node(val, neighbors)' : 'Node: .val, .neighbors — Node(val, neighbors)',
    )
  }
  if (lines.length === 0) return ''
  return js
    ? `/**\n * Provided for you:\n${lines.map((l) => ` *   ${l}`).join('\n')}\n */\n`
    : `# Provided for you:\n${lines.map((l) => `#   ${l}`).join('\n')}\n`
}

/** Starter class for design problems: the constructor plus every method the tests call, with empty bodies. */
function designStarter(spec, optimal, context) {
  const methods = [...new Set(spec.cases.flatMap((c) => c.args.map((op) => op[0])))].filter((op) => op !== 'new')

  const js = optimal.code.javascript.split('\n')
  const jsSigs = new Map()
  for (
    let i = js.findIndex((l) => l.startsWith(`class ${spec.cls} `)) + 1;
    i > 0 && i < js.length && js[i] !== '}';
    i++
  ) {
    const m = /^ {2}(\w+)\(([^)]*)\) \{/.exec(js[i])
    if (m) jsSigs.set(m[1], m[2])
  }
  const py = optimal.code.python.split('\n')
  const pySigs = new Map()
  for (
    let i = py.findIndex((l) => l === `class ${spec.cls}:` || l.startsWith(`class ${spec.cls}(`)) + 1;
    i > 0 && i < py.length;
    i++
  ) {
    if (py[i] !== '' && !py[i].startsWith(' ')) break
    const m = /^ {4}def (\w+)\(([^)]*)\):/.exec(py[i])
    if (m) pySigs.set(m[1], m[2])
  }

  const jsMethods = ['constructor', ...methods]
  const pyMethods = ['__init__', ...methods.map(snakeCase)]
  for (const m of jsMethods) if (!jsSigs.has(m)) throw new Error(`${context}: optimal JS ${spec.cls} has no ${m}()`)
  for (const m of pyMethods) if (!pySigs.has(m)) throw new Error(`${context}: optimal Python ${spec.cls} has no ${m}()`)

  return {
    javascript: [
      `class ${spec.cls} {`,
      jsMethods.map((m) => `  ${m}(${jsSigs.get(m)}) {\n    // Write your code here\n  }`).join('\n\n'),
      '}',
    ].join('\n'),
    python: [
      `class ${spec.cls}:`,
      pyMethods.map((m) => `    def ${m}(${pySigs.get(m)}):\n        pass`).join('\n\n'),
    ].join('\n'),
  }
}

/**
 * Turns a problem's "### Tests" block into the `practice` spec used by the in-browser
 * code runner: entry-point names, parameter names (to label inputs), the test cases,
 * and starter code derived from the reference solutions' signatures.
 */
function buildPractice(spec, solutions, context) {
  const opts = spec.opts ?? {}
  const errors = []
  if (!spec.fn === !spec.cls) errors.push('tests need exactly one of "fn" (function) or "cls" (design class)')
  if (!Array.isArray(spec.cases) || spec.cases.length === 0) errors.push('tests need a non-empty "cases" array')
  for (const t of opts.in ?? []) if (t !== null && !PRACTICE_IN.has(t)) errors.push(`unknown input type "${t}"`)
  for (const key of ['out', 'mutates']) {
    if (opts[key] && !PRACTICE_OUT.has(opts[key])) errors.push(`unknown ${key} type "${opts[key]}"`)
  }
  if (opts.norm && !PRACTICE_NORMS.has(opts.norm)) errors.push(`unknown norm "${opts.norm}"`)
  for (const [i, c] of (spec.cases ?? []).entries()) {
    if (!Array.isArray(c.args) || !('expect' in c)) errors.push(`case ${i} needs "args" (array) and "expect"`)
  }
  if (errors.length > 0) throw new Error(`${context} › tests:\n  - ${errors.join('\n  - ')}`)

  const ordered = [...solutions].sort((a, b) => (b.type === 'optimal') - (a.type === 'optimal'))

  if (spec.cls) {
    return { cls: spec.cls, params: [], opts, cases: spec.cases, starter: designStarter(spec, ordered[0], context) }
  }

  const py = spec.py ?? snakeCase(spec.fn)
  const jsSig = findSignature(ordered, 'javascript', new RegExp(`function ${spec.fn}\\(([^)]*)\\)`))
  const pySig = findSignature(ordered, 'python', new RegExp(`def ${py}\\(([^)]*)\\)`))
  if (!jsSig) throw new Error(`${context}: no JavaScript solution defines function ${spec.fn}`)
  if (!pySig) throw new Error(`${context}: no Python solution defines def ${py}`)

  const arity = spec.cases[0].args.length
  const params = opts.intersect ? ['listA', 'listB', 'shared'] : paramNames(jsSig[1]).slice(0, arity)
  if (params.length !== arity || spec.cases.some((c) => c.args.length !== arity)) {
    throw new Error(`${context} › tests: every case must pass ${params.length} args (${params.join(', ')})`)
  }
  const hint = opts.mutates ? ' (modify the input in place)' : ''
  const starter = {
    javascript: `${nodeTypesComment(spec, 'javascript')}function ${spec.fn}(${paramNames(jsSig[1]).join(', ')}) {\n  // Write your solution here${hint}\n}`,
    python: `${nodeTypesComment(spec, 'python')}def ${py}(${paramNames(pySig[1]).join(', ')}):\n    # Write your solution here${hint}\n    pass`,
  }
  return { fn: spec.fn, py, params, opts, cases: spec.cases, starter }
}

function parseProblem(block, file) {
  const title = block.heading
  const context = `${file} › ${title}`
  const { meta, rest } = readMeta(block.lines, PROBLEM_KEYS, context)
  const sections = splitBlocks(rest, '### ')

  const problem = {
    title,
    slug: slugify(title),
    difficulty: meta.difficulty,
    isFrequentlyAsked: meta.faq === 'true',
    tags: (meta.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    question: null,
    answer: null,
    explanation: null,
    solutions: [],
    tests: null,
  }

  for (const section of sections) {
    const name = section.heading.toLowerCase()
    if (!SECTIONS.has(name)) throw new Error(`${context}: unknown section "### ${section.heading}"`)
    if (name === 'tests') {
      if (problem.tests !== null) throw new Error(`${context}: duplicate "### Tests" section`)
      problem.tests = parseTests(section.lines, context)
    } else if (name === 'solution') {
      problem.solutions.push(parseSolution(section.lines, `${context} › solution ${problem.solutions.length + 1}`))
    } else {
      if (problem[name] !== null) throw new Error(`${context}: duplicate "### ${section.heading}" section`)
      problem[name] = section.lines.join('\n').trim()
    }
  }

  const errors = []
  if (!DIFFICULTIES.has(problem.difficulty)) errors.push('difficulty must be easy | medium | hard')
  if (meta.faq !== undefined && meta.faq !== 'true' && meta.faq !== 'false') errors.push('faq must be true or false')
  if (problem.tags.length === 0) errors.push('tags must list at least one tag')
  for (const field of ['question', 'answer', 'explanation']) {
    if (!problem[field]) errors.push(`missing "### ${field[0].toUpperCase()}${field.slice(1)}" section`)
  }
  if (!problem.solutions.some((s) => s.type === 'brute')) errors.push('needs a brute solution')
  if (problem.solutions.filter((s) => s.type === 'optimal').length !== 1)
    errors.push('needs exactly one optimal solution')
  if (errors.length > 0) throw new Error(`${context}:\n  - ${errors.join('\n  - ')}`)

  const { tests, ...fields } = problem
  return { ...fields, practice: tests ? buildPractice(tests, problem.solutions, context) : null }
}

function loadTopicFile(topicSlug) {
  const file = join(DATA_DIR, `${topicSlug}.md`)
  if (!existsSync(file)) return []
  const lines = readFileSync(file, 'utf-8').replace(/\r\n/g, '\n').split('\n')
  return splitBlocks(lines, '## ').map((block, index) => ({
    ...parseProblem(block, `${topicSlug}.md`),
    topicSlug,
    displayOrder: index + 1,
  }))
}

export function loadTopics() {
  return JSON.parse(readFileSync(join(DATA_DIR, 'topics.json'), 'utf-8'))
}

export function loadAllProblems() {
  const problems = loadTopics().flatMap((topic) => loadTopicFile(topic.slug))

  const seen = new Map()
  for (const problem of problems) {
    if (seen.has(problem.slug)) {
      throw new Error(
        `Duplicate problem "${problem.title}" in ${problem.topicSlug}.md and ${seen.get(problem.slug)}.md`,
      )
    }
    seen.set(problem.slug, problem.topicSlug)
  }
  return problems
}

function buildProblemRow(problem) {
  const cols = [
    sqlString(problem.topicSlug),
    sqlString(problem.slug),
    sqlString(problem.title),
    sqlString(problem.difficulty),
    sqlString(problem.question),
    sqlString(problem.answer),
    sqlString(problem.explanation),
    `${sqlString(JSON.stringify(problem.solutions))}::jsonb`,
    problem.practice ? `${sqlString(JSON.stringify(problem.practice))}::jsonb` : 'null::jsonb',
    sqlTags(problem.tags),
    problem.isFrequentlyAsked ? 'true' : 'false',
    problem.displayOrder,
  ]
  return `(${cols.join(',')})`
}

function main() {
  const topics = loadTopics()
  const problems = loadAllProblems()

  if (problems.length === 0) {
    console.error('No DSA problems found under scripts/seed-data-dsa/. Nothing to generate.')
    process.exit(1)
  }

  const topicRows = topics
    .map(
      (topic, index) =>
        `  (${sqlString(topic.name)}, ${sqlString(topic.slug)}, ${sqlString(topic.description)}, ${index + 1})`,
    )
    .join(',\n')

  const sql = `-- =============================================================================
-- Interview Prep — Generated DSA Seed Data (topics + problems)
-- AUTO-GENERATED by scripts/generate-dsa-seed.mjs from scripts/seed-data-dsa/.
-- Do not hand-edit this file — edit the source files and regenerate:
--   node scripts/generate-dsa-seed.mjs
--
-- Idempotent: upserts by slug, safe to re-run. Run AFTER supabase/schema.sql.
-- =============================================================================

insert into public.dsa_topics (name, slug, description, display_order)
values
${topicRows}
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

insert into public.dsa_problems (
  topic_id, slug, title, difficulty, question, answer, explanation, solutions, practice, tags, is_frequently_asked, display_order
)
select t.id, v.slug, v.title, v.difficulty, v.question, v.answer, v.explanation, v.solutions, v.practice, v.tags, v.is_frequently_asked, v.display_order
from (values
${problems.map(buildProblemRow).join(',\n')}
) as v(topic_slug, slug, title, difficulty, question, answer, explanation, solutions, practice, tags, is_frequently_asked, display_order)
join public.dsa_topics t on t.slug = v.topic_slug
on conflict (slug) do update set
  topic_id = excluded.topic_id,
  title = excluded.title,
  difficulty = excluded.difficulty,
  question = excluded.question,
  answer = excluded.answer,
  explanation = excluded.explanation,
  solutions = excluded.solutions,
  practice = excluded.practice,
  tags = excluded.tags,
  is_frequently_asked = excluded.is_frequently_asked,
  display_order = excluded.display_order;
`

  writeFileSync(OUTPUT_FILE, sql, 'utf-8')

  const faqCount = problems.filter((p) => p.isFrequentlyAsked).length
  console.log(
    `Wrote ${topics.length} topics and ${problems.length} problems (${faqCount} frequently asked) to ${OUTPUT_FILE}\n`,
  )
  for (const topic of topics) {
    const count = problems.filter((p) => p.topicSlug === topic.slug).length
    console.log(`  ${topic.slug}: ${count}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
