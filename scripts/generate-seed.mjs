#!/usr/bin/env node
/**
 * Generates supabase/seed-frontend.sql from the JSON question banks under
 * scripts/seed-data/<language>/<topic>.json.
 *
 * Each topic file is a plain JSON array of question objects (see
 * scripts/seed-data/README.md for the schema). This script assigns slugs and
 * display_order deterministically, validates the data, and emits a single
 * idempotent SQL file using the same upsert-by-slug pattern as supabase/seed.sql,
 * so it can be re-run safely any time the JSON source files change.
 *
 * Usage: node scripts/generate-seed.mjs
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'seed-data')
const OUTPUT_FILE = join(__dirname, '..', 'supabase', 'seed-frontend.sql')

// New batches start numbering at 101 so they can never collide with the
// original hand-written 001-005 questions per topic in supabase/seed.sql,
// and leave 006-100 free for manual additions later without regenerating.
const START_INDEX = 101

const DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const VALID_CODE_LANGUAGES = new Set([
  'java',
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'sql',
  'html',
  'css',
  null,
  undefined,
])

function sqlString(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return 'null'
  return `ARRAY[${tags.map((t) => sqlString(t)).join(',')}]::text[]`
}

function sqlBool(value) {
  return value ? 'true' : 'false'
}

function pad(n) {
  return String(n).padStart(3, '0')
}

function validateEntry(entry, context) {
  const errors = []
  if (typeof entry.question !== 'string' || entry.question.trim().length < 5) {
    errors.push('question must be a non-trivial string')
  }
  if (typeof entry.answer !== 'string' || entry.answer.trim().length < 20) {
    errors.push('answer must be a non-trivial string')
  }
  if (!DIFFICULTIES.has(entry.difficulty)) {
    errors.push(`difficulty must be one of easy|medium|hard, got ${JSON.stringify(entry.difficulty)}`)
  }
  if (entry.example !== undefined && entry.example !== null && typeof entry.example !== 'string') {
    errors.push('example must be a string or null')
  }
  if (entry.code !== undefined && entry.code !== null && typeof entry.code !== 'string') {
    errors.push('code must be a string or null')
  }
  if (entry.code && !entry.codeLanguage) {
    errors.push('codeLanguage is required whenever code is set')
  }
  if (entry.codeLanguage !== undefined && !VALID_CODE_LANGUAGES.has(entry.codeLanguage)) {
    errors.push(`unsupported codeLanguage ${JSON.stringify(entry.codeLanguage)}`)
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0 || !entry.tags.every((t) => typeof t === 'string')) {
    errors.push('tags must be a non-empty array of strings')
  }
  if (entry.isFrequentlyAsked !== undefined && typeof entry.isFrequentlyAsked !== 'boolean') {
    errors.push('isFrequentlyAsked must be a boolean when present')
  }

  if (errors.length > 0) {
    throw new Error(`Invalid entry in ${context}:\n  - ${errors.join('\n  - ')}\n  question: ${entry.question}`)
  }
}

function loadTopicFile(languageSlug, filePath) {
  const topicSlug = basename(filePath, '.json')
  const raw = readFileSync(filePath, 'utf-8')

  let entries
  try {
    entries = JSON.parse(raw)
  } catch (err) {
    throw new Error(`Failed to parse JSON in ${filePath}: ${err.message}`)
  }

  if (!Array.isArray(entries)) {
    throw new Error(`${filePath} must export a JSON array`)
  }

  const seenQuestions = new Set()
  entries.forEach((entry, index) => {
    validateEntry(entry, `${filePath} [index ${index}]`)
    const key = entry.question.trim().toLowerCase()
    if (seenQuestions.has(key)) {
      throw new Error(`Duplicate question within ${filePath}: "${entry.question}"`)
    }
    seenQuestions.add(key)
  })

  return entries.map((entry, index) => ({
    languageSlug,
    topicSlug,
    slug: `${languageSlug}-${topicSlug}-${pad(START_INDEX + index)}`,
    displayOrder: START_INDEX + index,
    ...entry,
  }))
}

function loadLanguage(languageSlug) {
  const dir = join(DATA_DIR, languageSlug)
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((file) => loadTopicFile(languageSlug, join(dir, file)))
}

function buildValuesRow(row) {
  const cols = [
    sqlString(row.languageSlug),
    sqlString(row.topicSlug),
    sqlString(row.slug),
    sqlString(row.question),
    sqlString(row.answer),
    sqlString(row.example ?? null),
    sqlString(row.code ?? null),
    sqlString(row.codeLanguage ?? null),
    sqlString(row.difficulty),
    sqlTags(row.tags),
    sqlBool(row.isFrequentlyAsked ?? false),
    row.displayOrder,
  ]
  return `(${cols.join(',')})`
}

function main() {
  const languages = ['javascript', 'react', 'html', 'css', 'tailwind', 'nextjs', 'nodejs']
  const allRows = languages.flatMap((lang) => loadLanguage(lang))

  if (allRows.length === 0) {
    console.error('No question data found under scripts/seed-data/. Nothing to generate.')
    process.exit(1)
  }

  // Global slug uniqueness (should be automatic given the per-topic numbering, but verify).
  const slugCounts = new Map()
  for (const row of allRows) {
    slugCounts.set(row.slug, (slugCounts.get(row.slug) ?? 0) + 1)
  }
  const dupes = [...slugCounts.entries()].filter(([, count]) => count > 1)
  if (dupes.length > 0) {
    throw new Error(`Duplicate slugs generated: ${dupes.map(([slug]) => slug).join(', ')}`)
  }

  const valuesBlock = allRows.map(buildValuesRow).join(',\n')

  const sql = `-- =============================================================================
-- Interview Prep — Generated Frontend Seed Data (JavaScript + React)
-- AUTO-GENERATED by scripts/generate-seed.mjs from scripts/seed-data/**/*.json.
-- Do not hand-edit this file — edit the JSON source files and regenerate:
--   node scripts/generate-seed.mjs
--
-- Idempotent: upserts by slug, safe to re-run. Run AFTER supabase/schema.sql
-- and supabase/seed.sql (languages/topics must already exist).
-- =============================================================================

