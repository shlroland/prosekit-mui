import { TextSelection } from 'prosekit/pm/state'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useEffect, useMemo, useState } from 'react'

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

function getHeadingElement(view: any, item: TableOfContentsItem) {
  return view.dom.querySelector(`#${CSS.escape(item.id)}`)
}

function getScrollOverId(view: any, items: TableOfContentsItem[]) {
  const scrollThreshold = 96
  let scrollOverId: string | null = null

  for (const item of items) {
    const headingElement = getHeadingElement(view, item)

    if (!(headingElement instanceof HTMLElement)) {
      continue
    }

    if (headingElement.getBoundingClientRect().top > scrollThreshold) {
      break
    }

    scrollOverId = item.tocId
  }

  return scrollOverId
}

function useTableOfContentsScrollOverId(editor: any, items: TableOfContentsItem[]) {
  const [scrollOverId, setScrollOverId] = useState<string | null>(null)
  const itemKey = useMemo(() => items.map((item) => `${item.tocId}:${item.id}`).join('|'), [items])

  useEffect(() => {
    const view = editor?.view
    const ownerDocument = view?.dom?.ownerDocument
    const ownerWindow = ownerDocument?.defaultView

    if (!view || !ownerDocument || !ownerWindow || !items.length) {
      setScrollOverId(null)
      return
    }

    let frameId: number | null = null

    function update() {
      frameId = null
      setScrollOverId(getScrollOverId(view, items))
    }

    function scheduleUpdate() {
      if (frameId != null) {
        return
      }

      frameId = ownerWindow.requestAnimationFrame(update)
    }

    update()
    ownerDocument.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true })
    ownerWindow.addEventListener('resize', scheduleUpdate)

    return () => {
      if (frameId != null) {
        ownerWindow.cancelAnimationFrame(frameId)
      }

      ownerDocument.removeEventListener('scroll', scheduleUpdate, { capture: true })
      ownerWindow.removeEventListener('resize', scheduleUpdate)
    }
  }, [editor, itemKey, items])

  return scrollOverId
}

export function TableOfContents({
  className,
  title = 'On this page',
}: TableOfContentsProps) {
  const editor = useEditor<any>() as any
  const items = useTableOfContents()
  const activeTocId = useActiveTableOfContentsId()
  const scrollOverId = useTableOfContentsScrollOverId(editor, items)

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
          const scrollOver = item.tocId === scrollOverId

          return (
            <li
              key={item.tocId}
              style={{ paddingLeft: `${Math.max(0, item.level - 1) * 12}px` }}
            >
              <button
                type="button"
                aria-current={active ? 'location' : undefined}
                className={cn(
                  'pk:block pk:w-full pk:rounded-md pk:border-0 pk:border-l-2 pk:border-l-transparent pk:bg-transparent pk:px-2 pk:py-1.5 pk:text-left pk:text-sm pk:leading-5 pk:text-[var(--editor-muted-foreground)] pk:transition pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)] pk:focus-visible:outline pk:focus-visible:outline-2 pk:focus-visible:outline-offset-2 pk:focus-visible:outline-[var(--editor-ring)]',
                  scrollOver && 'pk:border-l-[var(--editor-primary)] pk:bg-[var(--editor-muted)] pk:text-[var(--editor-foreground)]',
                  active && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)] pk:font-medium pk:hover:bg-[var(--editor-primary-soft)] pk:hover:text-[var(--editor-primary)]',
                )}
                onClick={() => {
                  const { state, view } = editor
                  const pos = Math.min(item.pos + 1, state.doc.content.size)
                  const selection = TextSelection.near(state.doc.resolve(pos), 1)
                  view.dispatch(state.tr.setSelection(selection).scrollIntoView())
                  view.focus()
                  const headingElement = getHeadingElement(view, item)

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
