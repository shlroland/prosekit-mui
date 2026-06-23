import { definePlugin, union } from 'prosekit/core'
import type { PlainExtension } from 'prosekit/core'
import { keymap } from 'prosekit/pm/keymap'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { Plugin, PluginKey, Selection, TextSelection, type Command, type EditorState } from 'prosekit/pm/state'

import { defineAlertPanelCommands, setDetails, unsetDetails } from './commands'
import { defineAlertPanelNodeView } from './node-view'
import { defineAlertPanelSpec } from './spec'
import type { AlertPanelExtension } from './types'

function findAncestorNode(state: EditorState, predicate: (node: ProseMirrorNode) => boolean) {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (predicate(node)) {
      return {
        node,
        pos: $from.before(depth),
        depth,
      }
    }
  }

  return null
}

function detailsSummaryBackspace(): Command {
  return (state, dispatch, view) => {
    const { selection, schema } = state
    const { empty, $anchor } = selection

    if (!empty || $anchor.parent.type !== schema.nodes.detailsSummary) {
      return false
    }

    if ($anchor.parentOffset !== 0) {
      return false
    }

    return unsetDetails()(state, dispatch, view)
  }
}

function detailsSummaryEnter(): Command {
  return (state, dispatch) => {
    const { selection, schema } = state
    const { empty, $head } = selection

    if (!empty || $head.parent.type !== schema.nodes.detailsSummary) {
      return false
    }

    const details = findAncestorNode(state, (node) => node.type === schema.nodes.details)
    if (!details || details.node.childCount < 2) {
      return false
    }

    const paragraphType = schema.nodes.paragraph
    const node = paragraphType?.createAndFill()
    if (!node) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const summary = details.node.child(0)
    const insertPos = details.node.attrs.open === false
      ? details.pos + details.node.nodeSize
      : details.pos + 1 + summary.nodeSize + 1
    const tr = state.tr.insert(insertPos, node)
    tr.setSelection(Selection.near(tr.doc.resolve(insertPos + 1), 1))
    dispatch(tr.scrollIntoView())
    return true
  }
}

function detailsContentEnter(): Command {
  return (state, dispatch) => {
    const { selection, schema } = state
    const { empty, $from } = selection

    if (!empty) {
      return false
    }

    const detailsContent = findAncestorNode(state, (node) => node.type === schema.nodes.detailsContent)
    const details = findAncestorNode(state, (node) => node.type === schema.nodes.details)
    if (!detailsContent || !details || !detailsContent.node.childCount) {
      return false
    }

    const fromIndex = $from.index(detailsContent.depth)
    const lastChildIndex = detailsContent.node.childCount - 1
    if (fromIndex !== lastChildIndex) {
      return false
    }

    const paragraphType = schema.nodes.paragraph
    const defaultChildNode = paragraphType?.createAndFill()
    const lastChildNode = detailsContent.node.child(lastChildIndex)
    if (!defaultChildNode || !lastChildNode.eq(defaultChildNode)) {
      return false
    }

    const exitNode = paragraphType.createAndFill()
    if (!exitNode) {
      return false
    }

    let lastChildPos = detailsContent.pos + 1
    for (let index = 0; index < lastChildIndex; index += 1) {
      lastChildPos += detailsContent.node.child(index).nodeSize
    }

    if (!dispatch) {
      return true
    }

    const tr = state.tr.delete(lastChildPos, lastChildPos + lastChildNode.nodeSize)
    const insertPos = details.pos + details.node.nodeSize - lastChildNode.nodeSize
    tr.insert(insertPos, exitNode)
    tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1), 1))
    dispatch(tr.scrollIntoView())
    return true
  }
}

function defineAlertPanelKeymap(): PlainExtension {
  return definePlugin(keymap({
    'Mod-8': setDetails(),
    Backspace: detailsSummaryBackspace(),
    Enter: (state, dispatch, view) => {
      return detailsSummaryEnter()(state, dispatch, view) || detailsContentEnter()(state, dispatch, view)
    },
  }))
}

function defineDetailsSelectionGuard(): PlainExtension {
  return definePlugin(
    new Plugin({
      key: new PluginKey('prosekit-details-selection'),
      appendTransaction: (transactions, oldState, newState) => {
        const selectionSet = transactions.some((transaction) => transaction.selectionSet)

        if (!selectionSet || !oldState.selection.empty || !newState.selection.empty) {
          return
        }

        const { schema } = newState
        const details = findAncestorNode(newState, (node) => node.type === schema.nodes.details)
        const detailsContent = findAncestorNode(newState, (node) => node.type === schema.nodes.detailsContent)

        if (!details || !detailsContent || details.node.attrs.open !== false || details.node.childCount < 1) {
          return
        }

        const summary = details.node.child(0)
        const selectionDirection = oldState.selection.from < newState.selection.from ? 1 : -1
        const correctedPos = selectionDirection > 0
          ? details.pos + 2
          : details.pos + 1 + summary.nodeSize

        return newState.tr.setSelection(
          TextSelection.near(newState.doc.resolve(correctedPos), selectionDirection),
        )
      },
    }),
  )
}

export function defineAlertPanelExtension(): AlertPanelExtension {
  return union(
    defineAlertPanelSpec(),
    defineAlertPanelCommands(),
    ...defineAlertPanelNodeView(),
    defineAlertPanelKeymap(),
    defineDetailsSelectionGuard(),
  ) as AlertPanelExtension
}
