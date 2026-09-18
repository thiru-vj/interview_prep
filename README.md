# Interview Prep

A fast, searchable, public technical interview question reference — built with React, TypeScript, Vite, Tailwind CSS and Supabase.

No login. No signup. No user accounts. Just browse a language, pick a topic (or not), and read.

## Features

- Browse interview questions by **language/technology**, **topic**, and **difficulty**
- Global **full-text search** across question, answer, tags, language and topic
- **25 questions per page** with efficient database-level pagination (`range()`), not client-side slicing
- Difficulty filter (`All` / `Easy` / `Medium` / `Hard`) reflected in the URL, so filtered/paginated views are shareable
- Question detail pages with Markdown-rendered answers, optional example, optional syntax-highlighted code (with a copy button), and tags
- **Frequently Asked** flag — a curated/toggleable subset of "classic" questions, filterable in the URL (`?faq=true`) and shown with a badge on cards and detail pages
- **Previous / Next** navigation that stays within the user's current browsing context (a topic, or the whole language)
- Breadcrumb navigation on every page
- Light/dark theme, remembered in `localStorage`
- Fully responsive (mobile, tablet, desktop)
- Loading / error / empty states on every data-driven view
- SEO: per-page `<title>`, meta description, and canonical URL
- Public, read-only Supabase access via Row Level Security — no backend server required

