import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  DeleteBack2LineIcon,
  DeleteLineIcon,
  MergeCellsVerticalIcon,
  MoreLineIcon,
  SplitCellsVerticalIcon,
} from '../../icons'
import { EditorAnchoredMenu, Tooltip } from '../../ui'
import {
  applyTextColorToSelection,
  canMergeSelectedCells,
  canSplitSelectedCell,
  clearCurrentCellContent,
  getSelectedCellElement,
  getSelectedCellAttr,
  getSingleSelectedCellRect,
  getSelectedTableOverlayElement,
  isCellEmpty,
  isSelectionInTable,
  mergeSelectedCells,
  setSelectedCellAttr,
  splitSelectedCell,
  type TableCellTextAlign,
  type TableCellVerticalAlign,
} from './table-utils'
import {
  TableAlignSubmenu,
  TableColorSubmenu,
  TableMenuActionItem,
  TableMenuDivider,
} from './table-menu-content'

type TableCellSnapshot = {
  canClear: boolean
  canDeleteTable: boolean
  canMerge: boolean
  canSplit: boolean
  hasMultiSelection: boolean
  open: boolean
  selectedTextAlign: TableCellTextAlign | null
  selectedVerticalAlign: TableCellVerticalAlign | null
}

function rectEquals(a: DOMRect | null, b: DOMRect | null) {
  if (a === b) {
    return true
  }

  if (!a || !b) {
    return false
  }

  return (
    Math.abs(a.left - b.left) < 0.5
    && Math.abs(a.top - b.top) < 0.5
    && Math.abs(a.width - b.width) < 0.5
    && Math.abs(a.height - b.height) < 0.5
  )
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

function hasCurrentCellContent(editor: any) {
  const { state } = editor

  if (typeof state.selection.forEachCell === 'function') {
    let hasContent = false
    state.selection.forEachCell((cellNode: any) => {
      if (!isCellEmpty(cellNode)) {
        hasContent = true
      }
    })
    return hasContent
  }

  const { $from } = state.selection
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeaderCell') {
      return !isCellEmpty(node)
    }
  }

  return false
}

function getTableCellToolbarSnapshot(editor: any): string {
  if (!editor.mounted) {
    return JSON.stringify({
      canClear: false,
      canDeleteTable: false,
      canMerge: false,
      canSplit: false,
      hasMultiSelection: false,
      open: false,
      selectedTextAlign: null,
      selectedVerticalAlign: null,
    } satisfies TableCellSnapshot)
  }

  const selectedCellCount = editor.view.dom.querySelectorAll('td.selectedCell, th.selectedCell').length

  return JSON.stringify({
    canClear: hasCurrentCellContent(editor),
    canDeleteTable: editor.commands.deleteTable?.canExec?.() ?? false,
    canMerge: canMergeSelectedCells(editor),
    canSplit: canSplitSelectedCell(editor),
    hasMultiSelection: selectedCellCount > 1,
    open: isSelectionInTable(editor.state),
    selectedTextAlign: normalizeTextAlign(getSelectedCellAttr(editor, 'textAlign')),
    selectedVerticalAlign: normalizeVerticalAlign(getSelectedCellAttr(editor, 'verticalAlign')),
  } satisfies TableCellSnapshot)
}

