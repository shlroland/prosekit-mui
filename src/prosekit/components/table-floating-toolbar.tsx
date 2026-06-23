import {
  TableHandleColumnMenuRoot,
  TableHandleColumnMenuTrigger,
  TableHandleColumnPopup,
  TableHandleColumnPositioner,
  TableHandleDragPreview,
  TableHandleDropIndicator,
  TableHandleRoot,
  TableHandleRowMenuRoot,
  TableHandleRowMenuTrigger,
  TableHandleRowPopup,
  TableHandleRowPositioner,
} from 'prosekit/react/table-handle'
import {
  MenuPopup,
  MenuPositioner,
} from 'prosekit/react/menu'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useMemo, type ReactNode } from 'react'

import {
  DeleteBack2LineIcon,
  DeleteColumnIcon,
  DeleteLineIcon,
  DeleteRowIcon,
  FileCopyLineIcon,
  InsertColumnLeftIcon,
  InsertColumnRightIcon,
  InsertRowBottomIcon,
  InsertRowTopIcon,
  LayoutLeft2LineIcon,
  LayoutTop2LineIcon,
  MoreLineIcon,
} from '../../icons'
import { Tooltip } from '../../ui'
import {
  applyTextColorToSelection,
  areAxisCellsAllHeader,
  axisHasContent,
  canDuplicateAxis,
  clearAxisContent,
  duplicateAxis,
  getAxisIndex,
  getSelectedCellAttr,
  isFirstAxis,
  selectAxis,
  setSelectedCellAttr,
  toggleSelectedHeader,
  type TableCellTextAlign,
  type TableCellVerticalAlign,
  type TableOrientation,
} from './table-utils'
import {
  TableAlignSubmenu,
  TableColorSubmenu,
  TableMenuActionItem,
  TableMenuDivider,
} from './table-menu-content'

type TableCommandName =
  | 'addTableColumnBefore'
  | 'addTableColumnAfter'
  | 'addTableRowAbove'
  | 'addTableRowBelow'
  | 'deleteTableColumn'
  | 'deleteTableRow'
  | 'deleteTable'

type TableHandleSnapshot = {
  canAddColumnAfter: boolean
  canAddColumnBefore: boolean
  canAddRowAbove: boolean
  canAddRowBelow: boolean
  canDeleteColumn: boolean
  canDeleteRow: boolean
  canDeleteTable: boolean
  columnCanClear: boolean
  columnCanDuplicate: boolean
  columnIndex: number | null
  columnIsHeader: boolean
  columnIsFirst: boolean
  rowCanClear: boolean
  rowCanDuplicate: boolean
  rowIndex: number | null
  rowIsHeader: boolean
  rowIsFirst: boolean
  selectedTextAlign: TableCellTextAlign | null
  selectedVerticalAlign: TableCellVerticalAlign | null
}

function normalizeTextAlign(value: string | null): TableCellTextAlign | null {
  return value === 'left' || value === 'center' || value === 'right' || value === 'justify'
    ? value
    : null
}

function normalizeVerticalAlign(value: string | null): TableCellVerticalAlign | null {
  return value === 'top' || value === 'middle' || value === 'bottom'
    ? value
    : null
}

function getTableHandleSnapshot(editor: any): string {
  if (!editor.mounted) {
    return JSON.stringify({
      canAddColumnAfter: false,
      canAddColumnBefore: false,
      canAddRowAbove: false,
      canAddRowBelow: false,
      canDeleteColumn: false,
      canDeleteRow: false,
      canDeleteTable: false,
      columnCanClear: false,
      columnCanDuplicate: false,
      columnIndex: null,
      columnIsHeader: false,
      columnIsFirst: false,
      rowCanClear: false,
      rowCanDuplicate: false,
      rowIndex: null,
      rowIsHeader: false,
      rowIsFirst: false,
      selectedTextAlign: null,
      selectedVerticalAlign: null,
    } satisfies TableHandleSnapshot)
  }

  return JSON.stringify({
    canAddColumnAfter: editor.commands.addTableColumnAfter?.canExec?.() ?? false,
    canAddColumnBefore: editor.commands.addTableColumnBefore?.canExec?.() ?? false,
    canAddRowAbove: editor.commands.addTableRowAbove?.canExec?.() ?? false,
    canAddRowBelow: editor.commands.addTableRowBelow?.canExec?.() ?? false,
    canDeleteColumn: editor.commands.deleteTableColumn?.canExec?.() ?? false,
    canDeleteRow: editor.commands.deleteTableRow?.canExec?.() ?? false,
    canDeleteTable: editor.commands.deleteTable?.canExec?.() ?? false,
    columnCanClear: axisHasContent(editor, 'column'),
    columnCanDuplicate: canDuplicateAxis(editor, 'column'),
    columnIndex: getAxisIndex(editor, 'column'),
    columnIsHeader: areAxisCellsAllHeader(editor, 'column'),
    columnIsFirst: isFirstAxis(editor, 'column'),
    rowCanClear: axisHasContent(editor, 'row'),
    rowCanDuplicate: canDuplicateAxis(editor, 'row'),
    rowIndex: getAxisIndex(editor, 'row'),
    rowIsHeader: areAxisCellsAllHeader(editor, 'row'),
    rowIsFirst: isFirstAxis(editor, 'row'),
    selectedTextAlign: normalizeTextAlign(getSelectedCellAttr(editor, 'textAlign')),
    selectedVerticalAlign: normalizeVerticalAlign(getSelectedCellAttr(editor, 'verticalAlign')),
  } satisfies TableHandleSnapshot)
}

