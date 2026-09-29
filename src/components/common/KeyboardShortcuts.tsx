import { useEffect, useRef, useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { isTypingTarget } from '@/hooks/useHotkeys'

const GROUPS: { title: string; keys: [string, string][] }[] = [
  {
    title: 'Anywhere',
    keys: [
      ['/', 'Focus search'],
      ['?', 'Show this help'],
    ],
  },
  {
    title: 'Question page',
    keys: [
      ['Space', 'Reveal answer'],
      ['← / →', 'Previous / next question'],
      ['L', 'Mark learned'],
      ['R', 'Mark needs review'],
      ['B', 'Bookmark'],
    ],
  },
  {
    title: 'Flashcards & mock interviews',
    keys: [
      ['Space', 'Reveal answer'],
      ['1 or ←', 'Missed it'],
      ['2 or →', 'Got it'],
    ],
  },
  {
    title: 'Practice editor',
    keys: [['Ctrl + Enter', 'Run code']],
  },
]

/** Global shortcuts: "/" focuses the visible search box, "?" opens a cheat sheet of every shortcut. */
export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return
      if (event.key === '?') {
        event.preventDefault()
        setOpen(true)
      } else if (event.key === '/' && !document.querySelector('dialog[open]')) {
        // The navbar and the page can both have a search box; pick the one actually on screen.
        const input = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="search"]')).find(
          (el) => el.offsetParent !== null,
        )
        if (input) {
          event.preventDefault()
          input.focus()
          input.select()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && dialog && !dialog.open) dialog.showModal()
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}
      aria-labelledby="shortcuts-title"
      className="m-auto w-[min(480px,92vw)] rounded-xl bg-white p-0 text-slate-900 backdrop:bg-slate-950/60 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="flex flex-col gap-4 p-5">
        <header className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h2 id="shortcuts-title" className="font-semibold">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>
        {GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{group.title}</h3>
            <dl className="flex flex-col gap-1 text-sm">
              {group.keys.map(([key, action]) => (
                <div key={key + action} className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600 dark:text-slate-300">{action}</dt>
                  <dd>
                    <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-800">
                      {key}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  )
}
