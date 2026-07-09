import {
  defineCommands,
  definePlugin,
  getNodeType,
  insertNode,
  union,
  type PlainExtension,
  type Union,
} from 'prosekit/core'
import {
  defineTableCellSpec,
  defineTableCommands,
  defineTableDropIndicator,
  defineTableHeaderCellSpec,
  defineTableRowSpec,
  defineTableSpec,
  type TableCellSpecExtension,
  type TableCommandsExtension,
  type TableHeaderCellSpecExtension,
  type TableRowSpecExtension,
  type TableSpecExtension,
} from 'prosekit/extensions/table'
import type { Node as ProseMirrorNode, NodeType, Schema } from 'prosekit/pm/model'
import type { Command } from 'prosekit/pm/state'
import type { EditorView, NodeView, ViewMutationRecord } from 'prosekit/pm/view'
import {
  columnResizing,
  tableEditing,
  TableView,
} from 'prosemirror-tables'

type TableViewConstructor = new (
  node: ProseMirrorNode,
  defaultCellMinWidth: number,
  view?: EditorView,
) => NodeView

class TableOverlayView extends TableView {
  controlsContainer: HTMLDivElement
  selectionOverlayContainer: HTMLDivElement

  constructor(node: ProseMirrorNode, defaultCellMinWidth: number) {
    super(node, defaultCellMinWidth)

    this.controlsContainer = document.createElement('div')
    this.controlsContainer.className = 'pk-table-controls'
    this.controlsContainer.style.position = 'relative'
    this.controlsContainer.style.overflow = 'visible'
    this.controlsContainer.style.pointerEvents = 'none'

    this.selectionOverlayContainer = document.createElement('div')
    this.selectionOverlayContainer.className = 'pk-table-selection-overlay-container'
    this.selectionOverlayContainer.style.position = 'relative'
    this.selectionOverlayContainer.style.overflow = 'visible'
    this.selectionOverlayContainer.style.pointerEvents = 'none'

    this.dom.appendChild(this.controlsContainer)
    this.dom.appendChild(this.selectionOverlayContainer)
  }

  override ignoreMutation(record: ViewMutationRecord) {
    const target = record.target

    if (
      target instanceof Node
      && (
        this.controlsContainer.contains(target)
        || this.selectionOverlayContainer.contains(target)
      )
    ) {
      return true
    }

    return super.ignoreMutation(record)
  }
}

function defineTableOverlayPlugins(): PlainExtension {
  return definePlugin([
    tableEditing(),
    columnResizing({
      View: TableOverlayView as TableViewConstructor,
    }),
  ])
}

type InsertTableOptions = {
  row: number
  col: number
  header?: boolean
}

function createDefaultCellContent(cellType: NodeType) {
  const defaultType = cellType.contentMatch.defaultType
  if (!defaultType) {
    return null
  }

  const attrs = defaultType.spec.attrs && 'textAlign' in defaultType.spec.attrs
    ? { textAlign: null }
    : null

  return defaultType.createAndFill(attrs)
}

function createTableCell(cellType: NodeType) {
  const content = createDefaultCellContent(cellType)
  return content ? cellType.createAndFill(null, content) : cellType.createAndFill()
}

function repeatNode(node: ProseMirrorNode | null, length: number) {
  return Array.from({ length }, () => node).filter((item): item is ProseMirrorNode => Boolean(item))
}

function createEmptyTable(schema: Schema, row: number, col: number, header: boolean) {
  const tableType = getNodeType(schema, 'table')
  const tableRowType = getNodeType(schema, 'tableRow')
  const tableCellType = getNodeType(schema, 'tableCell')
  const tableHeaderCellType = getNodeType(schema, 'tableHeaderCell')

  if (header) {
    const headerCells = repeatNode(createTableCell(tableHeaderCellType), col)
    const headerRow = tableRowType.createAndFill(null, headerCells)
    const bodyCells = repeatNode(createTableCell(tableCellType), col)
    const bodyRows = repeatNode(tableRowType.createAndFill(null, bodyCells), row - 1)
    return tableType.createAndFill(null, [headerRow, ...bodyRows].filter((item): item is ProseMirrorNode => Boolean(item)))
  }

  const bodyCells = repeatNode(createTableCell(tableCellType), col)
  const bodyRows = repeatNode(tableRowType.createAndFill(null, bodyCells), row)
  return tableType.createAndFill(null, bodyRows)
}

function insertTableWithoutCellParagraphAlign(options: InsertTableOptions): Command {
  return (state, dispatch, view) => {
    const { row, col, header = false } = options
    const table = createEmptyTable(state.schema, row, col, header)
    if (!table) {
      return false
    }

    return insertNode({ node: table })(state, dispatch, view)
  }
}

function defineTableInsertCommands() {
  return defineCommands({
    insertTable: insertTableWithoutCellParagraphAlign,
  })
}

export type TableOverlayExtension = Union<
  [
    TableSpecExtension,
    TableRowSpecExtension,
    TableCellSpecExtension,
    TableHeaderCellSpecExtension,
    TableCommandsExtension,
  ]
>

export function defineTableExtension(): TableOverlayExtension {
  return union(
    defineTableSpec(),
    defineTableRowSpec(),
    defineTableCellSpec(),
    defineTableHeaderCellSpec(),
    defineTableOverlayPlugins(),
    defineTableCommands(),
    defineTableInsertCommands(),
    defineTableDropIndicator(),
  ) as TableOverlayExtension
}
