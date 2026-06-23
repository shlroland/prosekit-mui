import {
  MenuPopup,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
} from 'prosekit/react/menu'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useMemo } from 'react'

import {
  DeleteBack2LineIcon,
  DeleteLineIcon,
  MergeCellsVerticalIcon,
  MoreLineIcon,
  SplitCellsVerticalIcon,
} from '../../icons'
import { Tooltip } from '../../ui'
import {
  applyTextColorToSelection,
  canMergeSelectedCells,
  canSplitSelectedCell,
  clearCurrentCellContent,
  getSelectedCellAttr,
  getSingleSelectedCellRect,
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
  const state = useMemo(() => JSON.parse(snapshot) as TableCellSnapshot, [snapshot])
  const cellRect = useMemo(() => {
    if (!state.open || !editor.mounted) {
      return null
    }

    return getSingleSelectedCellRect(editor)
  }, [editor, state.open, snapshot])

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

  return (
    <>
      {!state.hasMultiSelection ? (
        <div
          className="pk:pointer-events-none pk:fixed pk:z-[1302] pk:rounded-md pk:border-2 pk:border-[var(--editor-primary)] pk:shadow-[0_0_0_1px_rgba(255,255,255,0.85)]"
          style={{
            top: cellRect.top - 1,
            left: cellRect.left - 1,
            width: cellRect.width + 2,
            height: cellRect.height + 2,
          }}
        />
      ) : null}

      <MenuRoot>
        <MenuTrigger>
          <div
            className="pk:fixed pk:z-[1303]"
            style={{
              top: cellRect.top + (cellRect.height / 2) - 7,
              left: cellRect.right - 7,
            }}
          >
            <Tooltip content="单元格操作">
              <button
                type="button"
                aria-label="单元格操作"
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
                className="pk:inline-flex pk:h-[14px] pk:w-[14px] pk:items-center pk:justify-center pk:rounded-[6px] pk:bg-[var(--editor-primary)] pk:text-white pk:shadow-[0_6px_14px_rgba(37,99,235,0.28)]"
              >
                <MoreLineIcon className="pk:h-3 pk:w-3" />
              </button>
            </Tooltip>
          </div>
        </MenuTrigger>

        <MenuPositioner placement="right-start" offset={8} strategy="fixed" hoist>
          <MenuPopup className="pk:outline-none">
            <div
              className="pk:min-w-[216px] pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
              data-editor-floating
            >
              {state.canMerge ? (
                <TableMenuActionItem
                  label="合并单元格"
                  icon={<MergeCellsVerticalIcon className="pk:h-4 pk:w-4" />}
                  onSelect={() => {
                    editor.focus()
                    mergeSelectedCells(editor)
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
                }}
              />
              <TableMenuActionItem
                label="删除表格"
                icon={<DeleteLineIcon className="pk:h-4 pk:w-4" />}
                disabled={!state.canDeleteTable}
                onSelect={() => {
                  editor.focus()
                  ;(editor.commands as any).deleteTable?.()
                }}
              />
            </div>
          </MenuPopup>
        </MenuPositioner>
      </MenuRoot>
    </>
  )
}
