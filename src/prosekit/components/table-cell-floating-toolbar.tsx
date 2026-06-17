import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import './toolbar.css'

import {
  AlignBottomIcon,
  AlignTopIcon,
  AlignVerticallyIcon,
  DeleteColumnIcon,
  DeleteLineIcon,
  DeleteRowIcon,
  InsertColumnLeftIcon,
  InsertColumnRightIcon,
  InsertRowBottomIcon,
  InsertRowTopIcon,
  MergeCellsHorizontalIcon,
  MoreLineIcon,
  SplitCellsHorizontalIcon,
} from '../../icons'
import { Button, Tooltip } from '../../ui'

type TableCellCommandName =
  | 'addTableColumnBefore'
  | 'addTableColumnAfter'
  | 'addTableRowAbove'
  | 'addTableRowBelow'
  | 'deleteCellSelection'
  | 'deleteTable'
  | 'deleteTableColumn'
  | 'deleteTableRow'
  | 'mergeTableCells'
  | 'setTableCellVerticalAlign'
  | 'splitTableCell'

type TableCellVerticalAlign = 'top' | 'middle' | 'bottom'

type RectLike = {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
  x: number
  y: number
}

type TableMenuAction = {
  disabled?: boolean
  icon: ReactNode
  key: string
  label: string
  onClick: () => void
  selected?: boolean
}

const tableCellNodeNames = new Set(['tableCell', 'tableHeaderCell'])

function normalizeVerticalAlign(value: unknown): TableCellVerticalAlign | null {
  if (value === 'top' || value === 'middle' || value === 'bottom') {
    return value
  }

  return null
}

function isInTableSelection(editor: any): boolean {
  const { $from } = editor.state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const nodeTypeName = $from.node(depth).type.name
    if (tableCellNodeNames.has(nodeTypeName)) {
      return true
    }
  }

  return false
}

function hasSelectedCellElements(editor: any): boolean {
  return Boolean(
    editor.view?.dom.querySelector('td.selectedCell, th.selectedCell'),
  )
}

function findSelectionCellElement(editor: any): HTMLTableCellElement | null {
  const view = editor.view
  const { from } = view.state.selection
  const { node } = view.domAtPos(from)
  const element = node.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node.parentElement

  return element?.closest('td, th') as HTMLTableCellElement | null
}

function getSelectionCellVerticalAlign(editor: any): TableCellVerticalAlign | null {
  const { state } = editor
  const { from, to, $from } = state.selection
  let selectedAlign: TableCellVerticalAlign | null = null

  state.doc.nodesBetween(from, to, (node: any) => {
    if (tableCellNodeNames.has(node.type.name)) {
      selectedAlign = normalizeVerticalAlign(node.attrs.verticalAlign)
      return false
    }

    return selectedAlign === null
  })

  if (selectedAlign !== null) {
    return selectedAlign
  }

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (tableCellNodeNames.has(node.type.name)) {
      return normalizeVerticalAlign(node.attrs.verticalAlign)
    }
  }

  return null
}

function getUnionRect(elements: Element[]): RectLike | null {
  const rects = elements
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0)

  if (!rects.length) {
    return null
  }

  const left = Math.min(...rects.map((rect) => rect.left))
  const right = Math.max(...rects.map((rect) => rect.right))
  const top = Math.min(...rects.map((rect) => rect.top))
  const bottom = Math.max(...rects.map((rect) => rect.bottom))

  return {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
  }
}

function findCurrentCellElement(editor: any): HTMLTableCellElement | null {
  const view = editor.view
  const selectedCells = Array.from(
    view.dom.querySelectorAll('td.selectedCell, th.selectedCell'),
  )
  const selectedCellsRect = getUnionRect(selectedCells)

  if (selectedCellsRect) {
    return {
      getBoundingClientRect: () => selectedCellsRect,
    } as HTMLTableCellElement
  }

  return findSelectionCellElement(editor)
}

