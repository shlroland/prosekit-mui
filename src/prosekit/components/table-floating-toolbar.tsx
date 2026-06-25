import {
  TableHandleColumnMenuRoot,
  TableHandleColumnMenuTrigger,
  TableHandleDragPreview,
  TableHandleDropIndicator,
  TableHandleRoot,
  TableHandleRowMenuRoot,
  TableHandleRowMenuTrigger,
} from 'prosekit/react/table-handle'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

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
  SkipDownIcon,
  SkipLeftIcon,
  SkipRightIcon,
  SkipUpIcon,
} from '../../icons'
import { EditorFloatingPopover, Tooltip } from '../../ui'
import {
  applyTextColorToSelection,
  areAxisCellsAllHeader,
  axisHasContent,
  canDuplicateAxis,
  clearAxisContent,
  duplicateAxis,
  getAxisDomRect,
  getAxisIndex,
  getDomTableCell,
  getHoveringTableCellInfo,
  getHoveringTableCellInfoFromDomCell,
  getSelectedCellAttr,
  getTable,
  isFirstAxis,
  selectAxis,
  setSelectedCellAttr,
  toggleSelectedHeader,
  type HoveringTableCellInfo,
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
  columnWidth: number | null
  columnIsHeader: boolean
  columnIsFirst: boolean
  rowCanClear: boolean
  rowCanDuplicate: boolean
  rowIndex: number | null
  rowHeight: number | null
  rowIsHeader: boolean
  rowIsFirst: boolean
  selectedTextAlign: TableCellTextAlign | null
  selectedVerticalAlign: TableCellVerticalAlign | null
  tablePos: number | null
}

type TableHandleGeometry = {
  columnStyle: CSSProperties
  rowStyle: CSSProperties
}

type TableHandleHoverState = {
  cell: HoveringTableCellInfo
  geometry: TableHandleGeometry
}

function getHandleGeometry(cell: HoveringTableCellInfo): TableHandleGeometry {
  return {
    columnStyle: {
      position: 'fixed',
      top: `${cell.tableRect.top - 16}px`,
      left: `${cell.columnRect.left}px`,
      width: `${cell.columnRect.width}px`,
      height: '12px',
      zIndex: 40,
      ['--table-handle-ref-width' as string]: `${cell.columnRect.width}px`,
      ['--table-handle-ref-height' as string]: `${cell.tableRect.height}px`,
    },
    rowStyle: {
      position: 'fixed',
      top: `${cell.rowRect.top}px`,
      left: `${cell.tableRect.left - 16}px`,
      width: '12px',
      height: `${cell.rowRect.height}px`,
      zIndex: 40,
      ['--table-handle-ref-width' as string]: `${cell.tableRect.width}px`,
      ['--table-handle-ref-height' as string]: `${cell.rowRect.height}px`,
    },
  }
}

