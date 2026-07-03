import {
  defineNodeAttr,
  definePlugin,
  union,
  type Extension,
  type Union,
} from 'prosekit/core'
import {
  PluginKey,
  ProseMirrorPlugin,
  type EditorState,
  type Transaction,
} from 'prosekit/pm/state'

import {
  createHeadingSlug,
  createTocId,
  createUniqueHeadingId,
} from './utils'

export type TableOfContentsAttrsExtension = Union<
  [
    Extension<{ Nodes: { heading: { id: string | null } } }>,
    Extension<{ Nodes: { heading: { tocId: string | null } } }>,
  ]
>

export type TableOfContentsExtension = Union<
  [TableOfContentsAttrsExtension, Extension]
>

const tableOfContentsPluginKey = new PluginKey('prosekit-table-of-contents')

function createSyncHeadingsTransaction(state: EditorState): Transaction | null {
  const usedIds = new Set<string>()
  const usedTocIds = new Set<string>()
  const tr = state.tr
  let changed = false
  let headingIndex = 0

  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'heading') {
      return true
    }

    headingIndex += 1

    const text = node.textContent.trim()
    const currentId = typeof node.attrs.id === 'string' ? node.attrs.id : null
    const currentTocId =
      typeof node.attrs.tocId === 'string' ? node.attrs.tocId : null
    const normalizedId = currentId ? createHeadingSlug(currentId) : null
    const nextId = createUniqueHeadingId(text, usedIds, normalizedId)
    let nextTocId = currentTocId || createTocId(pos, headingIndex)

    if (usedTocIds.has(nextTocId)) {
      nextTocId = createTocId(pos, headingIndex)
    }

    usedTocIds.add(nextTocId)

    if (currentId !== nextId || currentTocId !== nextTocId) {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        id: nextId,
        tocId: nextTocId,
      })
      changed = true
    }

    return false
  })

  return changed ? tr : null
}

export function defineTableOfContentsAttrs(): TableOfContentsAttrsExtension {
  return union(
    defineNodeAttr<'heading', 'id', string | null>({
      type: 'heading',
      attr: 'id',
      default: null,
      validate: 'string|null',
      toDOM: (value) => (value ? ['id', value] : null),
      parseDOM: (element) => element.getAttribute('id'),
    }),
    defineNodeAttr<'heading', 'tocId', string | null>({
      type: 'heading',
      attr: 'tocId',
      default: null,
      validate: 'string|null',
      toDOM: (value) => (value ? ['data-toc-id', value] : null),
      parseDOM: (element) => element.getAttribute('data-toc-id'),
    }),
  )
}

function defineTableOfContentsPlugin(): Extension {
  return definePlugin(
    () =>
      new ProseMirrorPlugin({
        key: tableOfContentsPluginKey,
        view: (view) => {
          const tr = createSyncHeadingsTransaction(view.state)

          if (tr) {
            view.dispatch(tr)
          }

          return {}
        },
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null
          }

          return createSyncHeadingsTransaction(newState)
        },
      }),
  )
}

export function defineTableOfContentsExtension(): TableOfContentsExtension {
  return union(defineTableOfContentsAttrs(), defineTableOfContentsPlugin())
}
