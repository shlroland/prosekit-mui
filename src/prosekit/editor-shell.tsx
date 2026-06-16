import { type ReactNode } from 'react'

export type EditorShellProps = {
  toolbar?: ReactNode
  content?: ReactNode
  footer?: ReactNode
}

export function EditorShell({ toolbar, content, footer }: EditorShellProps) {
  return (
    <div className="grid gap-3">
      <div className="minimal-prosekit-editor-shell">
        {toolbar ? (
          <div className="minimal-prosekit-editor-toolbar-frame">
            {toolbar}
          </div>
        ) : null}
        {content}
      </div>
      {footer ?? (
        <p className="m-0 text-sm leading-6 text-[var(--editor-muted-foreground)]">
          Compose your own editor UI by combining the provider, shell, toolbar,
          and content primitives exported from this package.
        </p>
      )}
    </div>
  )
}
