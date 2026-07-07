import type { NodeJSON } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useEffect, useMemo, type ReactNode } from 'react'

import { cn } from '../utils/cn'
import { createProseKitEditor } from './create-prose-kit-editor'
import { EditorContent } from './editor-content'
import { EditorShell } from './editor-shell'
import { defineRichTextExtension, type RichTextExtensionOptions } from './extensions/rich-text'
import {
  getDiffState,
} from './extensions/diff'
import {
  editorDiff,
  type EditorDiffInput,
  type EditorDiffOptions,
  type EditorDiffResult,
} from './static-renderer/diff-renderer/editor-diff'
import { ProseKitProvider } from './prosekit-provider'

export {
  editorDiff,
  normalizeEditorDiffInput,
} from './static-renderer/diff-renderer/editor-diff'
export type {
  EditorDiffInput,
  EditorDiffOptions,
  EditorDiffResult,
} from './static-renderer/diff-renderer/editor-diff'

export type EditorDiffViewState = {
  isActive: boolean
  diffCount: number
  hasChanges: boolean
  comparison: EditorDiffResult
}

export type EditorDiffViewProps = {
  oldContent: EditorDiffInput
  newContent: EditorDiffInput
  options?: EditorDiffOptions
  extensionOptions?: Omit<RichTextExtensionOptions, 'diff'>
  className?: string
  contentClassName?: string
  toolbar?: ReactNode | ((state: EditorDiffViewState) => ReactNode)
}

const emptyEditorDiffOptions: EditorDiffOptions = {}

function EditorDiffAutoShow({ baseline }: { baseline: NodeJSON }) {
  const editor = useEditor<any>() as any

  useEffect(() => {
    ;(editor.commands as any).showDiff?.(baseline)
  }, [baseline, editor])

  return null
}

function EditorDiffToolbar({
  comparison,
  toolbar,
}: {
  comparison: EditorDiffResult
  toolbar?: EditorDiffViewProps['toolbar']
}) {
  const editor = useEditor<any>() as any
  const snapshot = useEditorDerivedValue<any, string>((currentEditor) => {
    const state = getDiffState(currentEditor.state)
    return JSON.stringify({
      isActive: state.isActive,
      diffCount: state.diffCount,
    })
  })
  const diffState = useMemo(() => JSON.parse(snapshot) as {
    isActive: boolean
    diffCount: number
  }, [snapshot])
  const state: EditorDiffViewState = {
    ...diffState,
    hasChanges: comparison.hasChanges,
    comparison,
  }

  if (typeof toolbar === 'function') {
    return toolbar(state)
  }

  if (toolbar) {
    return toolbar
  }

  return (
    <div className="pk:flex pk:flex-wrap pk:items-center pk:justify-between pk:gap-3 pk:border-b pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface-muted)] pk:px-4 pk:py-3">
      <div className="pk:flex pk:flex-wrap pk:items-center pk:gap-2 pk:text-xs pk:text-[var(--editor-muted-foreground)]">
        <span className="pk:inline-flex pk:items-center pk:gap-1">
          <span className="pk:h-2.5 pk:w-2.5 pk:rounded-sm pk:bg-[var(--editor-success,#16a34a)]" />
          Insert
        </span>
        <span className="pk:inline-flex pk:items-center pk:gap-1">
          <span className="pk:h-2.5 pk:w-2.5 pk:rounded-sm pk:bg-[var(--editor-danger,#dc2626)]" />
          Delete
        </span>
        <span className="pk:inline-flex pk:items-center pk:gap-1">
          <span className="pk:h-2.5 pk:w-2.5 pk:rounded-sm pk:bg-[var(--editor-warning,#d97706)]" />
          Modify
        </span>
      </div>
      <div className="pk:flex pk:items-center pk:gap-2">
        <span className="pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)]">
          {state.isActive ? `${state.diffCount} changes` : comparison.hasChanges ? 'Diff hidden' : 'No changes'}
        </span>
        <button
          type="button"
          className="pk:inline-flex pk:h-8 pk:items-center pk:justify-center pk:rounded-[var(--radius-md)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-3 pk:text-xs pk:font-medium pk:text-[var(--editor-foreground)] pk:hover:border-[var(--editor-primary)]"
          disabled={!comparison.hasChanges}
          onClick={() => {
            ;(editor.commands as any).toggleDiff?.(comparison.baseline)
          }}
        >
          {state.isActive ? 'Hide diff' : 'Show diff'}
        </button>
      </div>
    </div>
  )
}

export function EditorDiffView({
  oldContent,
  newContent,
  options,
  extensionOptions,
  className,
  contentClassName,
  toolbar,
}: EditorDiffViewProps) {
  const resolvedOptions = options ?? emptyEditorDiffOptions
  const comparison = useMemo(() => {
    return editorDiff(oldContent, newContent, resolvedOptions)
  }, [oldContent, newContent, resolvedOptions])
  const extension = useMemo(() => {
    return defineRichTextExtension({
      ...extensionOptions,
      diff: resolvedOptions,
    })
  }, [extensionOptions, resolvedOptions])
  const editor = useMemo(() => {
    return createProseKitEditor({
      extension,
      defaultContent: comparison.current,
    })
  }, [comparison.current, extension])

  return (
    <ProseKitProvider editor={editor}>
      <div className={cn('pk-mui-theme pk-demo-page', className)}>
        <EditorShell
          toolbar={<EditorDiffToolbar comparison={comparison} toolbar={toolbar} />}
          content={<EditorContent className={contentClassName} />}
          footer={null}
        />
        <EditorDiffAutoShow baseline={comparison.baseline} />
      </div>
    </ProseKitProvider>
  )
}
