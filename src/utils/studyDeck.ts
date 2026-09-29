import type { Difficulty, DsaProblem, QuestionWithContext } from '@/types/database'
import { getDueReviews, type ItemRef, type ProgressState } from '@/lib/progress'
import { getDsaData } from '@/services/dsaService'
import { getQuestionsBySlugs, getStudyQuestions } from '@/services/studyService'
import { dsaRef, questionRef, shuffle } from './study'

/** One card in a flashcard / mock-interview session, from either a Q&A question or a DSA problem. */
export interface StudyCard {
  ref: ItemRef
  /** Short prompt shown as the card heading. */
  prompt: string
  /** Extra prompt detail in Markdown (a DSA problem statement). */
  details?: string
  answer: string
  example?: string | null
  code?: string | null
  codeLanguage?: string | null
  difficulty: Difficulty
  /** Where it's from, e.g. "React · Hooks" or "DSA · Sliding Window". */
  context: string
}

export type StudyMode = 'flashcards' | 'mock' | 'review'
export type StudySource = 'questions' | 'dsa'

export interface DeckSetup {
  mode: StudyMode
  source: StudySource
  languageId: string | null
  topicId: string | null
  dsaTopicId: string | null
  difficulty: Difficulty | null
  /** Cards in the session; 0 = all available. */
  count: number
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

export function questionCard(question: QuestionWithContext): StudyCard {
  return {
    ref: questionRef(question),
    prompt: question.question,
    answer: question.answer,
    example: question.example,
    code: question.code,
    codeLanguage: question.code_language,
    difficulty: question.difficulty,
    context: `${question.language.name} · ${question.topic.name}`,
  }
}

export function dsaCard(problem: DsaProblem, topicName: string | undefined): StudyCard {
  const optimal = problem.solutions.find((s) => s.type === 'optimal') ?? problem.solutions[0]
  return {
    ref: dsaRef(problem),
    prompt: problem.title,
    details: problem.question,
    answer: [problem.answer, problem.explanation].filter(Boolean).join('\n\n'),
    code: optimal?.code.javascript ?? null,
    codeLanguage: 'javascript',
    difficulty: problem.difficulty,
    context: topicName ? `DSA · ${topicName}` : 'DSA',
  }
}

/**
 * A mock interview mixes difficulties like a real one: pick round-robin across
 * easy/medium/hard, then order easy → hard.
 */
function mixDifficulties(cards: StudyCard[], count: number): StudyCard[] {
  const buckets = (['easy', 'medium', 'hard'] as const).map((d) => shuffle(cards.filter((c) => c.difficulty === d)))
  const picked: StudyCard[] = []
  while (picked.length < count && buckets.some((b) => b.length > 0)) {
    for (const bucket of buckets) {
      const card = bucket.shift()
      if (card && picked.length < count) picked.push(card)
    }
  }
  return picked.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty])
}

async function reviewDeck(progress: ProgressState, count: number): Promise<StudyCard[]> {
  const due = getDueReviews(progress)
  const limited = count > 0 ? due.slice(0, count) : due
  const questionSlugs = limited.filter((c) => c.kind === 'question').map((c) => c.slug)
  const dsaSlugs = new Set(limited.filter((c) => c.kind === 'dsa').map((c) => c.slug))

  const [questions, dsa] = await Promise.all([
    getQuestionsBySlugs(questionSlugs),
    dsaSlugs.size > 0 ? getDsaData() : Promise.resolve(null),
  ])
  const topicNames = new Map((dsa?.topics ?? []).map((t) => [t.id, t.name]))
  const cards = new Map<string, StudyCard>()
  for (const q of questions) cards.set(`question:${q.slug}`, questionCard(q))
  for (const p of dsa?.problems ?? []) {
    if (dsaSlugs.has(p.slug)) cards.set(`dsa:${p.slug}`, dsaCard(p, topicNames.get(p.topic_id)))
  }
  // Keep the "most overdue first" order.
  return limited.map((c) => cards.get(`${c.kind}:${c.slug}`)).filter((c): c is StudyCard => !!c)
}

export async function buildDeck(setup: DeckSetup, progress: ProgressState): Promise<StudyCard[]> {
  if (setup.mode === 'review') return reviewDeck(progress, setup.count)

  let pool: StudyCard[]
  if (setup.source === 'dsa') {
    const data = await getDsaData()
    const topicNames = new Map(data.topics.map((t) => [t.id, t.name]))
    pool = data.problems
      .filter(
        (p) =>
          (!setup.dsaTopicId || p.topic_id === setup.dsaTopicId) &&
          (!setup.difficulty || p.difficulty === setup.difficulty),
      )
      .map((p) => dsaCard(p, topicNames.get(p.topic_id)))
  } else {
    if (!setup.languageId) return []
    const questions = await getStudyQuestions({
      languageId: setup.languageId,
      topicId: setup.topicId,
      difficulty: setup.difficulty,
    })
    pool = questions.map(questionCard)
  }

  const count = setup.count > 0 ? setup.count : pool.length
  return setup.mode === 'mock' ? mixDifficulties(pool, count) : shuffle(pool).slice(0, count)
}
