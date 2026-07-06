import type { ReactNodeViewProps } from 'prosekit/react'
import { TextSelection } from 'prosekit/pm/state'
import { useLayoutEffect, useRef } from 'react'

import { cn } from '../../../utils/cn'

const detailsClassName = cn(
  'cq-details',
  'pk:my-5 pk:flex pk:gap-1 pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:p-2',
  'pk:[&_.cq-details]:my-2',
)

const detailsToggleClassName = cn(
  'pk:mt-[0.1rem] pk:inline-flex pk:h-6 pk:w-5 pk:shrink-0 pk:cursor-pointer pk:items-center pk:justify-center pk:rounded pk:border-0 pk:bg-transparent pk:p-0 pk:text-[0.625rem] pk:text-[var(--editor-foreground)] pk:transition-colors pk:hover:bg-[var(--editor-muted)]',
  "pk:before:flex pk:before:h-full pk:before:w-full pk:before:items-center pk:before:justify-center pk:before:content-['▶'] pk:before:transition-transform pk:before:duration-200 pk:before:ease-in-out",
)

const detailsToggleOpenClassName = 'pk:before:rotate-90'

const detailsContentWrapperClassName = 'pk:flex pk:w-0 pk:flex-1 pk:flex-col pk:gap-4'

const detailsContentClassName = cn(
  'cq-details-content',
  'pk:flex pk:min-w-0 pk:flex-1 pk:flex-col pk:gap-4',
  'pk:[&>_:last-child]:mb-2',
)

function isDetailsOpen(node: ReactNodeViewProps['node']) {
  return node.attrs.open !== false
}

function focusSummaryWhenClosing(props: ReactNodeViewProps) {
  const { getPos, node, view } = props
  const pos = getPos()

  if (typeof pos !== 'number') {
    return null
  }

  const currentNode = view.state.doc.nodeAt(pos)
  if (currentNode?.type !== node.type) {
    return null
  }

  const tr = view.state.tr.setNodeMarkup(pos, undefined, {
    ...currentNode.attrs,
    open: false,
  })

  if (currentNode.childCount < 2) {
    return tr
  }

  const summary = currentNode.child(0)
  const detailsContentStart = pos + 1 + summary.nodeSize
  const detailsContentEnd = pos + currentNode.nodeSize - 1
  const { from, to } = view.state.selection

  if (from >= detailsContentStart && to <= detailsContentEnd) {
    tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 2), 1))
  }

  return tr
}

export function DetailsView(props: ReactNodeViewProps) {
  const { node, contentRef, selected, view, getPos } = props
  const open = isDetailsOpen(node)

  function toggleOpen() {
    const nextOpen = !open

    if (!view.editable) {
      view.focus()
      return
    }

    const pos = getPos()
    if (typeof pos !== 'number') {
      view.focus()
      return
    }

    const currentNode = view.state.doc.nodeAt(pos)
    if (currentNode?.type !== node.type) {
      view.focus()
      return
    }

    const tr = nextOpen
      ? view.state.tr.setNodeMarkup(pos, undefined, {
          ...currentNode.attrs,
          open: true,
        })
      : focusSummaryWhenClosing(props)

    if (tr) {
      view.dispatch(tr)
    }

    view.focus()
  }

  return (
    <div
      className={cn(detailsClassName, open && 'is-open', selected && 'ProseMirror-selectednode')}
      data-type="details"
      data-node="details"
      data-open={open ? 'true' : 'false'}
    >
      <button
        type="button"
        className={cn(detailsToggleClassName, open && detailsToggleOpenClassName)}
        contentEditable={false}
        aria-label={open ? '收起面板' : '展开面板'}
        aria-expanded={open ? 'true' : 'false'}
        onClick={toggleOpen}
      />
      <div ref={contentRef} className={detailsContentWrapperClassName} />
    </div>
  )
}

export function DetailsContentView({ contentRef, node }: ReactNodeViewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }

    const details = root.closest<HTMLElement>('[data-type="details"]')

    function syncHidden() {
      root.hidden = details?.dataset.open !== 'true'
    }

    syncHidden()

    if (!details) {
      return
    }

    const observer = new MutationObserver(syncHidden)
    observer.observe(details, {
      attributes: true,
      attributeFilter: ['data-open'],
    })

    return () => {
      observer.disconnect()
    }
  }, [node])

  return (
    <div
      ref={(element) => {
        rootRef.current = element
        contentRef(element)
      }}
      data-type="detailsContent"
      className={detailsContentClassName}
    />
  )
}