export function TableCellFloatingToolbar() {
  const editor = useEditor<any>()
  const snapshot = useEditorDerivedValue<any, string>(getTableCellToolbarSnapshot)
  const selectionKey = useEditorDerivedValue<any, string>((currentEditor) => {
    if (!currentEditor.mounted) {
      return '0:0:closed'
    }

    const { selection } = currentEditor.state
    return `${selection.from}:${selection.to}:${isSelectionInTable(currentEditor.state) ? 'open' : 'closed'}`
  })
  const state = useMemo(() => JSON.parse(snapshot) as TableCellSnapshot, [snapshot])
  const [cellRect, setCellRect] = useState<DOMRect | null>(null)
  const [overlayRoot, setOverlayRoot] = useState<HTMLDivElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuAnchorRef = useRef<HTMLButtonElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const triggerId = 'pk-table-cell-menu-trigger'

  useEffect(() => {
    if (!state.open) {
      setMenuOpen(false)
    }
  }, [state.open])

  const updateCellRect = useCallback(() => {
    if (!state.open || !editor.mounted || !editor.view.editable) {
      setCellRect((current) => (current ? null : current))
      return
    }

    const nextRect = getSingleSelectedCellRect(editor)
    setCellRect((current) => (rectEquals(current, nextRect) ? current : nextRect))
  }, [editor, state.open])

  useEffect(() => {
    updateCellRect()
  }, [selectionKey, updateCellRect])

  useEffect(() => {
    if (!state.open || !editor.mounted) {
      setOverlayRoot(null)
      return
    }

    const container = getSelectedTableOverlayElement(editor)
    if (!container) {
      setOverlayRoot(null)
      return
    }

    setOverlayRoot((current) => (current === container ? current : container))
  }, [editor, selectionKey, state.open])

  useEffect(() => {
    if (!state.open || !editor.mounted) {
      return
    }

    const scheduleUpdate = () => {
      if (frameRef.current != null) {
        return
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        updateCellRect()
      })
    }

    window.addEventListener('scroll', scheduleUpdate, true)
    window.addEventListener('resize', scheduleUpdate)

    const selectedCell = getSelectedCellElement(editor)
    const selectedTable = selectedCell?.closest('table') as HTMLTableElement | null
    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          scheduleUpdate()
        })
      : null

    if (observer && selectedCell) {
      observer.observe(selectedCell)
    }

    if (observer && selectedTable) {
      observer.observe(selectedTable)
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true)
      window.removeEventListener('resize', scheduleUpdate)
      observer?.disconnect()

      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [editor, selectionKey, state.open, updateCellRect])

  function applyTextColor(color: string) {
    editor.focus()
    applyTextColorToSelection(editor, color)
  }

  function applyBackgroundColor(color: string) {
    editor.focus()
    setSelectedCellAttr(editor, 'bgcolor', color === 'transparent' ? null : color)
  }

  function applyTextAlign(value: TableCellTextAlign) {
    editor.focus()
    setSelectedCellAttr(editor, 'textAlign', value)
  }

  function applyVerticalAlign(value: TableCellVerticalAlign) {
    editor.focus()
    setSelectedCellAttr(editor, 'verticalAlign', value)
  }

  if (!cellRect) {
    return null
  }

  const overlayRootRect = overlayRoot?.getBoundingClientRect() ?? null

  if (!overlayRoot || !overlayRootRect) {
    return null
  }

  const relativeTop = cellRect.top - overlayRootRect.top - 1
  const relativeLeft = cellRect.left - overlayRootRect.left - 1
  const overlay = (
    <div
      className="pk:pointer-events-none pk:absolute"
      style={{
        top: relativeTop,
        left: relativeLeft,
        width: cellRect.width + 2,
        height: cellRect.height + 2,
      }}
    >
      <div
        className="pk:absolute pk:inset-0 pk:rounded-[2px] pk:border-2 pk:border-[var(--editor-primary)] pk:shadow-[0_0_0_1px_rgba(255,255,255,0.85)]"
      />
      <div
        className="pk:pointer-events-auto pk:absolute pk:right-[-7px] pk:top-1/2 pk:z-[1303] pk:-translate-y-1/2"
      >
        <Tooltip content="单元格操作">
          <button
            ref={menuAnchorRef}
            id={triggerId}
            type="button"
            aria-label="单元格操作"
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              setMenuOpen((current) => !current)
            }}
            className="pk:inline-flex pk:h-[14px] pk:w-[14px] pk:items-center pk:justify-center pk:rounded-[6px] pk:bg-[var(--editor-primary)] pk:text-white pk:shadow-[0_6px_14px_rgba(37,99,235,0.28)]"
          >
            <MoreLineIcon className="pk:h-3 pk:w-3" />
          </button>
        </Tooltip>
      </div>
      <EditorAnchoredMenu
        anchor={menuAnchorRef}
        open={menuOpen}
        side="right"
        align="start"
        sideOffset={8}
        popupClassName="pk:z-[1405]"
        onOpenChange={(open) => {
          setMenuOpen(open)
        }}
      >
        {state.canMerge ? (
          <TableMenuActionItem
            label="合并单元格"
            icon={<MergeCellsVerticalIcon className="pk:h-4 pk:w-4" />}
            onSelect={() => {
              editor.focus()
              mergeSelectedCells(editor)
              setMenuOpen(false)
            }}
          />
        ) : null}

        {state.canSplit ? (
          <TableMenuActionItem
            label="拆分单元格"
            icon={<SplitCellsVerticalIcon className="pk:h-4 pk:w-4" />}
            onSelect={() => {
              editor.focus()
              splitSelectedCell(editor)
              setMenuOpen(false)
            }}
          />
        ) : null}

        {state.canMerge || state.canSplit ? <TableMenuDivider /> : null}

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
          label="清空单元格内容"
          icon={<DeleteBack2LineIcon className="pk:h-4 pk:w-4" />}
          disabled={!state.canClear}
          onSelect={() => {
            editor.focus()
            clearCurrentCellContent(editor)
            setMenuOpen(false)
          }}
        />
        <TableMenuActionItem
          label="删除表格"
          icon={<DeleteLineIcon className="pk:h-4 pk:w-4" />}
          disabled={!state.canDeleteTable}
          onSelect={() => {
            editor.focus()
            ;(editor.commands as any).deleteTable?.()
            setMenuOpen(false)
          }}
        />
      </EditorAnchoredMenu>
    </div>
  )

  return createPortal(overlay, overlayRoot)
}