function getTableCellToolbarSnapshot(editor: any): string {
  if (!editor.mounted) {
    return JSON.stringify({
      open: false,
      selectionFrom: 0,
      selectionTo: 0,
      canAddColumnAfter: false,
      canAddColumnBefore: false,
      canAddRowAbove: false,
      canAddRowBelow: false,
      canDelete: false,
      canDeleteColumn: false,
      canDeleteRow: false,
      canDeleteTable: false,
      canMerge: false,
      canSplit: false,
      hasSelectedCells: false,
      verticalAlign: null,
    })
  }

  const view = editor.view
  const open = Boolean(view) && isInTableSelection(editor)

  return JSON.stringify({
    open,
    selectionFrom: editor.state.selection.from,
    selectionTo: editor.state.selection.to,
    canAddColumnAfter: editor.commands.addTableColumnAfter?.canExec?.() ?? false,
    canAddColumnBefore: editor.commands.addTableColumnBefore?.canExec?.() ?? false,
    canAddRowAbove: editor.commands.addTableRowAbove?.canExec?.() ?? false,
    canAddRowBelow: editor.commands.addTableRowBelow?.canExec?.() ?? false,
    canDelete: editor.commands.deleteCellSelection?.canExec?.() ?? false,
    canDeleteColumn: editor.commands.deleteTableColumn?.canExec?.() ?? false,
    canDeleteRow: editor.commands.deleteTableRow?.canExec?.() ?? false,
    canDeleteTable: editor.commands.deleteTable?.canExec?.() ?? false,
    canMerge: editor.commands.mergeTableCells?.canExec?.() ?? false,
    canSplit: editor.commands.splitTableCell?.canExec?.() ?? false,
    hasSelectedCells: hasSelectedCellElements(editor),
    verticalAlign: getSelectionCellVerticalAlign(editor),
  })
}

