import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { DsaCodeLanguage } from '@/types/database'
import { DSA_LANGUAGES } from '@/utils/dsa'

interface DsaLanguageSelectorProps {
  value: DsaCodeLanguage[]
  max: number
  onToggle: (language: DsaCodeLanguage) => void
}

export function DsaLanguageSelector({ value, max, onToggle }: DsaLanguageSelectorProps) {
  const multi = max > 1

  return (
    <div className="flex flex-col gap-2">
      <p id="dsa-language-label" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Solution language{multi && <span className="font-normal text-slate-500"> — pick up to {max}</span>}
      </p>
      <div
        role={multi ? 'group' : 'radiogroup'}
        aria-labelledby="dsa-language-label"
        className="inline-flex w-fit flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900"
      >
        {DSA_LANGUAGES.map((language) => {
          const isActive = value.includes(language.value)
          return (
            <button
              key={language.value}
              type="button"
              role={multi ? undefined : 'radio'}
              aria-checked={multi ? undefined : isActive}
              aria-pressed={multi ? isActive : undefined}
              onClick={() => onToggle(language.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {language.label}
            </button>
          )
        })}
      </div>
      {!multi && (
        <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Admins can compare up to 3 languages side by side.{' '}
          <Link to="/#access" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Unlock on Home
          </Link>
        </p>
      )}
    </div>
  )
}
