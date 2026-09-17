import type { LanguageWithCount } from '@/types/database'
import { LanguageCard } from './LanguageCard'

interface LanguageGridProps {
  languages: LanguageWithCount[]
}

export function LanguageGrid({ languages }: LanguageGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {languages.map((language) => (
        <LanguageCard key={language.id} language={language} />
      ))}
    </div>
  )
}
