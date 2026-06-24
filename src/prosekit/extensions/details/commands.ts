import { defineCommands } from 'prosekit/core'
import type { Node as ProseMirrorNode, NodeType } from 'prosekit/pm/model'
import { TextSelection, type Command, type EditorState, type Transaction } from 'prosekit/pm/state'

import type { DetailsCommandsExtension } from './types'

function focusInsertedBlock(tr: Transaction, startPos: number) {
  const textPos = Math.min(tr.doc.content.size, startPos + 2)
  return tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
}

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

function getActiveDetails(state: EditorState) {
  return findAncestorNode(state, (node) => node.type.name === 'details')
}

function findInsertAfterPos(state: EditorState, nodeType: NodeType) {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const parentDepth = depth - 1
    const parent = $from.node(parentDepth)
    const index = $from.index(parentDepth)

    if (parent.canReplaceWith(index + 1, index + 1, nodeType)) {
      return $from.after(depth)
    }
  }

  return null
}

function tryInsertDetailsNode(state: EditorState, detailsNode: ProseMirrorNode) {
  try {
    const tr = state.tr.replaceSelectionWith(detailsNode, false)
    return {
      tr,
      startPos: tr.selection.$from.pos - detailsNode.nodeSize,
    }
  } catch {
    const detailsType = state.schema.nodes.details
    if (!detailsType) {
      return null
    }

    const insertPos = findInsertAfterPos(state, detailsType)
    if (insertPos == null) {
      return null
    }

    const tr = state.tr.insert(insertPos, detailsNode)
    return {
      tr,
      startPos: insertPos,
    }
  }
}

function createDetailsNode(
  state: EditorState,
  title = '',
  content?: readonly ProseMirrorNode[],
) {
  const detailsType = state.schema.nodes.details
  const summaryType = state.schema.nodes.detailsSummary
  const contentType = state.schema.nodes.detailsContent
  const paragraphType = state.schema.nodes.paragraph

  if (!detailsType || !summaryType || !contentType || !paragraphType) {
    return null
  }

  const summaryText = title.trim() ? state.schema.text(title) : null
  const summaryNode = summaryType.create(
    null,
    summaryText ?? undefined,
  )
  const contentNodes = content?.length
    ? content
    : [paragraphType.createAndFill()].filter((node): node is ProseMirrorNode => Boolean(node))
  const contentNode = contentType.create(
    null,
    contentNodes.length ? contentNodes : undefined,
  )

  return detailsType.create({ open: true }, [summaryNode, contentNode])
}

export function insertCollapsiblePanel(title = ''): Command {
  return (state, dispatch) => {
    const detailsNode = createDetailsNode(state, title)
    if (!detailsNode) {
      return false
    }

    const inserted = tryInsertDetailsNode(state, detailsNode)
    if (!inserted) {
      return false
    }

    let tr = inserted.tr
    tr = focusInsertedBlock(tr, Math.max(0, inserted.startPos))
    dispatch?.(tr.scrollIntoView())
    return true
  }
}

export function insertDetails(title = ''): Command {
  return insertCollapsiblePanel(title)
}

export function setDetails(title = ''): Command {
  return (state, dispatch) => {
    const contentType = state.schema.nodes.detailsContent

    if (!contentType) {
      return false
    }

    const { $from, $to } = state.selection
    const range = $from.blockRange($to)
    if (!range) {
      return false
    }

    const slice = state.doc.slice(range.start, range.end)
    const match = contentType.contentMatch.matchFragment(slice.content)
    if (!match) {
      return false
    }

    const contentNodes: ProseMirrorNode[] = []
    slice.content.forEach((child) => {
      contentNodes.push(child)
    })

    const detailsNode = createDetailsNode(state, title, contentNodes)
    if (!detailsNode) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const tr = state.tr.replaceWith(range.start, range.end, detailsNode)
    tr.setSelection(TextSelection.create(tr.doc, range.start + 2))
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function unsetDetails(): Command {
  return (state, dispatch) => {
    const activeDetails = getActiveDetails(state)
    if (!activeDetails) {
      return false
    }

    if (activeDetails.node.childCount < 2) {
      return false
    }

    const detailsSummary = activeDetails.node.child(0)
    const detailsContent = activeDetails.node.child(1)
    const $detailsPos = state.doc.resolve(activeDetails.pos)
    const defaultTypeForSummary = $detailsPos.parent.type.contentMatch.defaultType
    const paragraphType = state.schema.nodes.paragraph
    const summaryType = defaultTypeForSummary ?? paragraphType

    if (!summaryType) {
      return false
    }

    const contentNodes: ProseMirrorNode[] = [
      summaryType.create(null, detailsSummary.content),
    ]
    detailsContent.content.forEach((child) => {
      contentNodes.push(child)
    })

    if (!dispatch) {
      return true
    }

    const tr = state.tr.replaceWith(
      activeDetails.pos,
      activeDetails.pos + activeDetails.node.nodeSize,
      contentNodes,
    )
    tr.setSelection(TextSelection.near(tr.doc.resolve(activeDetails.pos + 1)))
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function defineDetailsCommands(): DetailsCommandsExtension {
  return defineCommands({
    insertDetails: (title = '') => {
      return insertDetails(title)
    },
    setDetails: (title = '') => {
      return setDetails(title)
    },
    unsetDetails: () => {
      return unsetDetails()
    },
    insertCollapsiblePanel: (title = '') => {
      return insertCollapsiblePanel(title)
    },
  }) as DetailsCommandsExtension
}
