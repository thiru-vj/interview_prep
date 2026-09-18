# Seed data source files

Each `scripts/seed-data/<language-slug>/<topic-slug>.json` file is a plain JSON array of question objects for that language + topic. `<topic-slug>` must match an existing row in the `topics` table (see `supabase/seed.sql`) for that language.

Run `node scripts/generate-seed.mjs` after editing any of these files to regenerate `supabase/seed-frontend.sql`.

## Schema

```jsonc
{
  // The interview question itself. A real, specific, commonly-asked question — not a vague prompt.
  "question": "What is the difference between throttling and debouncing?",

  // 2-5 sentences. Accurate, interview-friendly, concise. No markdown headings needed
  // (plain prose renders fine), but backtick `code` spans and **bold** are fine to use sparingly.
  "answer": "Throttling ensures a function runs at most once per time interval... Debouncing delays...",

  // Optional. A one-line illustrative snippet or clarifying note. null if not needed.
  "example": null,

  // Optional. A short, runnable code block (a few lines). null if not needed.
  "code": "function debounce(fn, delay) {\n  let timer;\n  ...\n}",

  // Required whenever "code" is set. One of: java | javascript | typescript | jsx | tsx | sql
  "codeLanguage": "javascript",

  // One of: easy | medium | hard
  "difficulty": "medium",

  // Non-empty array of lowercase-kebab tags. Always include the language slug as one tag.
  "tags": ["javascript", "performance"],

  // Optional, defaults to false. Mark true only for genuinely common/classic interview questions
  // (aim for roughly 1 in 8 entries in a file, not more).
  "isFrequentlyAsked": false,
}
```

## Content rules

- **Real questions only.** Every entry must be something an interviewer would plausibly ask. No filler, no padding, no restating the same question with trivial wording changes.
- **No duplicates** — within a file, across files in the same language, or against the language's existing questions already in `supabase/seed.sql`.
- **Concise answers.** 2-5 sentences. Long enough to actually explain the concept, short enough to revise quickly. Avoid textbook-length essays.
- **Vary the sub-topics.** Don't cluster 10 near-identical questions about one narrow API — spread across the real breadth of the topic.
- **Vary difficulty.** Aim for roughly 35% easy, 45% medium, 20% hard per file.
- **Code/example are optional but common.** Aim for roughly 40-50% of entries having a `code` block where it genuinely clarifies the answer (not forced on every entry).
- **Valid JSON.** No trailing commas, no comments, double-quoted strings, UTF-8.