function TableHandleTrigger({
  title,
  orientation,
}: {
  title: string
  orientation: 'horizontal' | 'vertical'
}) {
  return (
    <Tooltip content={title}>
      <div
        className={
          orientation === 'horizontal'
            ? 'pk:inline-flex pk:h-3 pk:w-7 pk:items-center pk:justify-center pk:rounded-md pk:bg-[var(--editor-surface)] pk:text-[var(--editor-muted-foreground)] pk:shadow-[0_4px_14px_rgba(15,23,42,0.14)] pk:transition-colors hover:pk:bg-[var(--editor-primary)] hover:pk:text-white'
            : 'pk:inline-flex pk:h-7 pk:w-3 pk:items-center pk:justify-center pk:rounded-md pk:bg-[var(--editor-surface)] pk:text-[var(--editor-muted-foreground)] pk:shadow-[0_4px_14px_rgba(15,23,42,0.14)] pk:transition-colors hover:pk:bg-[var(--editor-primary)] hover:pk:text-white'
        }
      >
        <MoreLineIcon
          className={
            orientation === 'horizontal'
              ? 'pk:h-4 pk:w-4'
              : 'pk:h-4 pk:w-4 pk:rotate-90'
          }
        />
      </div>
    </Tooltip>
  )
}

function TableToolbarSurface({ children }: { children: ReactNode }) {
  return (
    <div
      className="pk:min-w-[216px] pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
      data-editor-floating
    >
      {children}
    </div>
  )
}

type TableHandleMenuProps = {
  editor: any
  orientation: TableOrientation
  state: TableHandleSnapshot
}

