import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { TextSelection, type EditorState } from 'prosekit/pm/state'
import {
  CellSelection,
  cellAround,
  deleteCellSelection,
  findTable,
  mergeCells,
  selectedRect,
  selectionCell,
  setCellAttr,
  splitCell,
  TableMap,
  toggleHeaderColumn,
  toggleHeaderRow,
} from 'prosemirror-tables'

export type TableCellVerticalAlign = 'top' | 'middle' | 'bottom'
export type TableCellTextAlign = 'left' | 'center' | 'right' | 'justify'
export type TableOrientation = 'row' | 'column'

type TableInfo = {
  node: ProseMirrorNode
  pos: number
  start: number
  depth: number
  map: TableMap
}

type CellInfo = {
  row: number
  column: number
  pos: number
  node: ProseMirrorNode
}

type CellWithRect = {
  pos: number
  node: ProseMirrorNode
  rect: { left: number, right: number, top: number, bottom: number }
}

const tableCellNodeNames = new Set(['tableCell', 'tableHeaderCell'])

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function isWithinBounds(row: number, col: number, map: TableMap) {
  return row >= 0 && row < map.height && col >= 0 && col < map.width
}

function createCellInfo(
  row: number,
  column: number,
  cellPos: number,
  cellNode: ProseMirrorNode,
): CellInfo {
  return {
    row,
    column,
    pos: cellPos,
    node: cellNode,
  }
}

function resolveOrientationIndex(
  state: EditorState,
  table: TableInfo,
  orientation: TableOrientation,
  providedIndex?: number,
) {
  if (typeof providedIndex === 'number') {
    return providedIndex
  }

  if (state.selection instanceof CellSelection) {
    const rect = selectedRect(state)
    return orientation === 'row' ? rect.top : rect.left
  }

  const $cell = cellAround(state.selection.$anchor) ?? selectionCell(state)
  if (!$cell) {
    return null
  }

  const relativePos = $cell.pos - table.start
  const rect = table.map.findCell(relativePos)
  return orientation === 'row' ? rect.top : rect.left
}

function getCellSelectionPositions(
  table: TableInfo,
  row: number,
  col: number,
) {
  const offset = table.map.map[row * table.map.width + col]
  if (offset == null) {
    return null
  }

  return table.pos + 1 + offset
}

function dedupeCells(cells: CellInfo[]) {
  const seen = new Set<number>()
  return cells.filter((cell) => {
    if (seen.has(cell.pos)) {
      return false
    }

    seen.add(cell.pos)
    return true
  })
}

function getUniqueCellsWithRect(table: TableInfo): CellWithRect[] {
  const seen = new Set<number>()
  const cells: CellWithRect[] = []

  for (const offset of table.map.map) {
    if (seen.has(offset)) {
      continue
    }

    seen.add(offset)

    const cellNode = table.node.nodeAt(offset)
    if (!cellNode) {
      continue
    }

    cells.push({
      pos: table.start + offset,
      node: cellNode,
      rect: table.map.findCell(offset),
    })
  }

  return cells
}

function isCellMerged(node: ProseMirrorNode | null) {
  if (!node) {
    return false
  }

  const colspan = typeof node.attrs.colspan === 'number' ? node.attrs.colspan : 1
  const rowspan = typeof node.attrs.rowspan === 'number' ? node.attrs.rowspan : 1

  return colspan > 1 || rowspan > 1
}

export function isTableCellNode(node: ProseMirrorNode | null | undefined) {
  return Boolean(node && tableCellNodeNames.has(node.type.name))
}

export function isSelectionInTable(state: EditorState) {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (node.type.name === 'table') {
      return true
    }
  }

  return false
}

export function getTable(editor: any, tablePos?: number): TableInfo | null {
  if (!editor) {
    return null
  }

  let table = null

  if (typeof tablePos === 'number') {
    const tableNode = editor.state.doc.nodeAt(tablePos)
    if (tableNode?.type.name === 'table') {
      table = {
        node: tableNode,
        pos: tablePos,
        start: tablePos + 1,
        depth: editor.state.doc.resolve(tablePos).depth,
      }
    }
  }

  if (!table) {
    const $from = editor.state.doc.resolve(editor.state.selection.from)
    table = findTable($from)
  }

  if (!table) {
    return null
  }

  return {
    ...table,
    map: TableMap.get(table.node),
  }
}

export function getAxisIndex(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const table = getTable(editor, tablePos)
  if (!table) {
    return null
  }

  const resolvedIndex = resolveOrientationIndex(editor.state, table, orientation, index)
  if (resolvedIndex == null) {
    return null
  }

  const maxIndex = orientation === 'row' ? table.map.height : table.map.width
  if (resolvedIndex < 0 || resolvedIndex >= maxIndex) {
    return null
  }

  return resolvedIndex
}

