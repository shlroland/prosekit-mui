import { TextSelection } from 'prosekit/pm/state'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useMemo } from 'react'

import { cn } from '../../../utils/cn'
import type { TableOfContentsItem } from './types'
import { getActiveTableOfContentsId, getTableOfContents } from './utils'

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

export function useActiveTableOfContentsId(): string | null {
  const snapshot = useEditorDerivedValue<any, string>((editor) => {
    return JSON.stringify(getActiveTableOfContentsId(editor.state))
  })

  return useMemo(() => JSON.parse(snapshot) as string | null, [snapshot])
}

export function TableOfContents({
  className,
  title = 'On this page',
}: TableOfContentsProps) {
  const editor = useEditor<any>() as any
  const items = useTableOfContents()
  const activeTocId = useActiveTableOfContentsId()

  if (!items.length) {
    return null
  }

  return (
    <nav
      aria-label={title}
      className={cn(
        'pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-3 pk:text-sm pk:text-[var(--editor-foreground)] pk:shadow-sm',
        className,
      )}
    >
      <p className="pk:m-0 pk:mb-2 pk:text-xs pk:font-semibold pk:uppercase pk:tracking-[0.08em] pk:text-[var(--editor-muted-foreground)]">
        {title}
      </p>
      <ol className="pk:m-0 pk:grid pk:list-none pk:gap-1 pk:p-0">
        {items.map((item) => {
          const active = item.tocId === activeTocId

          return (
            <li
              key={item.tocId}
              style={{ paddingLeft: `${Math.max(0, item.level - 1) * 12}px` }}
            >
              <button
                type="button"
                aria-current={active ? 'location' : undefined}
                className={cn(
                  'pk:block pk:w-full pk:rounded-md pk:border-0 pk:bg-transparent pk:px-2 pk:py-1.5 pk:text-left pk:text-sm pk:leading-5 pk:text-[var(--editor-muted-foreground)] pk:transition pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)] pk:focus-visible:outline pk:focus-visible:outline-2 pk:focus-visible:outline-offset-2 pk:focus-visible:outline-[var(--editor-ring)]',
                  active && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)] pk:font-medium pk:hover:bg-[var(--editor-primary-soft)] pk:hover:text-[var(--editor-primary)]',
                )}
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
          )
        })}
      </ol>
    </nav>
  )
}