function useTableHandleHoverState(editor: any, lockedHandle: TableOrientation | null) {
  const [hoverState, setHoverState] = useState<TableHandleHoverState | null>(null)
  const [activeHandle, setActiveHandle] = useState<TableOrientation | null>(null)
  const lastEventRef = useRef<MouseEvent | PointerEvent | null>(null)
  const hoveredCellElementRef = useRef<HTMLTableCellElement | null>(null)
  const clearTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!editor?.view?.dom) {
      return
    }

    function cancelClearTimer() {
      if (clearTimerRef.current == null) {
        return
      }

      window.clearTimeout(clearTimerRef.current)
      clearTimerRef.current = null
    }

    function updateFromEvent(event: MouseEvent | PointerEvent | null) {
      if (!event) {
        return
      }

      const cell = getHoveringTableCellInfo(editor, event)
      if (!cell) {
        return
      }

      hoveredCellElementRef.current = getDomTableCell(event.target)

      cancelClearTimer()
      setHoverState({
        cell,
        geometry: getHandleGeometry(cell),
      })
    }

    function updateFromHoveredCell() {
      if (!hoveredCellElementRef.current || !hoveredCellElementRef.current.isConnected) {
        return
      }

      const cell = getHoveringTableCellInfoFromDomCell(editor, hoveredCellElementRef.current)
      if (!cell) {
        return
      }

      cancelClearTimer()
      setHoverState({
        cell,
        geometry: getHandleGeometry(cell),
      })
    }

    function handlePointerOver(event: PointerEvent) {
      lastEventRef.current = event
      updateFromEvent(event)
    }

    function handleViewportChange() {
      updateFromHoveredCell()
      if (!hoveredCellElementRef.current) {
        updateFromEvent(lastEventRef.current)
      }
    }

    function handleDocumentPointerMove(event: PointerEvent) {
      if (lockedHandle) {
        cancelClearTimer()
        return
      }

      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const dom = editor.view.dom as HTMLElement
      const isInTableCell = dom.contains(target) && Boolean(target.closest('td, th'))
      const isInTableHandle = Boolean(target.closest('[data-table-handle-control]'))
      const isInTableMenu = Boolean(target.closest('[data-editor-floating]'))

      if (isInTableCell || isInTableHandle || isInTableMenu) {
        cancelClearTimer()
        return
      }

      if (clearTimerRef.current == null) {
        clearTimerRef.current = window.setTimeout(() => {
          setHoverState(null)
          setActiveHandle(null)
          clearTimerRef.current = null
        }, 160)
      }
    }

    const dom = editor.view.dom as HTMLElement
    dom.addEventListener('pointerover', handlePointerOver)
    document.addEventListener('pointermove', handleDocumentPointerMove)
    const scrollParents: Array<Element | Window> = [window]
    let current: HTMLElement | null = dom.parentElement
    while (current) {
      const styles = window.getComputedStyle(current)
      const isScrollable = /(auto|scroll|overlay)/.test(
        `${styles.overflow}${styles.overflowX}${styles.overflowY}`,
      )
      if (isScrollable) {
        scrollParents.push(current)
      }
      current = current.parentElement
    }

    window.addEventListener('resize', handleViewportChange)
    for (const scrollParent of scrollParents) {
      scrollParent.addEventListener('scroll', handleViewportChange, { capture: true })
    }

    return () => {
      cancelClearTimer()
      dom.removeEventListener('pointerover', handlePointerOver)
      document.removeEventListener('pointermove', handleDocumentPointerMove)
      window.removeEventListener('resize', handleViewportChange)
      for (const scrollParent of scrollParents) {
        scrollParent.removeEventListener('scroll', handleViewportChange, { capture: true })
      }
    }
  }, [editor, lockedHandle])

  return {
    activeHandle,
    hoverState,
    setActiveHandle,
    setHoverState,
  }
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
      columnWidth: null,
      columnIsHeader: false,
      columnIsFirst: false,
      rowCanClear: false,
      rowCanDuplicate: false,
      rowIndex: null,
      rowHeight: null,
      rowIsHeader: false,
      rowIsFirst: false,
      selectedTextAlign: null,
      selectedVerticalAlign: null,
      tablePos: null,
    } satisfies TableHandleSnapshot)
  }

  const table = getTable(editor)

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
    columnWidth: getAxisDomRect(editor, 'column')?.width ?? null,
    columnIsHeader: areAxisCellsAllHeader(editor, 'column'),
    columnIsFirst: isFirstAxis(editor, 'column'),
    rowCanClear: axisHasContent(editor, 'row'),
    rowCanDuplicate: canDuplicateAxis(editor, 'row'),
    rowIndex: getAxisIndex(editor, 'row'),
    rowHeight: getAxisDomRect(editor, 'row')?.height ?? null,
    rowIsHeader: areAxisCellsAllHeader(editor, 'row'),
    rowIsFirst: isFirstAxis(editor, 'row'),
    selectedTextAlign: normalizeTextAlign(getSelectedCellAttr(editor, 'textAlign')),
    selectedVerticalAlign: normalizeVerticalAlign(getSelectedCellAttr(editor, 'verticalAlign')),
    tablePos: table?.pos ?? null,
  } satisfies TableHandleSnapshot)
}

function getHoverTableHandleState(
  editor: any,
  state: TableHandleSnapshot,
  hoverState: TableHandleHoverState | null,
) {
  const cell = hoverState?.cell
  if (!cell) {
    return state
  }

  return {
    ...state,
    canAddColumnAfter: true,
    canAddColumnBefore: true,
    canAddRowAbove: true,
    canAddRowBelow: true,
    canDeleteColumn: true,
    canDeleteRow: true,
    canDeleteTable: true,
    columnCanClear: axisHasContent(editor, 'column', cell.columnIndex, cell.tablePos),
    columnCanDuplicate: canDuplicateAxis(editor, 'column', cell.columnIndex, cell.tablePos),
    columnIndex: cell.columnIndex,
    columnWidth: cell.columnRect.width,
    columnIsHeader: areAxisCellsAllHeader(editor, 'column', cell.columnIndex, cell.tablePos),
    columnIsFirst: isFirstAxis(editor, 'column', cell.columnIndex, cell.tablePos),
    rowCanClear: axisHasContent(editor, 'row', cell.rowIndex, cell.tablePos),
    rowCanDuplicate: canDuplicateAxis(editor, 'row', cell.rowIndex, cell.tablePos),
    rowIndex: cell.rowIndex,
    rowHeight: cell.rowRect.height,
    rowIsHeader: areAxisCellsAllHeader(editor, 'row', cell.rowIndex, cell.tablePos),
    rowIsFirst: isFirstAxis(editor, 'row', cell.rowIndex, cell.tablePos),
    tablePos: cell.tablePos,
  } satisfies TableHandleSnapshot
}