export function TableCellFloatingToolbar() {
  const editor = useEditor<any>()
  const [menuOpen, setMenuOpen] = useState(false)
  const snapshot = useEditorDerivedValue<any, string>(getTableCellToolbarSnapshot)
  const toolbarState = useMemo(() => {
    return JSON.parse(snapshot) as {
      canAddColumnAfter: boolean
      canAddColumnBefore: boolean
      canAddRowAbove: boolean
      canAddRowBelow: boolean
      canDelete: boolean
      canDeleteColumn: boolean
      canDeleteRow: boolean
      canDeleteTable: boolean
      canMerge: boolean
      canSplit: boolean
      hasSelectedCells: boolean
      open: boolean
      selectionFrom: number
      selectionTo: number
      verticalAlign: TableCellVerticalAlign | null
    }
  }, [snapshot])
  const cellRect = useMemo<RectLike | null>(() => {
    if (!toolbarState.open || !editor.mounted || typeof document === 'undefined') {
      return null
    }

    const cellElement = findCurrentCellElement(editor)
    if (!cellElement) {
      return null
    }

    const rect = cellElement.getBoundingClientRect()

    return {
      bottom: rect.bottom,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width,
      x: rect.x,
      y: rect.y,
    }
  }, [
    editor,
    toolbarState.hasSelectedCells,
    toolbarState.open,
    toolbarState.selectionFrom,
    toolbarState.selectionTo,
  ])
  useEffect(() => {
    if (!toolbarState.open) {
      setMenuOpen(false)
    }
  }, [toolbarState.open])

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const closeMenu = () => setMenuOpen(false)

    window.addEventListener('resize', closeMenu)
    window.addEventListener('scroll', closeMenu, true)

    return () => {
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('scroll', closeMenu, true)
    }
  }, [menuOpen])

  function runCommand(name: TableCellCommandName, value?: TableCellVerticalAlign) {
    editor.focus()
    editor.commands[name]?.(value)
  }

  const actions = useMemo<TableMenuAction[]>(() => {
    return [
      {
        key: 'add-column-before',
        label: '左侧插入列',
        icon: <InsertColumnLeftIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canAddColumnBefore,
        onClick: () => runCommand('addTableColumnBefore'),
      },
      {
        key: 'add-column-after',
        label: '右侧插入列',
        icon: <InsertColumnRightIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canAddColumnAfter,
        onClick: () => runCommand('addTableColumnAfter'),
      },
      {
        key: 'delete-column',
        label: '删除当前列',
        icon: <DeleteColumnIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canDeleteColumn,
        onClick: () => runCommand('deleteTableColumn'),
      },
      {
        key: 'add-row-above',
        label: '上方插入行',
        icon: <InsertRowTopIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canAddRowAbove,
        onClick: () => runCommand('addTableRowAbove'),
      },
      {
        key: 'add-row-below',
        label: '下方插入行',
        icon: <InsertRowBottomIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canAddRowBelow,
        onClick: () => runCommand('addTableRowBelow'),
      },
      {
        key: 'delete-row',
        label: '删除当前行',
        icon: <DeleteRowIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canDeleteRow,
        onClick: () => runCommand('deleteTableRow'),
      },
      {
        key: 'merge-cells',
        label: '合并单元格',
        icon: <MergeCellsHorizontalIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canMerge,
        onClick: () => runCommand('mergeTableCells'),
      },
      {
        key: 'split-cell',
        label: '拆分单元格',
        icon: <SplitCellsHorizontalIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canSplit,
        onClick: () => runCommand('splitTableCell'),
      },
      {
        key: 'vertical-align-top',
        label: '顶端对齐',
        icon: <AlignTopIcon className="table-cell-menu-icon" />,
        selected: toolbarState.verticalAlign === 'top',
        onClick: () => runCommand('setTableCellVerticalAlign', 'top'),
      },
      {
        key: 'vertical-align-middle',
        label: '垂直居中',
        icon: <AlignVerticallyIcon className="table-cell-menu-icon" />,
        selected: toolbarState.verticalAlign === 'middle',
        onClick: () => runCommand('setTableCellVerticalAlign', 'middle'),
      },
      {
        key: 'vertical-align-bottom',
        label: '底端对齐',
        icon: <AlignBottomIcon className="table-cell-menu-icon" />,
        selected: toolbarState.verticalAlign === 'bottom',
        onClick: () => runCommand('setTableCellVerticalAlign', 'bottom'),
      },
      {
        key: 'clear-cells',
        label: '清空选中单元格',
        icon: <DeleteLineIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canDelete,
        onClick: () => runCommand('deleteCellSelection'),
      },
      {
        key: 'delete-table',
        label: '删除表格',
        icon: <DeleteLineIcon className="table-cell-menu-icon" />,
        disabled: !toolbarState.canDeleteTable,
        onClick: () => runCommand('deleteTable'),
      },
    ]
  }, [toolbarState])

  if (!cellRect) {
    return null
  }

  return (
    <>
      {!toolbarState.hasSelectedCells ? (
        <div
          className="table-cell-focus-overlay"
          style={{
            top: cellRect.top - 1,
            left: cellRect.left - 1,
            width: cellRect.width + 2,
            height: cellRect.height + 2,
          }}
        />
      ) : null}
      <div
        className="table-cell-menu-anchor"
        style={{
          top: cellRect.top + 6,
          left: cellRect.left + cellRect.width - 30,
        }}
      >
        <Tooltip content="单元格操作">
          <Button
            variant="ghost"
            size="icon"
            aria-label="单元格操作"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setMenuOpen((open) => !open)}
            className="table-cell-menu-trigger"
          >
            <MoreLineIcon className="table-cell-menu-trigger-icon" />
          </Button>
        </Tooltip>
      </div>
      {menuOpen ? (
        <div
          className="table-cell-menu-paper"
          data-editor-floating
          style={{
            top: cellRect.top + 34,
            left: Math.max(8, cellRect.left + cellRect.width - 184),
          }}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              disabled={action.disabled}
              data-selected={action.selected ? 'true' : 'false'}
              className="table-cell-menu-item"
              onClick={() => {
                action.onClick()
                setMenuOpen(false)
              }}
            >
              <span className="table-cell-menu-item-icon">{action.icon}</span>
              <span className="table-cell-menu-item-label">{action.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </>
  )
}
