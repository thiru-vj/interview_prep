export type Difficulty = 'easy' | 'medium' | 'hard'

export type LanguageCategory = 'frontend' | 'backend' | 'database'

export interface Language {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  category: LanguageCategory
  display_order: number
  created_at: string
}

export interface Topic {
  id: string
  language_id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  created_at: string
}

export interface Question {
  id: string
  slug: string
  language_id: string
  topic_id: string
  question: string
  answer: string
  example: string | null
  code: string | null
  code_language: string | null
  difficulty: Difficulty
  tags: string[] | null
  is_frequently_asked: boolean
  display_order: number
  created_at: string
  updated_at: string
}

/** Question joined with its parent language/topic names, used in listings & detail views. */
export interface QuestionWithContext extends Question {
  language: Pick<Language, 'id' | 'name' | 'slug'>
  topic: Pick<Topic, 'id' | 'name' | 'slug'>
}

export interface TopicWithCount extends Topic {
  question_count: number
}

export interface LanguageWithCount extends Language {
  question_count: number
}

export interface CheatsheetTechnology {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
}

export interface CheatsheetCategory {
  id: string
  technology_id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  created_at: string
}

export interface CheatsheetItem {
  id: string
  category_id: string
  technology_id: string
  name: string
  slug: string
  syntax: string | null
  description: string
  parameters: string | null
  returns: string | null
  example: string | null
  code_language: string | null
  notes: string | null
  tags: string[] | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface CheatsheetTechnologyWithCount extends CheatsheetTechnology {
  item_count: number
}

/** A category joined with the items that belong to it, used to render a technology's full cheatsheet in one page. */
export interface CheatsheetCategoryWithItems extends CheatsheetCategory {
  items: CheatsheetItem[]
}

export interface DsaTopic {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  created_at: string
}

export type DsaCodeLanguage = 'javascript' | 'java' | 'python'

export type DsaSolutionType = 'brute' | 'optimal' | 'alternate'

/** One approach to a DSA problem, stored as an element of `dsa_problems.solutions` (jsonb). */
export interface DsaSolution {
  type: DsaSolutionType
  name: string
  description: string | null
  time: string
  space: string
  code: Record<DsaCodeLanguage, string>
}

export interface DsaProblem {
  id: string
  topic_id: string
  slug: string
  title: string
  difficulty: Difficulty
  question: string
  answer: string
  explanation: string
  solutions: DsaSolution[]
  practice: DsaPractice | null
  tags: string[] | null
  is_frequently_asked: boolean
  display_order: number
  created_at: string
  updated_at: string
}

/** How a test case argument / result is converted between JSON and runtime values (ListNode, TreeNode, ...). */
export type PracticeInType = 'list' | 'tree' | 'cycle' | 'node' | 'lists' | 'graph'
export type PracticeOutType = 'list' | 'tree' | 'val' | 'graph' | 'self'
/** Order-insensitive comparisons for problems that accept answers "in any order". */
export type PracticeNorm = 'sortDeep' | 'sortOuter' | 'sortFlat' | 'sortInner' | 'palin'

export interface PracticeOpts {
  in?: (PracticeInType | null)[]
  out?: PracticeOutType
  /** Compare the (mutated) first argument instead of the return value — in-place problems. */
  mutates?: PracticeOutType
  /** Compare [returnValue, first k elements of args[0]] — "remove duplicates"-style problems. */
  prefix?: boolean
  /** args are [listA prefix, listB prefix, shared tail] joined into two intersecting lists. */
  intersect?: boolean
  norm?: PracticeNorm
}

export interface PracticeCase {
  /** Function arguments, or for design problems a list of [method, ...args] operations ("new" = constructor). */
  args: unknown[]
  /** Omitted for custom cases — the runner computes it from the reference solution. */
  expect?: unknown
}

export type PracticeLanguage = 'javascript' | 'python'

/** Stored in `dsa_problems.practice` — everything the in-browser code runner needs for one problem. */
export interface DsaPractice {
  /** Function name (JavaScript) — function problems. */
  fn?: string
  /** Function name (Python) — function problems. */
  py?: string
  /** Class name — design problems. */
  cls?: string
  params: string[]
  opts: PracticeOpts
  cases: PracticeCase[]
  starter: Record<PracticeLanguage, string>
}
