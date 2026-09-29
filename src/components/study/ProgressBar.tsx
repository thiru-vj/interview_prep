interface ProgressBarProps {
  done: number
  total: number
  /** Text before the count, e.g. "learned". Omit to render the bar only. */
  label?: string
  className?: string
}

export function ProgressBar({ done, total, label, className = '' }: ProgressBarProps) {
  const clamped = Math.min(done, total)
  const percent = total > 0 ? Math.round((clamped / total) * 100) : 0

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={clamped}
        aria-label={label ? `${clamped} of ${total} ${label}` : `${percent}% complete`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      >
        <div
          className={`h-full rounded-full transition-[width] ${percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {label && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {clamped} / {total} {label}
        </span>
      )}
    </div>
  )
}