This is intentionally a **reference tool**, not a course platform: no progress tracking, no accounts, no admin UI in this version (see [Future Extensibility](#future-extensibility)).

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — dev server & build
- [Tailwind CSS v4](https://tailwindcss.com/) — styling (via `@tailwindcss/vite`)
- [Supabase](https://supabase.com/) — Postgres database, RLS, JS client (content database only — no auth)
- [React Router](https://reactrouter.com/) — routing, with URL-driven pagination/filters
- [Lucide React](https://lucide.dev/) — icons
- [react-markdown](https://github.com/remarkjs/react-markdown) + `rehype-sanitize` — safe Markdown rendering for answers
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) — code blocks
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) — linting & formatting

## Project Structure

```
src/
├── components/
│   ├── layout/        Navbar, Footer, Layout (route shell)
│   ├── language/      LanguageCard, LanguageGrid
│   ├── topic/         TopicCard, TopicList
│   ├── question/      QuestionCard, QuestionList, QuestionDetail, QuestionCode, QuestionNavigation, DifficultyFilter
│   ├── search/         SearchBar
│   ├── pagination/    Pagination
│   └── common/        LoadingState, ErrorState, EmptyState, NotFoundState, ThemeToggle, DifficultyBadge,
│                       Breadcrumbs, Seo, Markdown, ScrollToTop
├── pages/              Home, Languages, Language, Topic, Question, Search, NotFound
├── hooks/               useLanguages, useLanguage, useTopics, useTopic, useQuestions (by language/topic),
│                        useQuestion, useAdjacentQuestions, useSearchQuestions, useTheme, useAsync
├── services/            languageService, topicService, questionService — the only files that talk to Supabase
├── lib/supabase.ts      Supabase client (anon key only)
├── types/database.ts    Database row types
└── utils/                pagination helpers, icon lookup

supabase/
├── schema.sql            Tables, constraints, indexes, RLS policies
├── seed.sql              Languages, topics, and the original 120 hand-written questions (idempotent)
└── seed-frontend.sql     Generated: ~300 more JavaScript + ~300 more React questions (see below)

scripts/
├── generate-seed.mjs     Reads scripts/seed-data/**/*.json → writes supabase/seed-frontend.sql
└── seed-data/            JSON question banks, one file per language/topic — edit these, not the generated SQL
```

Components never call Supabase directly — they call hooks, which call the `services/` layer. This keeps the data-access logic in one place, and makes it easy to swap or extend later.

## Local Development

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build          # type-check + production build
npm run preview        # preview the production build locally
npm run lint            # ESLint
npm run format          # Prettier — write
npm run format:check    # Prettier — check only
npm run seed:generate   # regenerate supabase/seed-frontend.sql from scripts/seed-data/**/*.json
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project's values:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Only the **anon/public** key is ever used in the frontend. Row Level Security (see below) restricts it to read-only `SELECT` access, so it's safe to ship in client code. Never put a service-role key in frontend code or commit `.env`.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your project.
3. Run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `languages`, `topics` and `questions` tables, indexes, a full-text search column, and Row Level Security policies that allow public `SELECT` only.
4. Run the contents of [`supabase/seed.sql`](supabase/seed.sql). This seeds 4 languages, their topics, and the original 120 interview questions, and marks a curated set of them as "Frequently Asked". The script upserts by slug (`on conflict ... do update`), so it's safe to re-run any time you edit it during development.
5. Run the contents of [`supabase/seed-frontend.sql`](supabase/seed-frontend.sql). This adds ~300 more JavaScript questions and ~300 more React questions on top of step 4 (generated from `scripts/seed-data/` — see [Generating More Seed Data](#generating-more-seed-data) below). Also idempotent; safe to re-run.
6. In your Supabase project settings, copy the **Project URL** and the **anon public** API key.
7. Paste them into your local `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
8. Run `npm run dev` and open the printed local URL.

### Row Level Security

RLS is enabled on all three tables. There is a `SELECT` policy for the `anon` and `authenticated` roles on each table, and no `INSERT`/`UPDATE`/`DELETE` policies — so those operations are denied by default for anyone using the anon key. Content is managed exclusively through the Supabase SQL Editor (or, in a future version, an admin app using the service-role key server-side).

## Adding a New Language

Everything is data-driven, so adding a new language (e.g. Python) doesn't require a code change — just SQL, run in the Supabase SQL Editor:

```sql
insert into public.languages (name, slug, description, icon, display_order)
values ('Python', 'python', 'Practice Python interview questions.', 'file-code-2', 5)
on conflict (slug) do nothing;
```

`icon` is a string key looked up in `src/utils/icons.tsx` (`coffee`, `file-code-2`, `atom`, `database` are wired up today, falling back to a generic icon otherwise). To give a new language its own icon, add an entry to `ICON_MAP` there.

The language immediately becomes browsable at `/languages/python` with a `0 Questions` state until topics/questions are added.

## Adding Topics

```sql
insert into public.topics (language_id, name, slug, description, display_order)
select id, 'Basics', 'basics', 'Core Python syntax and data types.', 1
from public.languages where slug = 'python'
on conflict (language_id, slug) do nothing;
```

Topic slugs must be unique **within** a language (the same slug, like `basics`, is reused across multiple languages on purpose).

## Adding Questions

```sql
insert into public.questions (
  language_id, topic_id, slug, question, answer, example, code, code_language, difficulty, tags, is_frequently_asked, display_order
)
select
  l.id, t.id,
  'python-basics-001',
  'What is the difference between a list and a tuple in Python?',
  'Lists are mutable and defined with square brackets; tuples are immutable and defined with parentheses. Because tuples are immutable, they can be used as dictionary keys and are generally slightly faster to iterate over.',
  null,
  E'nums = (1, 2, 3)  # tuple\nitems = [1, 2, 3]  # list',
  'python',
  'easy',
  ARRAY['python','basics']::text[],
  false,
  1
from public.languages l
join public.topics t on t.language_id = l.id and t.slug = 'basics'
where l.slug = 'python'
on conflict (slug) do update set
  question = excluded.question,
  answer = excluded.answer,
  example = excluded.example,
  code = excluded.code,
  code_language = excluded.code_language,
  difficulty = excluded.difficulty,
  tags = excluded.tags,
  is_frequently_asked = excluded.is_frequently_asked,
  display_order = excluded.display_order;
```

Notes:

- `slug` must be globally unique — the `{language}-{topic}-{number}` convention (e.g. `java-collections-001`) keeps it readable and collision-free.
- `difficulty` must be `easy`, `medium`, or `hard` (enforced by a check constraint).
- `example` and `code` are optional — leave them `null` if not needed; the UI only renders sections that have content.
- `answer` and `example` support Markdown (rendered safely via `rehype-sanitize` — never `dangerouslySetInnerHTML`).
- `code_language` drives syntax highlighting; the registered languages are `java`, `javascript`, `typescript`, `jsx`, `tsx`, and `sql` (see `src/components/question/QuestionCode.tsx` to register more).
- `is_frequently_asked` (`boolean`, defaults `false`) drives the "Frequently Asked" badge and `?faq=true` filter — set it `true` for genuinely common/classic questions only.
- **Watch out for `\n` in string literals:** plain `'...'` strings in Postgres do **not** interpret backslash escapes (`standard_conforming_strings` is on by default), so a literal `\n` inside a `'...'`-quoted `code`/`example` value is stored as the two characters `\` and `n`, not a line break. Either put a real newline directly inside the quoted string (spanning multiple physical lines, as `supabase/seed.sql` and the generated `seed-frontend.sql` both do), or use Postgres's `E'...'` escape-string syntax if you want literal `\n` sequences interpreted.

## Generating More Seed Data

For bulk additions (e.g. expanding a language by dozens/hundreds of questions), hand-writing SQL doesn't scale — use the JSON + generator workflow instead of editing `supabase/seed.sql` directly:

1. Add or edit a file at `scripts/seed-data/<language-slug>/<topic-slug>.json` — a plain JSON array of question objects. See [`scripts/seed-data/README.md`](scripts/seed-data/README.md) for the exact schema and content guidelines (quality bar, difficulty mix, duplicate-avoidance, etc).
2. Run `npm run seed:generate`. This reads every `scripts/seed-data/**/*.json` file, validates each entry (required fields, valid difficulty, matching `codeLanguage` when `code` is set, no duplicate questions within a topic file), assigns slugs/`display_order` deterministically (starting at `101` per topic so they never collide with hand-written `001`-`005` entries), and writes the whole thing to `supabase/seed-frontend.sql`.
3. Run the regenerated `supabase/seed-frontend.sql` in the Supabase SQL Editor. It upserts by slug, so it's safe to re-run any time you regenerate it.

Currently this powers the JavaScript and React question banks (~300 questions each, on top of the original 5-per-topic hand-written set), but the same mechanism works for any language/topic — just point it at a new `scripts/seed-data/<language-slug>/` directory.

## Deployment

This is a static single-page app — build it and deploy the `dist/` folder to any static host.

**Vercel / Netlify / Cloudflare Pages:**

1. Connect the repository.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's project settings.
5. Since this is a client-side-routed SPA, configure a rewrite so all paths serve `index.html` (Vercel and Netlify do this automatically for Vite projects in most cases; otherwise add a `_redirects` file with `/* /index.html 200` for Netlify, or an equivalent rewrite rule elsewhere).

## Future Extensibility

Deliberately **not** built in this version, but the architecture (public schema, service layer, no auth coupling) is meant to make these easy to add later without a rewrite:

- Admin dashboard for managing content outside the SQL Editor
- Authentication, user accounts
- Bookmarks / favorites / notes (could start as `localStorage`-only, client-side)
- Progress tracking, mock interview tests
- AI-generated explanations, question voting, comments
- More technologies (Python, TypeScript, Node.js, Spring Boot, Angular, Docker, AWS, MongoDB, ...) — just SQL, no code changes needed

---

Built with Claude Code.
