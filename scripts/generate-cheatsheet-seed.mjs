#!/usr/bin/env node
/**
 * Generates supabase/seed-cheatsheets-items.sql from the JSON cheatsheet
 * banks under scripts/seed-data-cheatsheets/<technology>/<category>.json.
 *
 * Each category file is a plain JSON array of item objects (see
 * scripts/seed-data-cheatsheets/README.md for the schema). This script assigns
 * slugs and display_order deterministically, validates the data, and emits a
 * single idempotent SQL file using the same upsert-by-slug pattern as
 * supabase/seed-cheatsheets.sql, so it can be re-run safely any time the JSON
 * source files change.
 *
 * Usage: node scripts/generate-cheatsheet-seed.mjs
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'seed-data-cheatsheets')
const OUTPUT_FILE = join(__dirname, '..', 'supabase', 'seed-cheatsheets-items.sql')

const START_INDEX = 1

const VALID_CODE_LANGUAGES = new Set(['java', 'javascript', 'typescript', 'jsx', 'tsx', 'sql', 'html', 'css', null, undefined])

function sqlString(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return 'null'
  return `ARRAY[${tags.map((t) => sqlString(t)).join(',')}]::text[]`
}

function pad(n) {
  return String(n).padStart(3, '0')
}

function validateEntry(entry, context) {
  const errors = []
  if (typeof entry.name !== 'string' || entry.name.trim().length < 1) {
    errors.push('name must be a non-empty string')
  }
  if (typeof entry.description !== 'string' || entry.description.trim().length < 10) {
    errors.push('description must be a non-trivial string')
  }
  if (entry.syntax !== undefined && entry.syntax !== null && typeof entry.syntax !== 'string') {
    errors.push('syntax must be a string or null')
  }
  if (entry.parameters !== undefined && entry.parameters !== null && typeof entry.parameters !== 'string') {
    errors.push('parameters must be a string or null')
  }
  if (entry.returns !== undefined && entry.returns !== null && typeof entry.returns !== 'string') {
    errors.push('returns must be a string or null')
  }
  if (entry.example !== undefined && entry.example !== null && typeof entry.example !== 'string') {
    errors.push('example must be a string or null')
  }
  if (entry.example && !entry.codeLanguage) {
    errors.push('codeLanguage is required whenever example is set')
  }
  if (entry.codeLanguage !== undefined && !VALID_CODE_LANGUAGES.has(entry.codeLanguage)) {
    errors.push(`unsupported codeLanguage ${JSON.stringify(entry.codeLanguage)}`)
  }
  if (entry.notes !== undefined && entry.notes !== null && typeof entry.notes !== 'string') {
    errors.push('notes must be a string or null')
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0 || !entry.tags.every((t) => typeof t === 'string')) {
    errors.push('tags must be a non-empty array of strings')
  }

  if (errors.length > 0) {
    throw new Error(`Invalid entry in ${context}:\n  - ${errors.join('\n  - ')}\n  name: ${entry.name}`)
  }
}

function loadCategoryFile(technologySlug, filePath) {
  const categorySlug = basename(filePath, '.json')
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

  const seenNames = new Set()
  entries.forEach((entry, index) => {
    validateEntry(entry, `${filePath} [index ${index}]`)
    const key = entry.name.trim().toLowerCase()
    if (seenNames.has(key)) {
      throw new Error(`Duplicate name within ${filePath}: "${entry.name}"`)
    }
    seenNames.add(key)
  })

  return entries.map((entry, index) => ({
    technologySlug,
    categorySlug,
    slug: `${technologySlug}-${categorySlug}-${pad(START_INDEX + index)}`,
    displayOrder: START_INDEX + index,
    ...entry,
  }))
}

function loadTechnology(technologySlug) {
  const dir = join(DATA_DIR, technologySlug)
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((file) => loadCategoryFile(technologySlug, join(dir, file)))
}

function buildValuesRow(row) {
  const cols = [
    sqlString(row.technologySlug),
    sqlString(row.categorySlug),
    sqlString(row.slug),
    sqlString(row.name),
    sqlString(row.syntax ?? null),
    sqlString(row.description),
    sqlString(row.parameters ?? null),
    sqlString(row.returns ?? null),
    sqlString(row.example ?? null),
    sqlString(row.codeLanguage ?? null),
    sqlString(row.notes ?? null),
    sqlTags(row.tags),
    row.displayOrder,
  ]
  return `(${cols.join(',')})`
}

function main() {
  const technologies = ['javascript', 'html', 'css', 'react', 'redux', 'zustand', 'dom']
  const allRows = technologies.flatMap((tech) => loadTechnology(tech))

  if (allRows.length === 0) {
    console.error('No cheatsheet data found under scripts/seed-data-cheatsheets/. Nothing to generate.')
    process.exit(1)
  }

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
-- Interview Prep — Generated Cheatsheet Item Seed Data
-- AUTO-GENERATED by scripts/generate-cheatsheet-seed.mjs from scripts/seed-data-cheatsheets/**/*.json.
-- Do not hand-edit this file — edit the JSON source files and regenerate:
--   node scripts/generate-cheatsheet-seed.mjs
--
-- Idempotent: upserts by slug, safe to re-run. Run AFTER supabase/schema.sql
-- and supabase/seed-cheatsheets.sql (technologies/categories must already exist).
-- =============================================================================

insert into public.cheatsheet_items (
  technology_id, category_id, slug, name, syntax, description, parameters, returns, example, code_language, notes, tags, display_order
)
select t.id, c.id, v.slug, v.name, v.syntax, v.description, v.parameters, v.returns, v.example, v.code_language, v.notes, v.tags, v.display_order
from (values
${valuesBlock}
) as v(technology_slug, category_slug, slug, name, syntax, description, parameters, returns, example, code_language, notes, tags, display_order)
join public.cheatsheet_technologies t on t.slug = v.technology_slug
join public.cheatsheet_categories c on c.technology_id = t.id and c.slug = v.category_slug
on conflict (slug) do update set
  name = excluded.name,
  syntax = excluded.syntax,
  description = excluded.description,
  parameters = excluded.parameters,
  returns = excluded.returns,
  example = excluded.example,
  code_language = excluded.code_language,
  notes = excluded.notes,
  tags = excluded.tags,
  display_order = excluded.display_order,
  category_id = excluded.category_id,
  technology_id = excluded.technology_id;
`

  writeFileSync(OUTPUT_FILE, sql, 'utf-8')

  console.log(`Wrote ${allRows.length} cheatsheet items to ${OUTPUT_FILE}\n`)
  for (const tech of technologies) {
    const techRows = allRows.filter((r) => r.technologySlug === tech)
    if (techRows.length === 0) continue
    console.log(`${tech}: ${techRows.length} total`)
    const byCategory = new Map()
    for (const row of techRows) {
      byCategory.set(row.categorySlug, (byCategory.get(row.categorySlug) ?? 0) + 1)
    }
    for (const [category, count] of byCategory) {
      console.log(`  ${category}: ${count}`)
    }
  }
}

main()