const TableHandleTrigger = forwardRef<HTMLButtonElement, {
  title: string
  orientation: 'horizontal' | 'vertical'
  active?: boolean
  id?: string
  onClick?: () => void
}>(({ title, orientation, active = false, id, onClick }, forwardedRef) => {
  return (
    <Tooltip content={title}>
      <button
        ref={forwardedRef}
        id={id}
        type="button"
        aria-label={title}
        data-active={active ? '' : undefined}
        onMouseDown={(event) => {
          event.preventDefault()
        }}
        onClick={onClick}
        className={
          orientation === 'horizontal'
            ? 'pk:flex pk:h-3 pk:min-w-0 pk:flex-1 pk:cursor-pointer pk:items-center pk:justify-center pk:rounded-[var(--radius-sm)] pk:border-0 pk:bg-[var(--editor-surface)] pk:p-0 pk:text-[var(--editor-muted-foreground)] pk:transition-colors hover:pk:bg-[var(--editor-primary)] hover:pk:text-white data-[active]:pk:bg-[var(--editor-primary)] data-[active]:pk:text-white'
            : 'pk:flex pk:h-full pk:w-3 pk:cursor-pointer pk:items-center pk:justify-center pk:rounded-[var(--radius-sm)] pk:border-0 pk:bg-[var(--editor-surface)] pk:p-0 pk:text-[var(--editor-muted-foreground)] pk:transition-colors hover:pk:bg-[var(--editor-primary)] hover:pk:text-white data-[active]:pk:bg-[var(--editor-primary)] data-[active]:pk:text-white'
        }
      >
        <MoreLineIcon
          className={
            orientation === 'horizontal'
              ? 'pk:h-4 pk:w-4'
              : 'pk:h-4 pk:w-4 pk:rotate-90'
          }
        />
      </button>
    </Tooltip>
  )
})

TableHandleTrigger.displayName = 'TableHandleTrigger'

type TableHandleAddButtonProps = {
  editor: any
  orientation: TableOrientation
  direction: 'before' | 'after'
  state: TableHandleSnapshot
}

function TableHandleAddButton({ editor, orientation, direction, state }: TableHandleAddButtonProps) {
  const index = orientation === 'row' ? state.rowIndex : state.columnIndex
  const disabled = index == null || state.tablePos == null
  const Icon = orientation === 'row'
    ? (direction === 'before' ? SkipUpIcon : SkipDownIcon)
    : (direction === 'before' ? SkipLeftIcon : SkipRightIcon)
  const label = orientation === 'row'
    ? (direction === 'before' ? '上方插入行' : '下方插入行')
    : (direction === 'before' ? '左侧插入列' : '右侧插入列')

  function handleClick() {
    if (disabled || index == null || state.tablePos == null) {
      return
    }

    editor.focus()
    selectAxis(editor, orientation, index, state.tablePos)
    const command = orientation === 'row'
      ? (direction === 'before' ? 'addTableRowAbove' : 'addTableRowBelow')
      : (direction === 'before' ? 'addTableColumnBefore' : 'addTableColumnAfter')
    editor.commands[command]?.()
  }

  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onMouseDown={(event) => {
          event.preventDefault()
        }}
        onClick={handleClick}
        className={
          orientation === 'row'
            ? 'pk:flex pk:h-3 pk:w-3 pk:shrink-0 pk:cursor-pointer pk:items-center pk:justify-center pk:rounded-[var(--radius-sm)] pk:border-0 pk:bg-[var(--editor-surface)] pk:p-0 pk:text-[var(--editor-muted-foreground)] pk:transition-colors hover:pk:bg-[var(--editor-primary)] hover:pk:text-white disabled:pk:pointer-events-none disabled:pk:opacity-40'
            : 'pk:flex pk:h-3 pk:w-8 pk:shrink-0 pk:cursor-pointer pk:items-center pk:justify-center pk:rounded-[var(--radius-sm)] pk:border-0 pk:bg-[var(--editor-surface)] pk:p-0 pk:text-[var(--editor-muted-foreground)] pk:transition-colors hover:pk:bg-[var(--editor-primary)] hover:pk:text-white disabled:pk:pointer-events-none disabled:pk:opacity-40'
        }
      >
        <Icon className="pk:h-3 pk:w-3 pk:shrink-0" />
      </button>
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
  onClose: () => void
}

