import type { CheatsheetTechnologyWithCount } from '@/types/database'
import { CheatsheetTechnologyCard } from './CheatsheetTechnologyCard'

interface CheatsheetTechnologyGridProps {
  technologies: CheatsheetTechnologyWithCount[]
}

export function CheatsheetTechnologyGrid({ technologies }: CheatsheetTechnologyGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {technologies.map((technology) => (
        <CheatsheetTechnologyCard key={technology.id} technology={technology} />
      ))}
    </div>
  )
}
