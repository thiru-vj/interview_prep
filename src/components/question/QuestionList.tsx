import type { QuestionWithContext } from '@/types/database'
import { QuestionCard } from './QuestionCard'

interface QuestionListProps {
  questions: QuestionWithContext[]
  startIndex: number
  returnTo?: string
}

export function QuestionList({ questions, startIndex, returnTo }: QuestionListProps) {
  return (
    <div className="flex flex-col gap-3">
      {questions.map((question, i) => (
        <QuestionCard key={question.id} question={question} index={startIndex + i} returnTo={returnTo} />
      ))}
    </div>
  )
}
