import { TextSelection } from 'prosekit/pm/state'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useMemo } from 'react'

import type { TableOfContentsItem } from './types'
import { getTableOfContents } from './utils'

export type TableOfContentsProps = {
  className?: string
  title?: string
}

export function useTableOfContents(): TableOfContentsItem[] {
  const snapshot = useEditorDerivedValue<any, string>((editor) => {
    return JSON.stringify(getTableOfContents(editor.state))
  })

  return useMemo(() => JSON.parse(snapshot) as TableOfContentsItem[], [snapshot])
}

export function TableOfContents({
  className,
  title = 'On this page',
}: TableOfContentsProps) {
  const editor = useEditor<any>() as any
  const items = useTableOfContents()

  if (!items.length) {
    return null
  }

  return (
    <nav
      aria-label={title}
      className={[
        'pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-3 pk:text-sm pk:text-[var(--editor-foreground)] pk:shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="pk:m-0 pk:mb-2 pk:text-xs pk:font-semibold pk:uppercase pk:tracking-[0.08em] pk:text-[var(--editor-muted-foreground)]">
        {title}
      </p>
      <ol className="pk:m-0 pk:grid pk:list-none pk:gap-1 pk:p-0">
        {items.map((item) => (
          <li
            key={item.tocId}
            style={{ paddingLeft: `${Math.max(0, item.level - 1) * 12}px` }}
          >
            <button
              type="button"
              className="pk:block pk:w-full pk:rounded-md pk:border-0 pk:bg-transparent pk:px-2 pk:py-1.5 pk:text-left pk:text-sm pk:leading-5 pk:text-[var(--editor-muted-foreground)] pk:transition pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)] pk:focus-visible:outline pk:focus-visible:outline-2 pk:focus-visible:outline-offset-2 pk:focus-visible:outline-[var(--editor-ring)]"
              onClick={() => {
                const { state, view } = editor
                const pos = Math.min(item.pos + 1, state.doc.content.size)
                const selection = TextSelection.near(state.doc.resolve(pos), 1)
                view.dispatch(state.tr.setSelection(selection).scrollIntoView())
                view.focus()
                const headingElement = view.dom.querySelector(`#${CSS.escape(item.id)}`)

                if (headingElement instanceof HTMLElement) {
                  headingElement.scrollIntoView({ block: 'start' })
                }
              }}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
