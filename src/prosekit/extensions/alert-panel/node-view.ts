import { definePlugin } from 'prosekit/core'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { Plugin, TextSelection } from 'prosekit/pm/state'
import type { Decoration, DecorationSource, EditorView, NodeView, ViewMutationRecord } from 'prosekit/pm/view'
import { defineReactNodeView } from 'prosekit/react'

import { cn } from '../../../utils/cn'
import { AlertView } from './view'

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

function isDetailsOpen(node: ProseMirrorNode) {
  return node.attrs.open !== false
}

function applyDetailsOpenState(
  dom: HTMLElement,
  toggle: HTMLButtonElement,
  content: HTMLElement,
  open: boolean,
) {
  dom.classList.toggle('is-open', open)
  dom.dataset.open = open ? 'true' : 'false'
  toggle.classList.toggle(detailsToggleOpenClassName, open)
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false')

  const detailsContent = content.querySelector<HTMLElement>(':scope > div[data-type="detailsContent"]')
  if (!detailsContent) {
    return
  }

  detailsContent.hidden = !open
}

function createDetailsNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: () => number | undefined,
): NodeView {
  const open = isDetailsOpen(node)
  const dom = document.createElement('div')
  dom.dataset.type = 'details'
  dom.dataset.node = 'details'
  dom.dataset.open = open ? 'true' : 'false'
  dom.className = cn(detailsClassName, open && 'is-open')

  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = cn(detailsToggleClassName, open && detailsToggleOpenClassName)
  toggle.contentEditable = 'false'
  toggle.setAttribute('aria-label', open ? '收起面板' : '展开面板')
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
  dom.append(toggle)

  const content = document.createElement('div')
  content.className = detailsContentWrapperClassName
  dom.append(content)

  toggle.addEventListener('click', () => {
    const nextOpen = !dom.classList.contains('is-open')
    applyDetailsOpenState(dom, toggle, content, nextOpen)
    toggle.setAttribute('aria-label', nextOpen ? '收起面板' : '展开面板')

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

    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
      ...currentNode.attrs,
      open: nextOpen,
    })

    if (!nextOpen && currentNode.childCount >= 2) {
      const summary = currentNode.child(0)
      const detailsContentStart = pos + 1 + summary.nodeSize
      const detailsContentEnd = pos + currentNode.nodeSize - 1
      const { from, to } = view.state.selection

      if (from >= detailsContentStart && to <= detailsContentEnd) {
        tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 2), 1))
      }
    }

    view.dispatch(tr)
    view.focus()
  })

  return {
    dom,
    contentDOM: content,
    ignoreMutation(mutation: ViewMutationRecord) {
      if (mutation.type === 'selection') {
        return false
      }

      return !dom.contains(mutation.target) || dom === mutation.target
    },
    stopEvent(event: Event) {
      return event.target instanceof HTMLElement
        ? Boolean(event.target.closest('button'))
        : false
    },
    update(updatedNode: ProseMirrorNode) {
      if (updatedNode.type !== node.type) {
        return false
      }

      const open = isDetailsOpen(updatedNode)
      applyDetailsOpenState(dom, toggle, content, open)
      toggle.setAttribute('aria-label', open ? '收起面板' : '展开面板')

      return true
    },
  }
}

function createDetailsContentNodeView(node: ProseMirrorNode): NodeView {
  const dom = document.createElement('div')
  dom.dataset.type = 'detailsContent'
  dom.className = detailsContentClassName
  dom.hidden = true

  const syncHiddenWithParent = () => {
    const details = dom.closest<HTMLElement>('[data-type="details"]')
    if (!details) {
      return
    }

    dom.hidden = details.dataset.open !== 'true'
  }

  setTimeout(syncHiddenWithParent)

  return {
    dom,
    contentDOM: dom,
    ignoreMutation(mutation: ViewMutationRecord) {
      if (mutation.type === 'selection') {
        return false
      }

      return !dom.contains(mutation.target) || dom === mutation.target
    },
    update(updatedNode: ProseMirrorNode) {
      syncHiddenWithParent()
      return updatedNode.type === node.type
    },
  }
}

function defineDetailsNodeViews() {
  return definePlugin(
    new Plugin({
      props: {
        nodeViews: {
          details: createDetailsNodeView,
          detailsContent: createDetailsContentNodeView,
        } satisfies Record<
          string,
          (
            node: ProseMirrorNode,
            view: EditorView,
            getPos: () => number | undefined,
            decorations: readonly Decoration[],
            innerDecorations: DecorationSource,
          ) => NodeView
        >,
      },
    }),
  )
}

export function defineAlertPanelNodeView() {
  return [
    defineReactNodeView({
      name: 'alert',
      component: AlertView,
      as: 'div',
      contentAs: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('button, [role="dialog"], [data-editor-floating]'))
          : false
      },
    }),
    defineDetailsNodeViews(),
  ] as const
}
