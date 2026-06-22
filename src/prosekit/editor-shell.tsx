import { type ReactNode } from 'react'

export type EditorShellProps = {
  toolbar?: ReactNode
  content?: ReactNode
  footer?: ReactNode
}

export function EditorShell({ toolbar, content, footer }: EditorShellProps) {
  return (
    <div className="pk:grid pk:gap-3">
      <div className="minimal-prosekit-editor-shell">
        {toolbar ? (
          <div className="minimal-prosekit-editor-toolbar-frame">
            {toolbar}
          </div>
        ) : null}
        {content}
      </div>
      {footer ?? (
        <p className="pk:m-0 pk:text-sm pk:leading-6 pk:text-[var(--editor-muted-foreground)]">
          Compose your own editor UI by combining the provider, shell, toolbar,
          and content primitives exported from this package.
        </p>
      )}
    </div>
  )
}
