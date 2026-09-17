import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '@/hooks/useTheme'

SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('sql', sql)

interface QuestionCodeProps {
  code: string
  language?: string | null
}

const SUPPORTED_LANGUAGES = new Set(['java', 'javascript', 'typescript', 'jsx', 'tsx', 'sql'])

export function QuestionCode({ code, language }: QuestionCodeProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  const normalized = language?.toLowerCase()
  const resolvedLanguage = normalized && SUPPORTED_LANGUAGES.has(normalized) ? normalized : 'text'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {resolvedLanguage}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={resolvedLanguage}
          style={theme === 'dark' ? oneDark : oneLight}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8125rem', padding: '1rem' }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
