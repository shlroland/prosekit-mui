import { basicSetup, EditorView } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import { useEffect, useMemo, useRef } from 'react'

import { cn } from '../../utils/cn'

export type MarkdownSourceEditorProps = {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  className?: string
  minHeight?: number | string
  extensions?: readonly Extension[]
}

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: 'var(--editor-foreground, rgb(15 23 42))',
    backgroundColor: 'var(--editor-surface, #ffffff)',
    fontSize: '13px',
  },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: '1.7',
  },
  '.cm-content': {
    padding: '16px 0',
  },
  '.cm-line': {
    padding: '0 16px',
  },
  '.cm-gutters': {
    borderRight: '1px solid var(--editor-border, rgb(15 23 42 / 0.12))',
    backgroundColor: 'var(--editor-surface-muted, rgb(248 250 252))',
    color: 'var(--editor-muted-foreground, rgb(100 116 139))',
  },
  '.cm-activeLine, .cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--editor-primary, #1976d2) 7%, transparent)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--editor-primary, #1976d2) 24%, transparent)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
})

export function MarkdownSourceEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  className,
  minHeight = 420,
  extensions = [],
}: MarkdownSourceEditorProps) {
  const parentRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const readOnlyCompartment = useMemo(() => new Compartment(), [])
  const editableCompartment = useMemo(() => new Compartment(), [])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const parent = parentRef.current

    if (!parent) {
      return
    }

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) {
        return
      }

      const nextValue = update.state.doc.toString()
      valueRef.current = nextValue
      onChangeRef.current?.(nextValue)
    })

    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: valueRef.current,
        extensions: [
          basicSetup,
          markdown(),
          editorTheme,
          EditorView.lineWrapping,
          updateListener,
          readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
          editableCompartment.of(EditorView.editable.of(!readOnly)),
          ...extensions,
        ],
      }),
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [editableCompartment, extensions, readOnlyCompartment])

  useEffect(() => {
    const view = viewRef.current

    if (!view) {
      return
    }

    const currentValue = view.state.doc.toString()

    if (currentValue === value) {
      return
    }

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    })
  }, [value])

  useEffect(() => {
    const view = viewRef.current

    if (!view) {
      return
    }

    view.dispatch({
      effects: [
        readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
        editableCompartment.reconfigure(EditorView.editable.of(!readOnly)),
      ],
    })
  }, [editableCompartment, readOnly, readOnlyCompartment])

  return (
    <div
      className={cn(
        'markdown-source-editor pk:overflow-hidden pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-sm',
        className,
      )}
      style={{ minHeight }}
      data-placeholder={placeholder || undefined}
    >
      <div ref={parentRef} className="pk:h-full pk:min-h-[inherit]" />
    </div>
  )
}

