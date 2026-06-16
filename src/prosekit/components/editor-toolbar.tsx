import { useEditor } from 'prosekit/react'
import { type PropsWithChildren } from 'react'

import { Separator } from '../../ui'
import { cn } from '../../utils/cn'

export type EditorToolbarProps = PropsWithChildren

export type EditorToolbarGroupProps = PropsWithChildren<{
  className?: string
}>

export type EditorToolbarDividerProps = {
  className?: string
}

export function EditorToolbar({ children }: EditorToolbarProps) {
  useEditor()

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-row">
        {children}
      </div>
    </div>
  )
}

export function EditorToolbarGroup({ className, children }: EditorToolbarGroupProps) {
  return (
    <div
      className={cn('editor-toolbar-group', className)}
    >
      {children}
    </div>
  )
}

export function EditorToolbarDivider({ className }: EditorToolbarDividerProps) {
  return (
    <Separator
      orientation="vertical"
      className={cn('editor-toolbar-divider', className)}
    />
  )
}

export function EditorToolbarPlaceholder({
  label,
}: {
  label: string
}) {
  return (
    <div className="editor-toolbar-placeholder">
      <span className="text-xs font-bold text-[var(--editor-muted-foreground)]">
        {label}
      </span>
    </div>
  )
}
