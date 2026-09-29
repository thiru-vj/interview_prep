/**
 * The learner's study progress — statuses, bookmarks, recently viewed items and the
 * flashcard review schedule — kept in localStorage. There are no accounts, so this is
 * the only place progress lives; the Progress page can export/import it as JSON.
 *
 * Exposed as a tiny external store so every component reading it (cards, progress bars,
 * the navbar) stays in sync, including across browser tabs.
 */

export type ItemKind = 'question' | 'dsa'

/** 'learned' is for Q&A questions, 'solved' for DSA problems; 'review' works for both. */
export type ItemStatus = 'learned' | 'solved' | 'review'

/** Enough about an item to list it (bookmarks, recent, review queue) without refetching it. */
export interface ItemRef {
  kind: ItemKind
  slug: string
  title: string
  href: string
  /** Question language id — DSA problems have none. */
  languageId?: string
  /** Question topic id, or DSA topic id. */
  topicId?: string
}

export interface StatusEntry extends ItemRef {
  status: ItemStatus
  updatedAt: number
}

export interface Bookmark extends ItemRef {
  addedAt: number
}

export interface RecentItem extends ItemRef {
  viewedAt: number
}

/** Leitner-box spaced repetition: a correct answer moves a card up a box and pushes its due date out. */
export interface ReviewCard extends ItemRef {
  box: number
  due: number
}

export interface StudyPrefs {
  /**
   * Learning mode (answers hidden behind "Reveal") chosen per access role. Unset means the
   * role's default: on for users, off for admins — see useLearningMode.
   */
  learningMode: Partial<Record<'user' | 'admin', boolean>>
}

export interface ProgressState {
  version: 1
  statuses: Record<string, StatusEntry>
  bookmarks: Record<string, Bookmark>
  recent: RecentItem[]
  reviews: Record<string, ReviewCard>
  /** Study actions per local day (YYYY-MM-DD) — drives the streak. */
  activity: Record<string, number>
  prefs: StudyPrefs
}

const STORAGE_KEY = 'interview-prep-progress'
const MAX_RECENT = 12
const MAX_ACTIVITY_DAYS = 120
const DAY_MS = 24 * 60 * 60 * 1000
/** Days until a card in each box is due again. Box 0 = just missed. */
const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]
const MAX_BOX = BOX_INTERVAL_DAYS.length - 1

export const itemKey = (kind: ItemKind, slug: string) => `${kind}:${slug}`

function emptyState(): ProgressState {
  return {
    version: 1,
    statuses: {},
    bookmarks: {},
    recent: [],
    reviews: {},
    activity: {},
    prefs: { learningMode: {} },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Accepts anything (storage, an imported file) and returns a well-formed state, dropping what doesn't fit. */
export function normalizeProgress(raw: unknown): ProgressState {
  const base = emptyState()
  if (!isRecord(raw)) return base
  const records = <T>(value: unknown) => (isRecord(value) ? (value as Record<string, T>) : {})
  return {
    version: 1,
    statuses: records<StatusEntry>(raw.statuses),
    bookmarks: records<Bookmark>(raw.bookmarks),
    recent: Array.isArray(raw.recent) ? (raw.recent as RecentItem[]).slice(0, MAX_RECENT) : [],
    reviews: records<ReviewCard>(raw.reviews),
    activity: records<number>(raw.activity),
    prefs: {
      learningMode:
        isRecord(raw.prefs) && isRecord(raw.prefs.learningMode)
          ? (raw.prefs.learningMode as StudyPrefs['learningMode'])
          : base.prefs.learningMode,
    },
  }
}

function load(): ProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? normalizeProgress(JSON.parse(stored)) : emptyState()
  } catch {
    return emptyState()
  }
}

let state: ProgressState = load()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function commit(next: ProgressState) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable or full — progress lasts for this visit only
  }
  emit()
}

// Another tab changed progress — pick it up so both tabs agree.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    state = load()
    emit()
  })
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getProgress(): ProgressState {
  return state
}