function TableHandleMenu({ editor, orientation, state }: TableHandleMenuProps) {
  const index = orientation === 'row' ? state.rowIndex : state.columnIndex
  const isHeader = orientation === 'row' ? state.rowIsHeader : state.columnIsHeader
  const isFirst = orientation === 'row' ? state.rowIsFirst : state.columnIsFirst
  const canDuplicate = orientation === 'row' ? state.rowCanDuplicate : state.columnCanDuplicate
  const canClear = orientation === 'row' ? state.rowCanClear : state.columnCanClear
  const canDelete = orientation === 'row' ? state.canDeleteRow : state.canDeleteColumn

  function ensureSelected() {
    if (index == null) {
      return false
    }

    return selectAxis(editor, orientation, index)
  }

  function runCommand(name: TableCommandName) {
    editor.focus()

    if (!ensureSelected()) {
      return
    }

    editor.commands[name]?.()
  }

  function applyTextColor(color: string) {
    editor.focus()
    if (ensureSelected()) {
      applyTextColorToSelection(editor, color)
    }
  }

  function applyBackgroundColor(color: string) {
    editor.focus()
    if (ensureSelected()) {
      setSelectedCellAttr(editor, 'bgcolor', color === 'transparent' ? null : color)
    }
  }

  function applyTextAlign(value: TableCellTextAlign) {
    editor.focus()
    if (ensureSelected()) {
      setSelectedCellAttr(editor, 'textAlign', value)
    }
  }

  function applyVerticalAlign(value: TableCellVerticalAlign) {
    editor.focus()
    if (ensureSelected()) {
      setSelectedCellAttr(editor, 'verticalAlign', value)
    }
  }

  function duplicateCurrentAxis() {
    editor.focus()
    duplicateAxis(editor, orientation, index ?? undefined)
  }

  function clearAxisContentSafely() {
    editor.focus()
    if (index == null) {
      return
    }

    clearAxisContent(editor, orientation, index)
  }

  function toggleHeader() {
    editor.focus()
    if (ensureSelected()) {
      toggleSelectedHeader(editor, orientation)
    }
  }

  return (
    <TableToolbarSurface>
      {isFirst ? (
        <>
          <TableMenuActionItem
            label={orientation === 'row'
              ? (isHeader ? '取消行表头' : '切换行表头')
              : (isHeader ? '取消列表头' : '切换列表头')}
            icon={orientation === 'row'
              ? <LayoutTop2LineIcon className="pk:h-4 pk:w-4" />
              : <LayoutLeft2LineIcon className="pk:h-4 pk:w-4" />}
            onSelect={toggleHeader}
          />
          <TableMenuDivider />
        </>
      ) : null}

      <TableMenuActionItem
        label={orientation === 'row' ? '上方插入行' : '左侧插入列'}
        icon={orientation === 'row'
          ? <InsertRowTopIcon className="pk:h-4 pk:w-4" />
          : <InsertColumnLeftIcon className="pk:h-4 pk:w-4" />}
        disabled={orientation === 'row' ? !state.canAddRowAbove : !state.canAddColumnBefore}
        onSelect={() => runCommand(orientation === 'row' ? 'addTableRowAbove' : 'addTableColumnBefore')}
      />
      <TableMenuActionItem
        label={orientation === 'row' ? '下方插入行' : '右侧插入列'}
        icon={orientation === 'row'
          ? <InsertRowBottomIcon className="pk:h-4 pk:w-4" />
          : <InsertColumnRightIcon className="pk:h-4 pk:w-4" />}
        disabled={orientation === 'row' ? !state.canAddRowBelow : !state.canAddColumnAfter}
        onSelect={() => runCommand(orientation === 'row' ? 'addTableRowBelow' : 'addTableColumnAfter')}
      />
      <TableMenuDivider />
      <TableColorSubmenu
        onApplyTextColor={applyTextColor}
        onApplyBackgroundColor={applyBackgroundColor}
      />
      <TableAlignSubmenu
        selectedTextAlign={state.selectedTextAlign}
        selectedVerticalAlign={state.selectedVerticalAlign}
        onApplyTextAlign={applyTextAlign}
        onApplyVerticalAlign={applyVerticalAlign}
      />
      <TableMenuDivider />
      <TableMenuActionItem
        label={orientation === 'row' ? '清空当前行内容' : '清空当前列内容'}
        icon={<DeleteBack2LineIcon className="pk:h-4 pk:w-4" />}
        disabled={!canClear}
        onSelect={clearAxisContentSafely}
      />
      <TableMenuActionItem
        label={orientation === 'row' ? '复制当前行' : '复制当前列'}
        icon={<FileCopyLineIcon className="pk:h-4 pk:w-4" />}
        disabled={!canDuplicate}
        onSelect={duplicateCurrentAxis}
      />
      <TableMenuActionItem
        label={orientation === 'row' ? '删除当前行' : '删除当前列'}
        icon={orientation === 'row'
          ? <DeleteRowIcon className="pk:h-4 pk:w-4" />
          : <DeleteColumnIcon className="pk:h-4 pk:w-4" />}
        disabled={!canDelete}
        onSelect={() => runCommand(orientation === 'row' ? 'deleteTableRow' : 'deleteTableColumn')}
      />
      <TableMenuActionItem
        label="删除表格"
        icon={<DeleteLineIcon className="pk:h-4 pk:w-4" />}
        disabled={!state.canDeleteTable}
        onSelect={() => runCommand('deleteTable')}
      />
    </TableToolbarSurface>
  )
}

export function TableFloatingToolbar() {
  const editor = useEditor<any>()
  const snapshot = useEditorDerivedValue<any, string>(getTableHandleSnapshot)
  const state = useMemo(() => JSON.parse(snapshot) as TableHandleSnapshot, [snapshot])

  return (
    <TableHandleRoot editor={editor}>
      <TableHandleDragPreview editor={editor} />
      <TableHandleDropIndicator editor={editor} />

      <TableHandleColumnPositioner
        editor={editor}
        placement="top"
        offset={-2}
        strategy="fixed"
        hoist
      >
        <TableHandleColumnPopup>
          <TableHandleColumnMenuRoot>
            <TableHandleColumnMenuTrigger editor={editor}>
              <TableHandleTrigger title="列操作" orientation="horizontal" />
            </TableHandleColumnMenuTrigger>
            <MenuPositioner placement="top" offset={8} strategy="fixed" hoist>
              <MenuPopup className="pk:outline-none">
                <TableHandleMenu editor={editor} orientation="column" state={state} />
              </MenuPopup>
            </MenuPositioner>
          </TableHandleColumnMenuRoot>
        </TableHandleColumnPopup>
      </TableHandleColumnPositioner>

      <TableHandleRowPositioner
        editor={editor}
        placement="left"
        offset={-2}
        strategy="fixed"
        hoist
      >
        <TableHandleRowPopup>
          <TableHandleRowMenuRoot>
            <TableHandleRowMenuTrigger editor={editor}>
              <TableHandleTrigger title="行操作" orientation="vertical" />
            </TableHandleRowMenuTrigger>
            <MenuPositioner placement="left" offset={8} strategy="fixed" hoist>
              <MenuPopup className="pk:outline-none">
                <TableHandleMenu editor={editor} orientation="row" state={state} />
              </MenuPopup>
            </MenuPositioner>
          </TableHandleRowMenuRoot>
        </TableHandleRowPopup>
      </TableHandleRowPositioner>
    </TableHandleRoot>
  )
}
