import { useEffect, useRef } from 'react'

/** True when a key press is meant for a text field, the code editor, or a native control. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Single-key shortcuts (no Ctrl/Alt/Meta), keyed by `KeyboardEvent.key` — e.g. `ArrowLeft`,
 * `' '`, `'b'`. Ignored while typing and while a modal dialog is open. Handlers can change
 * every render without re-binding the listener.
 */
export function useHotkeys(bindings: Record<string, () => void>, enabled = true) {
  const ref = useRef(bindings)
  useEffect(() => {
    ref.current = bindings
  })

  useEffect(() => {
    if (!enabled) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      // A button/link has focus: Space/Enter should activate it, not trigger a shortcut.
      if ((event.key === ' ' || event.key === 'Enter') && event.target instanceof HTMLElement) {
        const tag = event.target.tagName
        if (tag === 'BUTTON' || tag === 'A') return
      }
      if (document.querySelector('dialog[open]')) return
      const handler = ref.current[event.key] ?? ref.current[event.key.toLowerCase()]
      if (!handler) return
      event.preventDefault()
      handler()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
