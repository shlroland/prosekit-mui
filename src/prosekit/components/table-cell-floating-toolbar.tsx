import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
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
  | 'splitTableCell'

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
}

function isInTableSelection(editor: any): boolean {
  const { $from } = editor.state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const nodeTypeName = $from.node(depth).type.name
    if (nodeTypeName === 'tableCell' || nodeTypeName === 'tableHeader') {
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
  })
}

export function TableCellFloatingToolbar() {
  const editor = useEditor<any>()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
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
  const iconProps = { sx: { fontSize: '1rem' } }

  useEffect(() => {
    if (!toolbarState.open) {
      setMenuAnchor(null)
    }
  }, [toolbarState.open])

  function runCommand(name: TableCellCommandName) {
    editor.focus()
    editor.commands[name]?.()
  }

  const actions = useMemo<TableMenuAction[]>(() => {
    return [
      {
        key: 'add-column-before',
        label: '左侧插入列',
        icon: <InsertColumnLeftIcon {...iconProps} />,
        disabled: !toolbarState.canAddColumnBefore,
        onClick: () => runCommand('addTableColumnBefore'),
      },
      {
        key: 'add-column-after',
        label: '右侧插入列',
        icon: <InsertColumnRightIcon {...iconProps} />,
        disabled: !toolbarState.canAddColumnAfter,
        onClick: () => runCommand('addTableColumnAfter'),
      },
      {
        key: 'delete-column',
        label: '删除当前列',
        icon: <DeleteColumnIcon {...iconProps} />,
        disabled: !toolbarState.canDeleteColumn,
        onClick: () => runCommand('deleteTableColumn'),
      },
      {
        key: 'add-row-above',
        label: '上方插入行',
        icon: <InsertRowTopIcon {...iconProps} />,
        disabled: !toolbarState.canAddRowAbove,
        onClick: () => runCommand('addTableRowAbove'),
      },
      {
        key: 'add-row-below',
        label: '下方插入行',
        icon: <InsertRowBottomIcon {...iconProps} />,
        disabled: !toolbarState.canAddRowBelow,
        onClick: () => runCommand('addTableRowBelow'),
      },
      {
        key: 'delete-row',
        label: '删除当前行',
        icon: <DeleteRowIcon {...iconProps} />,
        disabled: !toolbarState.canDeleteRow,
        onClick: () => runCommand('deleteTableRow'),
      },
      {
        key: 'merge-cells',
        label: '合并单元格',
        icon: <MergeCellsHorizontalIcon {...iconProps} />,
        disabled: !toolbarState.canMerge,
        onClick: () => runCommand('mergeTableCells'),
      },
      {
        key: 'split-cell',
        label: '拆分单元格',
        icon: <SplitCellsHorizontalIcon {...iconProps} />,
        disabled: !toolbarState.canSplit,
        onClick: () => runCommand('splitTableCell'),
      },
      {
        key: 'clear-cells',
        label: '清空选中单元格',
        icon: <DeleteLineIcon {...iconProps} />,
        disabled: !toolbarState.canDelete,
        onClick: () => runCommand('deleteCellSelection'),
      },
      {
        key: 'delete-table',
        label: '删除表格',
        icon: <DeleteLineIcon {...iconProps} />,
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
        <Box
          sx={(theme) => ({
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: theme.zIndex.modal + 2,
            top: cellRect.top - 1,
            left: cellRect.left - 1,
            width: cellRect.width + 2,
            height: cellRect.height + 2,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 0.75,
            boxShadow: `0 0 0 1px ${alpha(theme.palette.common.white, 0.85)}`,
          })}
        />
      ) : null}
      <Box
        sx={{
          position: 'fixed',
          zIndex: (theme) => theme.zIndex.modal + 3,
          top: cellRect.top + 6,
          left: cellRect.left + cellRect.width - 30,
        }}
      >
        <Tooltip title="单元格操作" arrow>
          <span>
            <IconButton
              size="small"
              aria-label="单元格操作"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={(theme) => ({
                width: 24,
                height: 24,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                borderRadius: 0.75,
                bgcolor: 'background.paper',
                color: 'text.secondary',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'text.primary',
                },
              })}
            >
              <MoreLineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 0.75,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              minWidth: 184,
            },
          },
        }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.key}
            disabled={action.disabled}
            onClick={() => {
              action.onClick()
              setMenuAnchor(null)
            }}
          >
            <ListItemIcon>{action.icon}</ListItemIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