export function localDay(time: number = Date.now()): string {
  const date = new Date(time)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function withActivity(activity: Record<string, number>): Record<string, number> {
  const today = localDay()
  const next = { ...activity, [today]: (activity[today] ?? 0) + 1 }
  const days = Object.keys(next).sort()
  for (const day of days.slice(0, Math.max(0, days.length - MAX_ACTIVITY_DAYS))) delete next[day]
  return next
}

/** Only the identifying fields — callers may pass richer objects. */
function pickRef(ref: ItemRef): ItemRef {
  const { kind, slug, title, href, languageId, topicId } = ref
  return { kind, slug, title, href, languageId, topicId }
}

export function setStatus(ref: ItemRef, status: ItemStatus | null) {
  const key = itemKey(ref.kind, ref.slug)
  const statuses = { ...state.statuses }
  const reviews = { ...state.reviews }
  if (status) statuses[key] = { ...pickRef(ref), status, updatedAt: Date.now() }
  else delete statuses[key]
  // "Needs review" puts the item in the review queue right away.
  if (status === 'review') reviews[key] = { ...pickRef(ref), box: 0, due: Date.now() }
  else if (status === null) delete reviews[key]
  commit({ ...state, statuses, reviews, activity: status ? withActivity(state.activity) : state.activity })
}

export function toggleBookmark(ref: ItemRef) {
  const key = itemKey(ref.kind, ref.slug)
  const bookmarks = { ...state.bookmarks }
  if (bookmarks[key]) delete bookmarks[key]
  else bookmarks[key] = { ...pickRef(ref), addedAt: Date.now() }
  commit({ ...state, bookmarks })
}

export function recordVisit(ref: ItemRef) {
  const key = itemKey(ref.kind, ref.slug)
  const recent = [
    { ...pickRef(ref), viewedAt: Date.now() },
    ...state.recent.filter((item) => itemKey(item.kind, item.slug) !== key),
  ].slice(0, MAX_RECENT)
  commit({ ...state, recent })
}

/**
 * Records a flashcard / mock-interview self-grade. Correct answers move the card up a
 * box (and mark a question as learned); misses send it back to box 0 and mark it for review.
 */
export function gradeCard(ref: ItemRef, correct: boolean) {
  const key = itemKey(ref.kind, ref.slug)
  const current = state.reviews[key]
  const box = correct ? Math.min(MAX_BOX, (current?.box ?? 0) + 1) : 0
  const reviews = {
    ...state.reviews,
    [key]: { ...pickRef(ref), box, due: Date.now() + BOX_INTERVAL_DAYS[box] * DAY_MS },
  }

  const statuses = { ...state.statuses }
  const existing = statuses[key]?.status
  if (!correct) statuses[key] = { ...pickRef(ref), status: 'review', updatedAt: Date.now() }
  else if (ref.kind === 'question') statuses[key] = { ...pickRef(ref), status: 'learned', updatedAt: Date.now() }
  // A DSA problem is only "solved" by passing its tests; a correct recall just clears "review".
  else if (existing === 'review') delete statuses[key]

  commit({ ...state, reviews, statuses, activity: withActivity(state.activity) })
}

export function setPrefs(prefs: Partial<StudyPrefs>) {
  commit({ ...state, prefs: { ...state.prefs, ...prefs } })
}

export function exportProgress(): string {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)
}

/** Replaces all progress with an exported file's contents. Throws if the file isn't progress data. */
export function importProgress(json: string) {
  const parsed: unknown = JSON.parse(json)
  if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.statuses)) {
    throw new Error("This file doesn't look like an Interview Prep progress export.")
  }
  commit(normalizeProgress(parsed))
}

export function resetProgress() {
  commit({ ...emptyState(), prefs: state.prefs })
}

// ---------- selectors ----------

export function getDueReviews(progress: ProgressState, now: number = Date.now()): ReviewCard[] {
  return Object.values(progress.reviews)
    .filter((card) => card.due <= now)
    .sort((a, b) => a.due - b.due)
}

/** Consecutive days with at least one study action, ending today (or yesterday, if today has none yet). */
export function getStreak(progress: ProgressState): number {
  let day = Date.now()
  if (!progress.activity[localDay(day)]) day -= DAY_MS
  let streak = 0
  while (progress.activity[localDay(day)]) {
    streak++
    day -= DAY_MS
  }
  return streak
}

export function countByStatus(
  progress: ProgressState,
  status: ItemStatus,
  match: (entry: StatusEntry) => boolean = () => true,
): number {
  let count = 0
  for (const entry of Object.values(progress.statuses)) if (entry.status === status && match(entry)) count++
  return count
}
