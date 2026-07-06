import { basicSetup, EditorView } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { Compartment, EditorSelection, EditorState, type Extension } from '@codemirror/state'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type CSSProperties } from 'react'

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

export type MarkdownSourceInlineInsertOptions = {
  single?: string
  left?: string
  right?: string
  position?: number
}

export type MarkdownSourceBlockInsertOptions = {
  text: string
  position?: number
  row?: number
  wrap?: boolean
}

export type MarkdownSourceEditorHandle = {
  focus: () => void
  insertInline: (options: MarkdownSourceInlineInsertOptions) => void
  insertBlock: (options: MarkdownSourceBlockInsertOptions) => void
  insertHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void
  insertTable: (size: { rows: number, columns: number }) => void
}

const emptyExtensions: readonly Extension[] = []
const markdownSourceEditorMinHeightVar = '--markdown-source-editor-min-height'
const defaultMarkdownSourceEditorMinHeight = '420px'
const markdownSourceEditorMinHeight = `var(${markdownSourceEditorMinHeightVar}, ${defaultMarkdownSourceEditorMinHeight})`

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    minHeight: markdownSourceEditorMinHeight,
    color: 'var(--editor-foreground, rgb(15 23 42))',
    backgroundColor: 'var(--editor-surface, #ffffff)',
    fontSize: '13px',
  },
  '.cm-scroller': {
    minHeight: markdownSourceEditorMinHeight,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: '1.7',
  },
  '.cm-content': {
    minHeight: markdownSourceEditorMinHeight,
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
  '.cm-gutter': {
    minHeight: markdownSourceEditorMinHeight,
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

function getMarkdownTable({ rows, columns }: { rows: number, columns: number }) {
  const safeRows = Math.max(2, rows)
  const safeColumns = Math.max(1, columns)
  const emptyCells = Array.from({ length: safeColumns }, () => '')
  const headerRow = `| ${emptyCells.join(' | ')} |`
  const separatorRow = `| ${Array.from({ length: safeColumns }, () => '---').join(' | ')} |`
  const bodyRows = Array.from({ length: safeRows - 1 }, () => `| ${emptyCells.join(' | ')} |`)

  return [headerRow, separatorRow, ...bodyRows].join('\n')
}

function insertMarkdownBlock(view: EditorView, options: MarkdownSourceBlockInsertOptions) {
  const range = view.state.selection.main
  const line = view.state.doc.lineAt(range.to)
  const previousLine = line.number > 1 ? view.state.doc.line(line.number - 1) : null
  const currentLineLength = line.length
  const previousLineLength = previousLine?.length ?? 0
  let insertText = `\n\n${options.text}`
  let plusRows = 2

  if (currentLineLength === 0 && previousLineLength === 0 && line.number > 1) {
    insertText = options.text
    plusRows = options.wrap ? 0 : plusRows
  } else if (currentLineLength === 0 && line.number === 1) {
    insertText = options.text
    plusRows = options.wrap ? 0 : plusRows
  } else if (currentLineLength === 0 && previousLineLength > 0) {
    insertText = `\n${options.text}`
    plusRows = options.wrap ? 1 : plusRows
  }

  view.dispatch({
    changes: { from: line.to, to: line.to, insert: insertText },
    scrollIntoView: true,
  })

  const targetLineNumber = Math.min(view.state.doc.lines, line.number + plusRows + (options.row ?? 0))
  const targetLine = view.state.doc.line(targetLineNumber)
  const cursorPosition = Math.min(targetLine.from + (options.position ?? 0), targetLine.to)

  view.dispatch({
    selection: EditorSelection.cursor(cursorPosition),
    scrollIntoView: true,
  })
  view.focus()
}

function getMinHeightValue(minHeight: number | string) {
  return typeof minHeight === 'number' ? `${minHeight}px` : minHeight
}

export const MarkdownSourceEditor = forwardRef<MarkdownSourceEditorHandle, MarkdownSourceEditorProps>(function MarkdownSourceEditor(
  {
    value,
    onChange,
    readOnly = false,
    placeholder,
    className,
    minHeight,
    extensions = emptyExtensions,
  },
  ref,
) {
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

  useImperativeHandle(ref, () => ({
    focus() {
      viewRef.current?.focus()
    },
    insertInline(options) {
      const view = viewRef.current

      if (!view || readOnly) {
        return
      }

      const left = options.single ?? options.left ?? ''
      const right = options.single ?? options.right ?? ''
      const range = view.state.selection.main
      const selectedText = view.state.sliceDoc(range.from, range.to)
      const insertText = `${left}${selectedText}${right}`
      const selection = selectedText
        ? EditorSelection.range(range.from + left.length, range.from + left.length + selectedText.length)
        : EditorSelection.cursor(range.from + left.length + (options.position ?? 0))

      view.dispatch({
        changes: { from: range.from, to: range.to, insert: insertText },
        selection,
        scrollIntoView: true,
      })
      view.focus()
    },
    insertBlock(options) {
      const view = viewRef.current

      if (!view || readOnly) {
        return
      }

      insertMarkdownBlock(view, options)
    },
    insertHeading(level) {
      const prefix = `${'#'.repeat(level)} `
      const view = viewRef.current

      if (!view || readOnly) {
        return
      }

      const isEmpty = view.state.doc.toString().trim().length === 0
      const insertText = isEmpty ? prefix : `\n\n${prefix}`
      const from = view.state.selection.main.to

      view.dispatch({
        changes: { from, to: from, insert: insertText },
        selection: EditorSelection.cursor(from + insertText.length),
        scrollIntoView: true,
      })
      view.focus()
    },
    insertTable(size) {
      const view = viewRef.current

      if (!view || readOnly) {
        return
      }

      insertMarkdownBlock(view, {
        text: getMarkdownTable(size),
        position: 1,
        wrap: true,
      })
    },
  }), [readOnly])

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

  const minHeightValue = minHeight === undefined ? null : getMinHeightValue(minHeight)
  const containerStyle = {
    minHeight: markdownSourceEditorMinHeight,
    ...(minHeightValue ? { [markdownSourceEditorMinHeightVar]: minHeightValue } : null),
  } as CSSProperties

  return (
    <div
      className={cn(
        'markdown-source-editor pk:overflow-hidden pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-sm',
        className,
      )}
      style={containerStyle}
      data-placeholder={placeholder || undefined}
    >
      <div ref={parentRef} className="pk:h-full pk:min-h-[inherit]" />
    </div>
  )
})
