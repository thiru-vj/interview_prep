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
