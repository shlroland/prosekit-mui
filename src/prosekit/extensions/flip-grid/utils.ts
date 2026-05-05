import type { Node as ProseMirrorNode, ResolvedPos } from 'prosekit/pm/model'
import { TextSelection } from 'prosekit/pm/state'
import type { Transaction } from 'prosekit/pm/state'

import { MIN_WIDTH, type FlipGridColumnAttrs } from './types'

type FlipGridAncestor = {
  node: ProseMirrorNode
  depth: number
}

function getColumnWidth(node: ProseMirrorNode) {
  const width = Number((node.attrs as FlipGridColumnAttrs).width)
  return Number.isFinite(width) && width > 0 ? width : 0
}

export function findFlipGridAncestor($pos: ResolvedPos): FlipGridAncestor | null {
  for (let depth = $pos.depth; depth >= 0; depth -= 1) {
    const node = $pos.node(depth)

    if (node.type.name === 'flipGrid') {
      return { node, depth }
    }
  }

  return null
}

export function collectWidths(parent: ProseMirrorNode) {
  return parent.content.content.map((child) => getColumnWidth(child))
}

export function normalizeWithMin(widths: number[], minWidth = MIN_WIDTH) {
  if (widths.length === 0) {
    return []
  }

  const total = widths.reduce((sum, width) => sum + width, 0) || 1
  let normalized = widths.map((width) => (width / total) * 100)

  for (let pass = 0; pass < widths.length * 4; pass += 1) {
    const underMin = normalized.reduce<number[]>((indexes, width, index) => {
      if (width < minWidth) {
        indexes.push(index)
      }

      return indexes
    }, [])

    if (underMin.length === 0) {
      break
    }

    const pinned = new Set(underMin)
    const pinnedTotal = underMin.length * minWidth
    const flexibleIndexes = normalized.reduce<number[]>((indexes, _width, index) => {
      if (!pinned.has(index)) {
        indexes.push(index)
      }

      return indexes
    }, [])

    normalized = normalized.map((width, index) => (pinned.has(index) ? minWidth : width))

    if (flexibleIndexes.length === 0) {
      const even = 100 / normalized.length
      normalized = normalized.map(() => even)
      break
    }

    const flexibleCurrent = flexibleIndexes.reduce((sum, index) => sum + normalized[index], 0) || 1
    const flexibleTarget = Math.max(0, 100 - pinnedTotal)

    for (const index of flexibleIndexes) {
      normalized[index] = (normalized[index] / flexibleCurrent) * flexibleTarget
    }
  }

  const normalizedTotal = normalized.reduce((sum, width) => sum + width, 0) || 1
  normalized = normalized.map((width) => (width / normalizedTotal) * 100)

  const rounded = normalized.map((width) => Number(width.toFixed(2)))
  const roundedTotal = rounded.reduce((sum, width) => sum + width, 0)
  const diff = Number((100 - roundedTotal).toFixed(2))

  if (rounded.length > 0 && Math.abs(diff) > 0.001) {
    rounded[rounded.length - 1] = Number((rounded[rounded.length - 1] + diff).toFixed(2))
  }

  return rounded
}

export function findChildIndex(parent: ProseMirrorNode, child: ProseMirrorNode) {
  return parent.content.content.findIndex((current) => current.eq(child))
}

function findFocusPos(node: ProseMirrorNode, startPos: number): number {
  let offset = startPos + 1
  let current: ProseMirrorNode = node

  while (current.childCount > 0) {
    const firstChild = current.child(0)

    if (firstChild.isTextblock) {
      return offset + 1
    }

    offset += 1
    current = firstChild
  }

  return Math.min(startPos + Math.max(1, node.nodeSize - 2), startPos + 1)
}

type ApplyFlipGridWidthsOptions = {
  tr: Transaction
  parentNode: ProseMirrorNode
  parentPos: number
  nextWidths: number[]
  insertAt?: number
  removeIndex?: number
  focusIndex?: number
}

export function applyFlipGridWidths({
  tr,
  parentNode,
  parentPos,
  nextWidths,
  insertAt,
  removeIndex,
  focusIndex,
}: ApplyFlipGridWidthsOptions) {
  const columnType = parentNode.type.schema.nodes.flipGridColumn
  const paragraphType = parentNode.type.schema.nodes.paragraph

  if (!columnType || !paragraphType) {
    return { changed: false }
  }

  const columns = parentNode.content.content.slice()

  if (typeof removeIndex === 'number') {
    columns.splice(removeIndex, 1)
  }

  if (typeof insertAt === 'number') {
    const newColumn = columnType.create(
      { width: normalizedWidths[insertAt] },
      paragraphType.createAndFill(),
    )
    columns.splice(insertAt, 0, newColumn)
  }

  if (columns.length === 1) {
    const remainingColumn = columns[0]

    if (!remainingColumn) {
      return { changed: false }
    }

    tr.replaceWith(parentPos, parentPos + parentNode.nodeSize, remainingColumn.content)
    tr.setSelection(
      TextSelection.near(
        tr.doc.resolve(Math.min(Math.max(0, parentPos + 1), tr.doc.content.size)),
      ),
    )
    return { changed: tr.docChanged }
  }

  const normalizedWidths = normalizeWithMin(nextWidths, MIN_WIDTH)

  if (normalizedWidths.length < 2) {
    return { changed: false }
  }

  if (columns.length !== normalizedWidths.length) {
    return { changed: false }
  }

  const nextColumns = columns.map((column, index) =>
    columnType.create(
      {
        ...column.attrs,
        width: normalizedWidths[index],
      },
      column.content,
      column.marks,
    ),
  )

  const nextParent = parentNode.type.create(parentNode.attrs, nextColumns, parentNode.marks)

  tr.replaceWith(parentPos, parentPos + parentNode.nodeSize, nextParent)

  if (typeof focusIndex === 'number') {
    const targetColumn = nextColumns[Math.max(0, Math.min(focusIndex, nextColumns.length - 1))]

    if (targetColumn) {
      let offset = parentPos + 1

      for (let index = 0; index < focusIndex; index += 1) {
        offset += nextColumns[index]?.nodeSize || 0
      }

      const focusPos = findFocusPos(targetColumn, offset)
      tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(focusPos, tr.doc.content.size))))
    }
  }

  return { changed: tr.docChanged }
}
