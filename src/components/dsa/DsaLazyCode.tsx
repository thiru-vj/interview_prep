import { useEffect, useRef, useState } from 'react'
import { QuestionCode } from '@/components/question/QuestionCode'

interface DsaLazyCodeProps {
  code: string
  language: string
}

/**
 * Syntax highlighting is the expensive part of the DSA page — with every section and
 * three languages on, a page holds 100+ code blocks. Off-screen blocks render as plain
 * text and are only highlighted once they come near the viewport.
 */
export function DsaLazyCode({ code, language }: DsaLazyCodeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (visible || !el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  if (visible) return <QuestionCode code={code} language={language} />

  return (
    <div ref={ref} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
        {language}
      </div>
      <pre className="overflow-x-auto p-4 text-[0.8125rem] leading-normal text-slate-700 dark:text-slate-300">
        {code}
      </pre>
    </div>
  )
}
