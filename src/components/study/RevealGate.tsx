import type { ReactNode } from 'react'
import { Eye } from 'lucide-react'

interface RevealGateProps {
  revealed: boolean
  onReveal: () => void
  /** Button text, e.g. "Reveal answer". */
  label?: string
  /** Shown above the button — nudges the learner to try first. */
  prompt?: string
  /** Keyboard hint shown next to the label. */
  shortcut?: string
  children: ReactNode
}

/** Hides content (an answer, a solution) until the learner asks for it. */
export function RevealGate({
  revealed,
  onReveal,
  label = 'Reveal answer',
  prompt = 'Try answering in your own words first.',
  shortcut,
  children,
}: RevealGateProps) {
  if (revealed) return <>{children}</>

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <p className="text-sm text-slate-500 dark:text-slate-400">{prompt}</p>
      <button
        type="button"
        onClick={onReveal}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        {label}
        {shortcut && (
          <kbd className="rounded bg-blue-500/60 px-1.5 font-mono text-[11px] font-normal text-blue-50">{shortcut}</kbd>
        )}
      </button>
    </div>
  )
}
