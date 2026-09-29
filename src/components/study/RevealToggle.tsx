import { GraduationCap } from 'lucide-react'
import { useLearningMode } from '@/hooks/useLearningMode'

/** Site-wide Learning mode switch: hide answers until revealed (default for users, off for admins). */
export function RevealToggle() {
  const { enabled, setEnabled } = useLearningMode()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => setEnabled(!enabled)}
      title="When on, answers and solutions stay hidden until you reveal them — try first, then check."
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        enabled
          ? 'border-violet-600 bg-violet-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
      }`}
    >
      <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
      Learning mode {enabled ? 'on' : 'off'}
    </button>
  )
}