export function getAxisCells(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const table = getTable(editor, tablePos)
  if (!table) {
    return { cells: [] as CellInfo[], mergedCells: [] as CellInfo[] }
  }

  const resolvedIndex = resolveOrientationIndex(editor.state, table, orientation, index)
  if (resolvedIndex == null) {
    return { cells: [] as CellInfo[], mergedCells: [] as CellInfo[] }
  }

  const maxIndex = orientation === 'row' ? table.map.height : table.map.width
  if (resolvedIndex < 0 || resolvedIndex >= maxIndex) {
    return { cells: [] as CellInfo[], mergedCells: [] as CellInfo[] }
  }

  const cells: CellInfo[] = []
  const mergedCells: CellInfo[] = []
  const seenMerged = new Set<number>()
  const iterationCount = orientation === 'row' ? table.map.width : table.map.height

  for (let cursor = 0; cursor < iterationCount; cursor += 1) {
    const row = orientation === 'row' ? resolvedIndex : cursor
    const column = orientation === 'row' ? cursor : resolvedIndex
    const cellIndex = row * table.map.width + column
    const offset = table.map.map[cellIndex]

    if (offset == null) {
      continue
    }

    const cellNode = table.node.nodeAt(offset)
    if (!cellNode) {
      continue
    }

    const cell = createCellInfo(row, column, table.start + offset, cellNode)
    if (isCellMerged(cellNode) && !seenMerged.has(cell.pos)) {
      mergedCells.push(cell)
      seenMerged.add(cell.pos)
    }

    cells.push(cell)
  }

  return { cells, mergedCells }
}

export function isFirstAxis(editor: any, orientation: TableOrientation, index?: number, tablePos?: number) {
  const resolvedIndex = getAxisIndex(editor, orientation, index, tablePos)
  return resolvedIndex === 0
}

export function areAxisCellsAllHeader(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const { cells } = getAxisCells(editor, orientation, index, tablePos)
  return cells.length > 0 && cells.every((cell) => cell.node.type.name === 'tableHeaderCell')
}

export function isCellEmpty(cellNode: ProseMirrorNode) {
  if (cellNode.childCount === 0) {
    return true
  }

  let empty = true

  cellNode.descendants((node) => {
    if (node.isText && node.text?.trim()) {
      empty = false
      return false
    }

    if (node.isLeaf && !node.isText) {
      empty = false
      return false
    }

    return true
  })

  return empty
}

export function axisHasContent(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const { cells } = getAxisCells(editor, orientation, index, tablePos)
  return cells.some((cell) => !isCellEmpty(cell.node))
}

export function canDuplicateAxis(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const { cells, mergedCells } = getAxisCells(editor, orientation, index, tablePos)

  if (!cells.length) {
    return false
  }

  if (orientation === 'column' && mergedCells.length > 0) {
    return false
  }

  return true
}

export function selectCellsByCoords(
  editor: any,
  tablePos: number,
  coords: { row: number, col: number }[],
) {
  const table = getTable(editor, tablePos)
  if (!table || coords.length === 0) {
    return false
  }

  const normalized = coords
    .map((coord) => ({
      row: clamp(coord.row, 0, table.map.height - 1),
      col: clamp(coord.col, 0, table.map.width - 1),
    }))
    .filter((coord) => isWithinBounds(coord.row, coord.col, table.map))

  if (!normalized.length) {
    return false
  }

  const top = Math.min(...normalized.map((coord) => coord.row))
  const bottom = Math.max(...normalized.map((coord) => coord.row))
  const left = Math.min(...normalized.map((coord) => coord.col))
  const right = Math.max(...normalized.map((coord) => coord.col))

  const anchorPosition = getCellSelectionPositions(table, top, left)
  if (anchorPosition == null) {
    return false
  }

  let headPosition = getCellSelectionPositions(table, bottom, right)
  if (headPosition == null) {
    return false
  }

  if (headPosition === anchorPosition) {
    for (let row = bottom; row >= top; row -= 1) {
      for (let col = right; col >= left; col -= 1) {
        const candidatePosition = getCellSelectionPositions(table, row, col)
        if (candidatePosition != null && candidatePosition !== anchorPosition) {
          headPosition = candidatePosition
          row = top - 1
          break
        }
      }
    }
  }

  try {
    const cellSelection = new CellSelection(
      editor.state.doc.resolve(anchorPosition),
      editor.state.doc.resolve(headPosition),
    )
    editor.view.dispatch(editor.state.tr.setSelection(cellSelection))
    return true
  } catch {
    return false
  }
}

