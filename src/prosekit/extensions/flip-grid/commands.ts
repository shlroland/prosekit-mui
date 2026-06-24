import { defineCommands } from 'prosekit/core'
import { Fragment, type Node as ProseMirrorNode, type NodeType } from 'prosekit/pm/model'
import { TextSelection, type Command, type EditorState, type Transaction } from 'prosekit/pm/state'

import { MAX_COLUMNS, type FlipGridCommandsExtension } from './types'

function normalizeWidths(widths: number[]) {
  const total = widths.reduce((sum, current) => sum + current, 0) || 1
  return widths.map((width) => (width / total) * 100)
}

function clampColumnCount(columns = 2) {
  return Math.max(2, Math.min(MAX_COLUMNS, Math.floor(columns)))
}

function focusInsertedGrid(tr: Transaction, startPos: number) {
  const textPos = Math.min(tr.doc.content.size, startPos + 3)
  return tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
}

function resolveInsertedGridStart(tr: Transaction, gridType: NodeType) {
  const { $from } = tr.selection
  const after = $from.nodeAfter
  const before = $from.nodeBefore

  if (after?.type === gridType) {
    return $from.pos
  }

  if (before?.type === gridType) {
    return $from.pos - before.nodeSize
  }

  const $prev = tr.doc.resolve(Math.max(0, $from.pos - 1))

  if ($prev.nodeAfter?.type === gridType) {
    return $prev.pos
  }

  if ($prev.nodeBefore?.type === gridType) {
    return $prev.pos - ($prev.nodeBefore.nodeSize || 0)
  }

  return null
}

function createColumnContent(
  paragraphType: NodeType,
  contentNodes: readonly ProseMirrorNode[],
) {
  if (contentNodes.length > 0) {
    return [...contentNodes]
  }

  const paragraph = paragraphType.createAndFill()
  return paragraph ? [paragraph] : []
}

function createFlipGridNode(
  state: EditorState,
  columnContents: readonly (readonly ProseMirrorNode[])[],
) {
  const gridType = state.schema.nodes.flipGrid
  const columnType = state.schema.nodes.flipGridColumn
  const paragraphType = state.schema.nodes.paragraph

  if (!gridType || !columnType || !paragraphType || columnContents.length < 2) {
    return null
  }

  const widths = normalizeWidths(new Array(columnContents.length).fill(1))
  const columns: ProseMirrorNode[] = []

  for (const [index, contentNodes] of columnContents.entries()) {
    const content = createColumnContent(paragraphType, contentNodes)
    if (content.length < 1) {
      return null
    }

    const match = columnType.contentMatch.matchFragment(Fragment.fromArray(content))
    if (!match) {
      return null
    }

    columns.push(columnType.create(
      { width: widths[index] ?? 100 },
      content,
    ))
  }

  return gridType.create({}, columns)
}

function collectSelectedBlocks(state: EditorState) {
  const { $from, $to } = state.selection
  const range = $from.blockRange($to)

  if (!range) {
    return null
  }

  const slice = state.doc.slice(range.start, range.end)
  const blocks: ProseMirrorNode[] = []
  let hasNonBlock = false

  slice.content.forEach((child) => {
    if (!child.isBlock) {
      hasNonBlock = true
      return
    }

    blocks.push(child)
  })

  if (hasNonBlock || blocks.length < 1) {
    return null
  }

  return {
    range,
    blocks,
  }
}

function splitBlocksIntoColumns(blocks: readonly ProseMirrorNode[], columnCount: number) {
  const groups = Array.from({ length: columnCount }, () => [] as ProseMirrorNode[])

  if (blocks.length <= columnCount) {
    blocks.forEach((block, index) => {
      groups[index]?.push(block)
    })
    return groups
  }

  const baseSize = Math.floor(blocks.length / columnCount)
  const remainder = blocks.length % columnCount
  let offset = 0

  for (let index = 0; index < columnCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0)
    groups[index] = blocks.slice(offset, offset + size)
    offset += size
  }

  return groups
}

export function insertFlipGrid(columns = 2): Command {
  return (state, dispatch) => {
    const columnCount = clampColumnCount(columns)
    const gridNode = createFlipGridNode(
      state,
      Array.from({ length: columnCount }, () => [] as ProseMirrorNode[]),
    )

    if (!gridNode) {
      return false
    }

    let tr = state.tr.replaceSelectionWith(gridNode, false)
    const gridStart = resolveInsertedGridStart(tr, gridNode.type)

    if (gridStart !== null) {
      tr = focusInsertedGrid(tr, gridStart)
    }

    dispatch?.(tr.scrollIntoView())
    return true
  }
}

export function setFlipGrid(columns = 2): Command {
  return (state, dispatch) => {
    const selected = collectSelectedBlocks(state)
    const gridType = state.schema.nodes.flipGrid

    if (!selected || !gridType) {
      return false
    }

    const columnCount = clampColumnCount(columns)
    const { range, blocks } = selected

    if (!range.parent.canReplaceWith(range.startIndex, range.endIndex, gridType)) {
      return false
    }

    const gridNode = createFlipGridNode(
      state,
      splitBlocksIntoColumns(blocks, columnCount),
    )

    if (!gridNode) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const tr = focusInsertedGrid(
      state.tr.replaceWith(range.start, range.end, gridNode),
      range.start,
    )
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function defineFlipGridCommands(): FlipGridCommandsExtension {
  return defineCommands({
    insertFlipGrid: (columns = 2) => {
      return insertFlipGrid(columns)
    },
    setFlipGrid: (columns = 2) => {
      return setFlipGrid(columns)
    },
  }) as FlipGridCommandsExtension
}
