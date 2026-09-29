import {
  mockCheatsheetCategories,
  mockCheatsheetItems,
  mockCheatsheetTechnologies,
  mockDsaProblems,
  mockDsaTopics,
  mockLanguages,
  mockQuestions,
  mockTopics,
} from '@/lib/mockData'
import type {
  CheatsheetTechnologyWithCount,
  LanguageWithCount,
  Question,
  QuestionWithContext,
  TopicWithCount,
} from '@/types/database'
import { buildPaginatedResult, getRange, type PaginatedResult } from '@/utils/pagination'
import type { CheatsheetTechnologyData } from './cheatsheetService'
import type { DsaData } from './dsaService'
import type { QuestionFilters, QuestionNavItem } from './questionService'

/** In-memory equivalents of the Supabase queries, run against the demo dataset. */

function withContext(question: Question): QuestionWithContext {
  const language = mockLanguages.find((l) => l.id === question.language_id)!
  const topic = mockTopics.find((t) => t.id === question.topic_id)!
  return {
    ...question,
    language: { id: language.id, name: language.name, slug: language.slug },
    topic: { id: topic.id, name: topic.name, slug: topic.slug },
  }
}

function matchesFilters(question: Question, filters?: QuestionFilters): boolean {
  if (filters?.difficulty && question.difficulty !== filters.difficulty) return false
  if (filters?.frequentlyAsked && !question.is_frequently_asked) return false
  return true
}

function paginate(questions: Question[], page: number, pageSize: number): PaginatedResult<QuestionWithContext> {
  const { from, to } = getRange(page, pageSize)
  return buildPaginatedResult(questions.slice(from, to + 1).map(withContext), questions.length, page, pageSize)
}

export const mockQueries = {
  getLanguages(): LanguageWithCount[] {
    return mockLanguages.map((language) => ({
      ...language,
      question_count: mockQuestions.filter((q) => q.language_id === language.id).length,
    }))
  },

  getLanguageBySlug(slug: string) {
    return mockLanguages.find((l) => l.slug === slug) ?? null
  },

  getTopicsByLanguage(languageId: string): TopicWithCount[] {
    return mockTopics
      .filter((t) => t.language_id === languageId)
      .map((topic) => ({ ...topic, question_count: mockQuestions.filter((q) => q.topic_id === topic.id).length }))
  },

  getTopicBySlug(languageId: string, slug: string) {
    return mockTopics.find((t) => t.language_id === languageId && t.slug === slug) ?? null
  },

  getQuestionCount(languageId: string, filters?: QuestionFilters): number {
    return mockQuestions.filter((q) => q.language_id === languageId && matchesFilters(q, filters)).length
  },

  getQuestionsByLanguage(languageId: string, page: number, pageSize: number, filters?: QuestionFilters) {
    return paginate(
      mockQuestions.filter((q) => q.language_id === languageId && matchesFilters(q, filters)),
      page,
      pageSize,
    )
  },

  getQuestionsByTopic(topicId: string, page: number, pageSize: number, filters?: QuestionFilters) {
    return paginate(
      mockQuestions.filter((q) => q.topic_id === topicId && matchesFilters(q, filters)),
      page,
      pageSize,
    )
  },

  getQuestionBySlug(slug: string) {
    const question = mockQuestions.find((q) => q.slug === slug)
    return question ? withContext(question) : null
  },

  searchQuestions(searchQuery: string, page: number, pageSize: number) {
    const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const matches = mockQuestions.filter((q) => {
      const haystack = `${q.question} ${q.answer} ${(q.tags ?? []).join(' ')}`.toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
    return paginate(matches, page, pageSize)
  },

  getOrderedNavList(column: 'language_id' | 'topic_id', contextId: string): QuestionNavItem[] {
    return mockQuestions
      .filter((q) => q[column] === contextId)
      .map(({ id, slug, question }) => ({ id, slug, question }))
  },

  getCheatsheetTechnologies(): CheatsheetTechnologyWithCount[] {
    return mockCheatsheetTechnologies.map((technology) => ({
      ...technology,
      item_count: mockCheatsheetItems.filter((i) => i.technology_id === technology.id).length,
    }))
  },

  getCheatsheetTechnologyBySlug(slug: string) {
    return mockCheatsheetTechnologies.find((t) => t.slug === slug) ?? null
  },

  getCheatsheetTechnologyData(slug: string): CheatsheetTechnologyData | null {
    const technology = mockCheatsheetTechnologies.find((t) => t.slug === slug)
    if (!technology) return null
    const categories = mockCheatsheetCategories
      .filter((c) => c.technology_id === technology.id)
      .map((category) => ({ ...category, items: mockCheatsheetItems.filter((i) => i.category_id === category.id) }))
    return { technology, categories }
  },

  getDsaData(): DsaData {
    return { topics: mockDsaTopics, problems: mockDsaProblems }
  },
}