insert into public.questions (
  language_id, topic_id, slug, question, answer, example, code, code_language, difficulty, tags, is_frequently_asked, display_order
)
select l.id, t.id, v.slug, v.question, v.answer, v.example, v.code, v.code_language, v.difficulty, v.tags, v.is_frequently_asked, v.display_order
from (values
${valuesBlock}
) as v(language_slug, topic_slug, slug, question, answer, example, code, code_language, difficulty, tags, is_frequently_asked, display_order)
join public.languages l on l.slug = v.language_slug
join public.topics t on t.language_id = l.id and t.slug = v.topic_slug
on conflict (slug) do update set
  question = excluded.question,
  answer = excluded.answer,
  example = excluded.example,
  code = excluded.code,
  code_language = excluded.code_language,
  difficulty = excluded.difficulty,
  tags = excluded.tags,
  is_frequently_asked = excluded.is_frequently_asked,
  display_order = excluded.display_order,
  topic_id = excluded.topic_id,
  language_id = excluded.language_id;
`

  writeFileSync(OUTPUT_FILE, sql, 'utf-8')

  console.log(`Wrote ${allRows.length} questions to ${OUTPUT_FILE}\n`)
  for (const lang of languages) {
    const langRows = allRows.filter((r) => r.languageSlug === lang)
    if (langRows.length === 0) continue
    console.log(`${lang}: ${langRows.length} total`)
    const byTopic = new Map()
    for (const row of langRows) {
      byTopic.set(row.topicSlug, (byTopic.get(row.topicSlug) ?? 0) + 1)
    }
    for (const [topic, count] of byTopic) {
      console.log(`  ${topic}: ${count}`)
    }
  }
}

main()