function TableHandleMenu({ editor, orientation, state, onClose }: TableHandleMenuProps) {
  const index = orientation === 'row' ? state.rowIndex : state.columnIndex
  const isHeader = orientation === 'row' ? state.rowIsHeader : state.columnIsHeader
  const isFirst = orientation === 'row' ? state.rowIsFirst : state.columnIsFirst
  const canDuplicate = orientation === 'row' ? state.rowCanDuplicate : state.columnCanDuplicate
  const canClear = orientation === 'row' ? state.rowCanClear : state.columnCanClear
  const canDelete = orientation === 'row' ? state.canDeleteRow : state.canDeleteColumn

  function ensureSelected() {
    if (index == null || state.tablePos == null) {
      return false
    }

    return selectAxis(editor, orientation, index, state.tablePos)
  }

  function runCommand(name: TableCommandName) {
    editor.focus()

    if (!ensureSelected()) {
      return
    }

    editor.commands[name]?.()
    onClose()
  }

  function applyTextColor(color: string) {
    editor.focus()
    if (ensureSelected()) {
      applyTextColorToSelection(editor, color)
      onClose()
    }
  }

  function applyBackgroundColor(color: string) {
    editor.focus()
    if (ensureSelected()) {
      setSelectedCellAttr(editor, 'bgcolor', color === 'transparent' ? null : color)
      onClose()
    }
  }

  function applyTextAlign(value: TableCellTextAlign) {
    editor.focus()
    if (ensureSelected()) {
      setSelectedCellAttr(editor, 'textAlign', value)
      onClose()
    }
  }

  function applyVerticalAlign(value: TableCellVerticalAlign) {
    editor.focus()
    if (ensureSelected()) {
      setSelectedCellAttr(editor, 'verticalAlign', value)
      onClose()
    }
  }

  function duplicateCurrentAxis() {
    editor.focus()
    duplicateAxis(editor, orientation, index ?? undefined, state.tablePos ?? undefined)
    onClose()
  }

  function clearAxisContentSafely() {
    editor.focus()
    if (index == null) {
      return
    }

    clearAxisContent(editor, orientation, index, state.tablePos ?? undefined)
    onClose()
  }

  function toggleHeader() {
    editor.focus()
    if (ensureSelected()) {
      toggleSelectedHeader(editor, orientation)
      onClose()
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
  const [openMenu, setOpenMenu] = useState<TableOrientation | null>(null)
  const columnTriggerId = 'pk-table-column-handle-trigger'
  const rowTriggerId = 'pk-table-row-handle-trigger'
  const { activeHandle, hoverState, setActiveHandle } = useTableHandleHoverState(editor, openMenu)
  const columnMenuAnchorRef = useRef<HTMLButtonElement | null>(null)
  const rowMenuAnchorRef = useRef<HTMLButtonElement | null>(null)
  const baseState = useMemo(() => JSON.parse(snapshot) as TableHandleSnapshot, [snapshot])
  const state = useMemo(
    () => getHoverTableHandleState(editor, baseState, hoverState),
    [baseState, editor, hoverState],
  )

  function openHandleMenu(orientation: TableOrientation) {
    const index = orientation === 'row' ? state.rowIndex : state.columnIndex
    if (index == null || state.tablePos == null) {
      return
    }

    editor.focus()
    selectAxis(editor, orientation, index, state.tablePos)
    setActiveHandle(orientation)
    setOpenMenu((current) => current === orientation ? null : orientation)
  }

  useEffect(() => {
    if (!hoverState || state.tablePos == null) {
      setOpenMenu(null)
    }
  }, [hoverState, state.tablePos])

  const showRowHandle = Boolean(
    state.rowIndex != null
    && hoverState
    && (openMenu == null || openMenu === 'row'),
  )
  const showColumnHandle = Boolean(
    state.columnIndex != null
    && hoverState
    && (openMenu == null || openMenu === 'column'),
  )

  return (
    <TableHandleRoot editor={editor}>
      <TableHandleDragPreview editor={editor} />
      <TableHandleDropIndicator editor={editor} />

      {showColumnHandle && hoverState ? (
        <div
          data-table-handle-control
          className="pk:flex"
          style={hoverState.geometry.columnStyle}
          onPointerEnter={() => setActiveHandle('column')}
          onPointerLeave={() => setActiveHandle((current) => current === 'column' ? null : current)}
        >
          <div
            className="pk:flex pk:h-3 pk:flex-row pk:gap-0.5"
            style={{ width: 'var(--table-handle-ref-width, 100px)' }}
          >
            <TableHandleAddButton editor={editor} orientation="column" direction="before" state={state} />
            <div className="pk:min-w-0 pk:flex-1">
              <TableHandleColumnMenuRoot>
                <TableHandleColumnMenuTrigger
                  editor={editor}
                  className="pk:block pk:h-full pk:w-full"
                  data-active={activeHandle === 'column' || openMenu === 'column' ? '' : undefined}
                >
                  <TableHandleTrigger
                    ref={columnMenuAnchorRef}
                    title="列操作"
                    orientation="horizontal"
                    active={openMenu === 'column'}
                    id={columnTriggerId}
                    onClick={() => openHandleMenu('column')}
                  />
                </TableHandleColumnMenuTrigger>
              </TableHandleColumnMenuRoot>
              <EditorFloatingPopover
                anchor={columnMenuAnchorRef}
                open={openMenu === 'column'}
                triggerId={columnTriggerId}
                side="top"
                sideOffset={8}
                popupClassName="pk:z-[1405]"
                onOpenChange={(open) => {
                  setOpenMenu((current) => {
                    if (open) {
                      return 'column'
                    }

                    return current === 'column' ? null : current
                  })
                  setActiveHandle((current) => {
                    if (open) {
                      return 'column'
                    }

                    return current === 'column' ? null : current
                  })
                }}
                content={(
                  <TableHandleMenu
                    editor={editor}
                    orientation="column"
                    state={state}
                    onClose={() => {
                      setOpenMenu((current) => current === 'column' ? null : current)
                      setActiveHandle((current) => current === 'column' ? null : current)
                    }}
                  />
                )}
              />
            </div>
            <TableHandleAddButton editor={editor} orientation="column" direction="after" state={state} />
          </div>
        </div>
      ) : null}

      {showRowHandle && hoverState ? (
        <div
          data-table-handle-control
          className="pk:flex"
          style={hoverState.geometry.rowStyle}
          onPointerEnter={() => setActiveHandle('row')}
          onPointerLeave={() => setActiveHandle((current) => current === 'row' ? null : current)}
        >
          <div
            className="pk:flex pk:w-3 pk:flex-col pk:gap-0.5"
            style={{ height: 'var(--table-handle-ref-height, 40px)' }}
          >
            <TableHandleAddButton editor={editor} orientation="row" direction="before" state={state} />
            <div className="pk:min-h-0 pk:flex-1">
              <TableHandleRowMenuRoot>
                <TableHandleRowMenuTrigger
                  editor={editor}
                  className="pk:block pk:h-full pk:w-full"
                  data-active={activeHandle === 'row' || openMenu === 'row' ? '' : undefined}
                >
                  <TableHandleTrigger
                    ref={rowMenuAnchorRef}
                    title="行操作"
                    orientation="vertical"
                    active={openMenu === 'row'}
                    id={rowTriggerId}
                    onClick={() => openHandleMenu('row')}
                  />
                </TableHandleRowMenuTrigger>
              </TableHandleRowMenuRoot>
              <EditorFloatingPopover
                anchor={rowMenuAnchorRef}
                open={openMenu === 'row'}
                triggerId={rowTriggerId}
                side="left"
                sideOffset={8}
                popupClassName="pk:z-[1405]"
                onOpenChange={(open) => {
                  setOpenMenu((current) => {
                    if (open) {
                      return 'row'
                    }

                    return current === 'row' ? null : current
                  })
                  setActiveHandle((current) => {
                    if (open) {
                      return 'row'
                    }

                    return current === 'row' ? null : current
                  })
                }}
                content={(
                  <TableHandleMenu
                    editor={editor}
                    orientation="row"
                    state={state}
                    onClose={() => {
                      setOpenMenu((current) => current === 'row' ? null : current)
                      setActiveHandle((current) => current === 'row' ? null : current)
                    }}
                  />
                )}
              />
            </div>
            <TableHandleAddButton editor={editor} orientation="row" direction="after" state={state} />
          </div>
        </div>
      ) : null}
    </TableHandleRoot>
  )
}
