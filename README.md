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
- **Cheatsheets** — quick-reference methods/tags/concepts per technology (JavaScript, HTML, CSS, React, Redux, Zustand, DOM), separate from the Q&A content. Toggle between a compact **Normal** mode (names only) and an **Explanation** mode (description, syntax, parameters, return value, example, notes), filter by category, and search — all client-side once a technology's cheatsheet loads
- **DSA** — 104 data structures & algorithms problems across 15 topics, each with the question, answer, explanation, brute force / optimal / alternate solutions in **JavaScript, Java and Python**, and time/space complexity. Client-side filters choose which of those sections are visible (Question + Answer by default), plus topic, difficulty, Frequently Asked and search
- **Practice editor** — every DSA problem has a Practice button that opens an in-browser code editor: write a solution in **JavaScript or Python** (Java coming soon), run it against the problem's test cases or your own input, and see pass/fail, output, expected output and `console.log`/`print` output. No server involved
- **User / Admin access** (Home page) — users view DSA solutions in one language at a time; entering the admin key unlocks up to three languages side by side (see [DSA & Admin Access](#dsa--admin-access))
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
│   ├── cheatsheet/    CheatsheetTechnologyCard/Grid, CheatsheetItemCard, CheatsheetModeToggle,
│   │                   CheatsheetCategoryFilter, CheatsheetSearchInput
│   ├── dsa/           DsaProblemCard, DsaSolutionView, DsaLazyCode, DsaComplexityTable, DsaSectionFilter,
│   │                   DsaTopicFilter, DsaLanguageSelector, DsaSearchInput
│   ├── access/        AccessRoleCard (Home page role selection / admin key)
│   └── common/        LoadingState, ErrorState, EmptyState, NotFoundState, ThemeToggle, DifficultyBadge,
│                       Breadcrumbs, Seo, Markdown, ScrollToTop
├── pages/              Home, Languages, Language, Topic, Question, Cheatsheets, CheatsheetTechnology, Dsa, Search, NotFound
├── context/            AccessProvider — the viewer's User/Admin role
├── hooks/               useLanguages, useLanguage, useTopics, useTopic, useQuestions (by language/topic),
│                        useQuestion, useAdjacentQuestions, useSearchQuestions, useCheatsheetTechnologies,
│                        useCheatsheetTechnology, useTheme, useAsync
├── services/            languageService, topicService, questionService, cheatsheetService, dsaService — the only files that talk to Supabase
├── lib/supabase.ts      Supabase client (anon key only)
├── lib/access.ts        Admin key verification (SHA-256 against VITE_DSA_ADMIN_KEY_HASH)
├── types/database.ts    Database row types
└── utils/                pagination helpers, icon lookup

supabase/
├── schema.sql                  Tables, constraints, indexes, RLS policies (Q&A + cheatsheets)
├── seed.sql                    Languages, topics, and the original 120 hand-written questions (idempotent)
├── seed-frontend.sql           Generated: bulk questions for JavaScript/React/HTML/CSS/Tailwind/Next.js/Node.js (see below)
├── seed-cheatsheets.sql        Cheatsheet technologies + categories (idempotent, hand-written)
├── seed-cheatsheets-items.sql  Generated: cheatsheet items (see below)
└── seed-dsa.sql                Generated: DSA topics + problems (see below)

scripts/
├── generate-seed.mjs             Reads scripts/seed-data/**/*.json → writes supabase/seed-frontend.sql
├── seed-data/                    JSON question banks, one file per language/topic — edit these, not the generated SQL
├── generate-cheatsheet-seed.mjs  Reads scripts/seed-data-cheatsheets/**/*.json → writes supabase/seed-cheatsheets-items.sql
├── seed-data-cheatsheets/        JSON cheatsheet banks, one file per technology/category — edit these, not the generated SQL
├── generate-dsa-seed.mjs         Reads scripts/seed-data-dsa/*.md → writes supabase/seed-dsa.sql
├── seed-data-dsa/                Markdown DSA problem banks, one file per topic — edit these, not the generated SQL
└── hash-access-key.mjs           Prints the SHA-256 of an admin key for VITE_DSA_ADMIN_KEY_HASH
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
npm run seed:dsa:generate               # regenerate supabase/seed-dsa.sql from scripts/seed-data-dsa/*.md
npm run access:hash-key -- "your-key"   # print VITE_DSA_ADMIN_KEY_HASH for an admin key
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project's values:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_DSA_ADMIN_KEY_HASH=   # optional — see "DSA & Admin Access"
```

Only the **anon/public** key is ever used in the frontend. Row Level Security (see below) restricts it to read-only `SELECT` access, so it's safe to ship in client code. Never put a service-role key in frontend code or commit `.env`.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your project.
3. Run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `languages`, `topics`, `questions`, `cheatsheet_technologies`, `cheatsheet_categories` and `cheatsheet_items` tables, indexes, a full-text search column, and Row Level Security policies that allow public `SELECT` only.
4. Run the contents of [`supabase/seed.sql`](supabase/seed.sql). This seeds the languages, their topics, and the original hand-written interview questions, and marks a curated set of them as "Frequently Asked". The script upserts by slug (`on conflict ... do update`), so it's safe to re-run any time you edit it during development.
5. Run the contents of [`supabase/seed-frontend.sql`](supabase/seed-frontend.sql). This adds bulk-generated questions on top of step 4 (generated from `scripts/seed-data/` — see [Generating More Seed Data](#generating-more-seed-data) below). Also idempotent; safe to re-run.
6. Run the contents of [`supabase/seed-cheatsheets.sql`](supabase/seed-cheatsheets.sql). This seeds the cheatsheet technologies and their categories. Idempotent; safe to re-run.
7. Run the contents of [`supabase/seed-cheatsheets-items.sql`](supabase/seed-cheatsheets-items.sql). This adds the cheatsheet entries themselves (generated from `scripts/seed-data-cheatsheets/` — same generator pattern as step 5). Also idempotent; safe to re-run.
8. Run the contents of [`supabase/seed-dsa.sql`](supabase/seed-dsa.sql). This adds the DSA topics and problems (generated from `scripts/seed-data-dsa/`). Idempotent; safe to re-run. (If you ran `schema.sql` before the DSA feature existed, re-run it first — it's idempotent and creates the `dsa_topics` / `dsa_problems` tables.)
9. In your Supabase project settings, copy the **Project URL** and the **anon public** API key.
10. Paste them into your local `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
11. Run `npm run dev` and open the printed local URL.

### Row Level Security

RLS is enabled on every table. There is a `SELECT` policy for the `anon` and `authenticated` roles on each table, and no `INSERT`/`UPDATE`/`DELETE` policies — so those operations are denied by default for anyone using the anon key. Content is managed exclusively through the Supabase SQL Editor (or, in a future version, an admin app using the service-role key server-side).

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
- `code_language` drives syntax highlighting; the registered languages are `java`, `javascript`, `typescript`, `jsx`, `tsx`, `sql`, `html`, `css` and `python` (see `src/components/question/QuestionCode.tsx` to register more).
- `is_frequently_asked` (`boolean`, defaults `false`) drives the "Frequently Asked" badge and `?faq=true` filter — set it `true` for genuinely common/classic questions only.
- **Watch out for `\n` in string literals:** plain `'...'` strings in Postgres do **not** interpret backslash escapes (`standard_conforming_strings` is on by default), so a literal `\n` inside a `'...'`-quoted `code`/`example` value is stored as the two characters `\` and `n`, not a line break. Either put a real newline directly inside the quoted string (spanning multiple physical lines, as `supabase/seed.sql` and the generated `seed-frontend.sql` both do), or use Postgres's `E'...'` escape-string syntax if you want literal `\n` sequences interpreted.

## Generating More Seed Data

For bulk additions (e.g. expanding a language by dozens/hundreds of questions), hand-writing SQL doesn't scale — use the JSON + generator workflow instead of editing `supabase/seed.sql` directly:

1. Add or edit a file at `scripts/seed-data/<language-slug>/<topic-slug>.json` — a plain JSON array of question objects. See [`scripts/seed-data/README.md`](scripts/seed-data/README.md) for the exact schema and content guidelines (quality bar, difficulty mix, duplicate-avoidance, etc).
2. Run `npm run seed:generate`. This reads every `scripts/seed-data/**/*.json` file, validates each entry (required fields, valid difficulty, matching `codeLanguage` when `code` is set, no duplicate questions within a topic file), assigns slugs/`display_order` deterministically (starting at `101` per topic so they never collide with hand-written `001`-`005` entries), and writes the whole thing to `supabase/seed-frontend.sql`.
3. Run the regenerated `supabase/seed-frontend.sql` in the Supabase SQL Editor. It upserts by slug, so it's safe to re-run any time you regenerate it.

Currently this powers the JavaScript and React question banks (~300 questions each, on top of the original 5-per-topic hand-written set), but the same mechanism works for any language/topic — just point it at a new `scripts/seed-data/<language-slug>/` directory.

## Cheatsheets

The Cheatsheets feature (`/cheatsheets`) is a separate content type from the Q&A above — quick-reference methods/tags/concepts per technology, not questions and answers — backed by its own tables (`cheatsheet_technologies`, `cheatsheet_categories`, `cheatsheet_items`) so libraries like Redux/Zustand/DOM don't need to be (and shouldn't be) `languages` rows.

**Adding a technology or category** — same idempotent-SQL pattern as languages/topics:

```sql
insert into public.cheatsheet_technologies (name, slug, description, icon, display_order)
values ('Python', 'python', 'Quick-reference Python built-ins and standard library.', 'file-code-2', 8)
on conflict (slug) do nothing;

insert into public.cheatsheet_categories (technology_id, name, slug, description, display_order)
select id, 'Built-in Functions', 'builtins', 'Commonly used built-in functions.', 1
from public.cheatsheet_technologies where slug = 'python'
on conflict (technology_id, slug) do nothing;
```

**Adding items in bulk** — same JSON + generator workflow as questions:

1. Add or edit a file at `scripts/seed-data-cheatsheets/<technology-slug>/<category-slug>.json` — a plain JSON array of item objects. See [`scripts/seed-data-cheatsheets/README.md`](scripts/seed-data-cheatsheets/README.md) for the exact schema and content guidelines.
2. Run `npm run seed:cheatsheet:generate`. This validates every entry and writes `supabase/seed-cheatsheets-items.sql`.
3. Run the regenerated `supabase/seed-cheatsheets-items.sql` in the Supabase SQL Editor. It upserts by slug, so it's safe to re-run any time you regenerate it.

`code_language` on a cheatsheet item's `example` uses the same registered set as questions (see above). Both `syntax`, `parameters`, `returns`, `example` and `notes` are optional — a conceptual entry (e.g. "Closures") may only need a `description`.

## DSA & Admin Access

The DSA page (`/dsa`) lists every problem from the `dsa_problems` table and filters it entirely client-side:

- **Show** chips pick which sections each card displays — Question, Answer, Explanation, Brute Force, Optimal Solution, Alternate Solutions, Time Complexity, Space Complexity. Question + Answer are on by default; the selection is kept in the URL (`?show=...`) so views are shareable.
- **Topic**, **difficulty**, **Frequently Asked** and **search** narrow the list (20 problems per page).
- **Solution language:** a User picks one of JavaScript / Java / Python; an Admin can show up to three at once. The choice is remembered in `localStorage`.

**Admin access** — on the Home page, choose _Admin_ and enter the key. To set the key:

1. `npm run access:hash-key -- "your-secret-key"`
2. Put the printed `VITE_DSA_ADMIN_KEY_HASH=...` line in `.env` (and in your host's environment variables), then restart / rebuild.

Only the key's SHA-256 hash is shipped in the bundle, never the key itself. The entered key is remembered in the browser and re-verified on every load, so changing the hash revokes old keys. Note this is a **UI gate, not a security boundary**: all solutions are readable with the public anon key, and admin mode only changes how many languages the page shows at once. Anything that must stay secret needs real auth and RLS.

**Practice editor** — the Practice button on each card opens a modal (`?practice=<slug>` in the URL, so it's shareable and Back closes it) with the problem, examples, a CodeMirror editor and a language selector.

- **JavaScript** runs in a Web Worker (a fresh one per run, 5 s time limit), so user code never touches the page.
- **Python** runs in [Pyodide](https://pyodide.org) (CPython compiled to WebAssembly) inside a Web Worker. The runtime (~10 MB) is downloaded from the jsDelivr CDN the first time Python is selected and cached by the browser afterwards; 10 s time limit.
- **Java** isn't supported yet — it can't run in the browser, so it needs a code-execution service (e.g. a self-hosted Judge0/Piston, or Judge0 via an API key behind a Supabase Edge Function). The selector shows it as "coming soon".
- **Run tests** checks the code against the problem's test cases (from `### Tests` in the problem file, stored in `dsa_problems.practice`). **Custom input** runs your own arguments; its expected output is computed by running the reference optimal solution.
- Code is saved per problem and language in `localStorage`; **Reset** restores the starter template.
- The runners live in `src/lib/practice/`: `jsHarness.ts` and `pythonHarness.py` must stay in sync with each other and with the test options validated by `scripts/generate-dsa-seed.mjs`.

**Adding problems** — edit or add `scripts/seed-data-dsa/<topic-slug>.md` (format in [`scripts/seed-data-dsa/README.md`](scripts/seed-data-dsa/README.md)), add new topics to `scripts/seed-data-dsa/topics.json`, run `npm run seed:dsa:generate`, then run `supabase/seed-dsa.sql` in the SQL Editor. The generator validates every problem (required sections, exactly one optimal solution, at least one brute force, code in all three languages).

## Deployment

This is a static single-page app — build it and deploy the `dist/` folder to any static host.

**Vercel / Netlify / Cloudflare Pages:**

1. Connect the repository.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (and optionally `VITE_DSA_ADMIN_KEY_HASH`) in the host's project settings.
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
