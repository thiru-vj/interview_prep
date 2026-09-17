-- =============================================================================
-- Interview Prep — Database Schema
-- Public, read-only interview question platform. No auth, no user data.
-- Run this file once in the Supabase SQL Editor before running seed.sql.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- =============================================================================
-- Table: languages
-- =============================================================================
create table if not exists public.languages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  icon          text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

comment on table public.languages is 'Top-level technologies (Java, JavaScript, React, SQL, ...).';

-- =============================================================================
-- Table: topics
-- =============================================================================
create table if not exists public.topics (
  id            uuid primary key default gen_random_uuid(),
  language_id   uuid not null references public.languages(id) on delete cascade,
  name          text not null,
  slug          text not null,
  description   text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  constraint topics_language_slug_unique unique (language_id, slug)
);

comment on table public.topics is 'Sub-categories belonging to a single language.';

-- =============================================================================
-- Table: questions
-- =============================================================================
create table if not exists public.questions (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  language_id   uuid not null references public.languages(id) on delete cascade,
  topic_id      uuid not null references public.topics(id) on delete cascade,
  question      text not null,
  answer        text not null,
  example       text,
  code          text,
  code_language text,
  difficulty    text not null default 'medium',
  tags          text[],
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint questions_difficulty_check check (difficulty in ('easy', 'medium', 'hard'))
);

comment on table public.questions is 'Individual interview questions belonging to a language and topic.';

-- =============================================================================
-- updated_at trigger
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_questions_updated_at on public.questions;
create trigger set_questions_updated_at
  before update on public.questions
  for each row
  execute function public.set_updated_at();

-- =============================================================================
-- Indexes
-- =============================================================================
create index if not exists idx_languages_slug on public.languages (slug);

create index if not exists idx_topics_language_id on public.topics (language_id);
create index if not exists idx_topics_slug on public.topics (slug);

create index if not exists idx_questions_language_id on public.questions (language_id);
create index if not exists idx_questions_topic_id on public.questions (topic_id);
create index if not exists idx_questions_difficulty on public.questions (difficulty);
create index if not exists idx_questions_created_at on public.questions (created_at);
create index if not exists idx_questions_slug on public.questions (slug);
create index if not exists idx_questions_ordering on public.questions (language_id, topic_id, display_order, created_at);

-- Full-text search across question, answer and tags.
-- to_tsvector() is STABLE (not IMMUTABLE), so it can't be used directly in a
-- GENERATED ALWAYS AS ... STORED column — Postgres rejects that with 42P17.
-- A trigger that maintains the column on insert/update works around this.
alter table public.questions
  add column if not exists search_vector tsvector;

create or replace function public.questions_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.question, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.answer, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');
  return new;
end;
$$;

drop trigger if exists set_questions_search_vector on public.questions;
create trigger set_questions_search_vector
  before insert or update of question, answer, tags on public.questions
  for each row
  execute function public.questions_search_vector_update();

-- Backfill existing rows (no-op on a fresh table, needed when re-running this script).
update public.questions set search_vector =
  setweight(to_tsvector('english', coalesce(question, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(answer, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C');

create index if not exists idx_questions_search_vector on public.questions using gin (search_vector);

-- Trigram indexes support fast ILIKE fallback search on short/partial terms.
create index if not exists idx_questions_question_trgm on public.questions using gin (question gin_trgm_ops);
create index if not exists idx_questions_tags_trgm on public.questions using gin (tags);

-- =============================================================================
-- Row Level Security — public read-only access
-- =============================================================================
alter table public.languages enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;

drop policy if exists "Public can read languages" on public.languages;
create policy "Public can read languages"
  on public.languages
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read topics" on public.topics;
create policy "Public can read topics"
  on public.topics
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read questions" on public.questions;
create policy "Public can read questions"
  on public.questions
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies are defined for anon/authenticated roles,
-- so those operations are denied by default now that RLS is enabled.
-- Content is managed exclusively via the Supabase SQL Editor / service role.