export function selectAxis(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const table = getTable(editor, tablePos)
  if (!table) {
    return false
  }

  const resolvedIndex = resolveOrientationIndex(editor.state, table, orientation, index)
  if (resolvedIndex == null) {
    return false
  }

  const coords = orientation === 'row'
    ? Array.from({ length: table.map.width }, (_, column) => ({ row: resolvedIndex, col: column }))
    : Array.from({ length: table.map.height }, (_, row) => ({ row, col: resolvedIndex }))

  return selectCellsByCoords(editor, table.pos, coords)
}

export function toggleSelectedHeader(editor: any, orientation: TableOrientation) {
  const command = orientation === 'row' ? toggleHeaderRow : toggleHeaderColumn
  return command(editor.state, editor.view.dispatch.bind(editor.view))
}

export function setSelectedCellAttr(editor: any, attr: 'bgcolor' | 'textAlign' | 'verticalAlign', value: string | null) {
  return setCellAttr(attr, value)(editor.state, editor.view.dispatch.bind(editor.view))
}

export function getSelectedCellAttr(
  editor: any,
  attr: 'bgcolor' | 'textAlign' | 'verticalAlign',
) {
  const { from, to, $from } = editor.state.selection
  let selectedValue: string | null = null

  editor.state.doc.nodesBetween(from, to, (node: any) => {
    if (tableCellNodeNames.has(node.type.name)) {
      selectedValue = typeof node.attrs[attr] === 'string' && node.attrs[attr]
        ? node.attrs[attr]
        : null
      return false
    }

    return selectedValue === null
  })

  if (selectedValue !== null) {
    return selectedValue
  }

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (tableCellNodeNames.has(node.type.name)) {
      return typeof node.attrs[attr] === 'string' && node.attrs[attr]
        ? node.attrs[attr]
        : null
    }
  }

  return null
}

export function canMergeSelectedCells(editor: any) {
  try {
    return mergeCells(editor.state, undefined)
  } catch {
    return false
  }
}

export function canSplitSelectedCell(editor: any) {
  try {
    return splitCell(editor.state, undefined)
  } catch {
    return false
  }
}

export function mergeSelectedCells(editor: any) {
  return mergeCells(editor.state, editor.view.dispatch.bind(editor.view))
}

export function splitSelectedCell(editor: any) {
  return splitCell(editor.state, editor.view.dispatch.bind(editor.view))
}

export function clearAxisContent(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const table = getTable(editor, tablePos)
  if (!table) {
    return false
  }

  const resolvedIndex = getAxisIndex(editor, orientation, index, table.pos)
  if (resolvedIndex == null) {
    return false
  }

  if (!selectAxis(editor, orientation, resolvedIndex, table.pos)) {
    return false
  }

  return deleteCellSelection(editor.state, editor.view.dispatch.bind(editor.view))
}

export function clearCurrentCellContent(editor: any) {
  const { state, view } = editor

  if (state.selection instanceof CellSelection) {
    return deleteCellSelection(state, view.dispatch.bind(view))
  }

  const cell = cellAround(state.selection.$anchor)
  if (!cell) {
    return false
  }

  const cellNode = state.doc.nodeAt(cell.pos)
  if (!cellNode) {
    return false
  }

  const from = cell.pos + 1
  const to = cell.pos + cellNode.nodeSize - 1

  if (from >= to) {
    return false
  }

  view.dispatch(state.tr.delete(from, to))
  return true
}

export function applyTextColorToSelection(editor: any, color: string | null) {
  const textColorMark = editor.state.schema.marks.textColor
  if (!textColorMark) {
    return false
  }

  if (editor.state.selection instanceof CellSelection) {
    const tr = editor.state.tr

    editor.state.selection.forEachCell((cellNode: ProseMirrorNode, cellPos: number) => {
      if (cellNode.content.size === 0) {
        return
      }

      const from = cellPos + 1
      const to = cellPos + cellNode.nodeSize - 1

      if (from >= to) {
        return
      }

      tr.removeMark(from, to, textColorMark)

      if (color) {
        tr.addMark(from, to, textColorMark.create({ color }))
      }
    })

    if (tr.docChanged) {
      editor.view.dispatch(tr.scrollIntoView())
      return true
    }

    return false
  }

  if (color) {
    return editor.commands.addTextColor?.({ color }) ?? false
  }

  return editor.commands.removeTextColor?.() ?? false
}

