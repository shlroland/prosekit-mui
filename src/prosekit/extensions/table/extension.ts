import {
  definePlugin,
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
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
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
    defineTableDropIndicator(),
  ) as TableOverlayExtension
}
