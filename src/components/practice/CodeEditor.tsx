import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { Compartment, EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { indentUnit } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import type { PracticeLanguage } from '@/types/database'
import { useIsDark } from '@/hooks/useIsDark'

interface CodeEditorProps {
  value: string
  language: PracticeLanguage
  onChange: (value: string) => void
  /** Ctrl/Cmd + Enter. */
  onRun: () => void
  label: string
}

function languageExtensions(language: PracticeLanguage) {
  return language === 'python' ? [python(), indentUnit.of('    ')] : [javascript(), indentUnit.of('  ')]
}

const baseTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
})

/** A small CodeMirror 6 wrapper: uncontrolled internally, synced when `value` changes from outside. */
export function CodeEditor({ value, language, onChange, onRun, label }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const languageSlot = useRef(new Compartment())
  const themeSlot = useRef(new Compartment())
  const callbacks = useRef({ onChange, onRun })
  const isDark = useIsDark()

  useEffect(() => {
    callbacks.current = { onChange, onRun }
  })

  useEffect(() => {
    const view = new EditorView({
      parent: hostRef.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                callbacks.current.onRun()
                return true
              },
            },
            indentWithTab,
          ]),
          basicSetup,
          baseTheme,
          languageSlot.current.of(languageExtensions(language)),
          themeSlot.current.of(isDark ? oneDark : []),
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) callbacks.current.onChange(update.state.doc.toString())
          }),
        ],
      }),
    })
    viewRef.current = view
    return () => view.destroy()
    // The view is created once; later prop changes are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    viewRef.current?.dispatch({ effects: languageSlot.current.reconfigure(languageExtensions(language)) })
  }, [language])

  useEffect(() => {
    viewRef.current?.dispatch({ effects: themeSlot.current.reconfigure(isDark ? oneDark : []) })
  }, [isDark])

  return <div ref={hostRef} className="h-full min-h-0 overflow-hidden" />
}