export function duplicateAxis(
  editor: any,
  orientation: TableOrientation,
  index?: number,
  tablePos?: number,
) {
  const table = getTable(editor, tablePos)
  if (!table) {
    return false
  }

  const resolvedIndex = getAxisIndex(editor, orientation, index, table.pos)
  if (resolvedIndex == null || !canDuplicateAxis(editor, orientation, resolvedIndex, table.pos)) {
    return false
  }

  if (!selectAxis(editor, orientation, resolvedIndex, table.pos)) {
    return false
  }

  const inserted = orientation === 'row'
    ? editor.commands.addTableRowBelow?.()
    : editor.commands.addTableColumnAfter?.()

  if (!inserted) {
    return false
  }

  const updatedTable = getTable(editor, table.pos)
  if (!updatedTable) {
    return false
  }

  const newCells = dedupeCells(getAxisCells(editor, orientation, resolvedIndex + 1, updatedTable.pos).cells)
  const originalCells = dedupeCells(getAxisCells(editor, orientation, resolvedIndex, updatedTable.pos).cells)

  if (!newCells.length || !originalCells.length) {
    return false
  }

  let tr = editor.state.tr

  if (orientation === 'row') {
    const cellsToSkip = new Set<number>()

    getUniqueCellsWithRect(updatedTable).forEach(({ pos, node, rect }) => {
      const rowspan = typeof node.attrs.rowspan === 'number' ? node.attrs.rowspan : 1
      const colspan = rect.right - rect.left

      if (rowspan > 1 && rect.top === resolvedIndex) {
        tr = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          rowspan: rowspan + 1,
        }, node.marks)
      } else if (rowspan > 1 && rect.top < resolvedIndex && resolvedIndex < rect.bottom) {
        for (let column = rect.left; column < rect.left + colspan; column += 1) {
          cellsToSkip.add(column)
        }
      }
    })

    const originalCellByColumn = new Map<number, CellInfo>()
    for (const cell of originalCells) {
      originalCellByColumn.set(cell.column, cell)
    }

    for (const newCell of [...newCells].reverse()) {
      if (cellsToSkip.has(newCell.column)) {
        continue
      }

      const originalCell = originalCellByColumn.get(newCell.column)
      if (!originalCell) {
        continue
      }

      const duplicatedCell = newCell.node.type.create(
        { ...originalCell.node.attrs },
        originalCell.node.content,
        originalCell.node.marks,
      )

      tr = tr.replaceWith(newCell.pos, newCell.pos + newCell.node.nodeSize, duplicatedCell)
    }
  } else {
    const originalCellByRow = new Map<number, CellInfo>()
    for (const cell of originalCells) {
      originalCellByRow.set(cell.row, cell)
    }

    for (const newCell of [...newCells].reverse()) {
      const originalCell = originalCellByRow.get(newCell.row)
      if (!originalCell) {
        continue
      }

      const duplicatedCell = newCell.node.type.create(
        { ...originalCell.node.attrs },
        originalCell.node.content,
        originalCell.node.marks,
      )

      tr = tr.replaceWith(newCell.pos, newCell.pos + newCell.node.nodeSize, duplicatedCell)
    }
  }

  if (!tr.docChanged) {
    return false
  }

  editor.view.dispatch(tr)
  return true
}

export function getSelectedCellElement(editor: any) {
  const view = editor.view
  const selectedCell = view.dom.querySelector('td.selectedCell, th.selectedCell') as HTMLTableCellElement | null
  if (selectedCell) {
    return selectedCell
  }

  const { node } = view.domAtPos(view.state.selection.from)
  const element = node.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node.parentElement

  return element?.closest('td, th') as HTMLTableCellElement | null
}

export function getSelectedTableWrapperElement(editor: any) {
  return getSelectedCellElement(editor)?.closest('.tableWrapper') as HTMLDivElement | null
}

export function getSelectedTableOverlayElement(editor: any) {
  return getSelectedTableWrapperElement(editor)
    ?.querySelector<HTMLDivElement>(':scope > .pk-table-selection-overlay-container') ?? null
}

export function getSingleSelectedCellRect(editor: any) {
  const view = editor.view
  const selectedCells = Array.from(
    view.dom.querySelectorAll('td.selectedCell, th.selectedCell'),
  ) as HTMLElement[]

  if (selectedCells.length > 1) {
    const rects = selectedCells
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)

    if (!rects.length) {
      return null
    }

    const left = Math.min(...rects.map((rect) => rect.left))
    const right = Math.max(...rects.map((rect) => rect.right))
    const top = Math.min(...rects.map((rect) => rect.top))
    const bottom = Math.max(...rects.map((rect) => rect.bottom))

    return new DOMRect(left, top, right - left, bottom - top)
  }

  const cell = getSelectedCellElement(editor)

  return cell?.getBoundingClientRect() ?? null
}

export function moveSelectionToCellStart(editor: any) {
  const { state } = editor
  const cell = cellAround(state.selection.$anchor)
  if (!cell) {
    return false
  }

  const pos = clamp(cell.pos + 1, 0, state.doc.content.size)
  editor.view.dispatch(
    state.tr.setSelection(TextSelection.near(state.doc.resolve(pos), 1)).scrollIntoView(),
  )
  return true
}
