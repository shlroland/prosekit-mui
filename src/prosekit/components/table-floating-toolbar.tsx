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
  MenuItem,
  MenuPopup,
  MenuPositioner,
} from 'prosekit/react/menu'
import { useEditor } from 'prosekit/react'
import { type ReactNode } from 'react'

import './toolbar.css'

import {
  DeleteColumnIcon,
  DeleteLineIcon,
  DeleteRowIcon,
  DraggableIcon,
  InsertColumnLeftIcon,
  InsertColumnRightIcon,
  InsertRowBottomIcon,
  InsertRowTopIcon,
} from '../../icons'
import { Button, Separator, Tooltip } from '../../ui'

type TableCommandName =
  | 'addTableColumnBefore'
  | 'addTableColumnAfter'
  | 'addTableRowAbove'
  | 'addTableRowBelow'
  | 'deleteTableColumn'
  | 'deleteTableRow'
  | 'deleteTable'

function TableToolbarButton({
  title,
  icon,
}: {
  title: string
  icon: ReactNode
}) {
  return (
    <Tooltip content={title}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={title}
        className="table-floating-toolbar-button"
      >
        {icon}
      </Button>
    </Tooltip>
  )
}

function TableMenuAction({
  title,
  icon,
  onSelect,
}: {
  title: string
  icon: ReactNode
  onSelect: () => void
}) {
  return (
    <MenuItem
      value={title}
      onSelect={() => {
        onSelect()
      }}
      className="table-floating-toolbar-menu-item"
    >
      <TableToolbarButton title={title} icon={icon} />
    </MenuItem>
  )
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
        className={`table-handle-trigger table-handle-trigger-${orientation}`}
      >
        <DraggableIcon className="table-handle-trigger-icon" />
      </div>
    </Tooltip>
  )
}

function TableToolbarSurface({ children }: { children: ReactNode }) {
  return (
    <div className="table-floating-toolbar-surface" data-editor-floating>
      <div className="table-floating-toolbar-row">
        {children}
      </div>
    </div>
  )
}

export function TableFloatingToolbar() {
  const editor = useEditor<any>()

  function runCommand(name: TableCommandName) {
    const command = editor.commands[name]

    editor.focus()
    command?.()
  }

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
            <TableHandleColumnMenuTrigger editor={editor} className="table-handle-menu-trigger">
              <TableHandleTrigger title="列操作" orientation="horizontal" />
            </TableHandleColumnMenuTrigger>
            <MenuPositioner placement="top" offset={2} strategy="fixed" hoist>
              <MenuPopup className="table-floating-toolbar-popup">
                <TableToolbarSurface>
                  <TableMenuAction
                    title="左侧插入列"
                    icon={<InsertColumnLeftIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('addTableColumnBefore')}
                  />
                  <TableMenuAction
                    title="右侧插入列"
                    icon={<InsertColumnRightIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('addTableColumnAfter')}
                  />
                  <TableMenuAction
                    title="删除当前列"
                    icon={<DeleteColumnIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('deleteTableColumn')}
                  />
                  <Separator orientation="vertical" className="table-floating-toolbar-divider" />
                  <TableMenuAction
                    title="删除表格"
                    icon={<DeleteLineIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('deleteTable')}
                  />
                </TableToolbarSurface>
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
            <TableHandleRowMenuTrigger editor={editor} className="table-handle-menu-trigger">
              <TableHandleTrigger title="行操作" orientation="vertical" />
            </TableHandleRowMenuTrigger>
            <MenuPositioner placement="left" offset={2} strategy="fixed" hoist>
              <MenuPopup className="table-floating-toolbar-popup">
                <TableToolbarSurface>
                  <TableMenuAction
                    title="上方插入行"
                    icon={<InsertRowTopIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('addTableRowAbove')}
                  />
                  <TableMenuAction
                    title="下方插入行"
                    icon={<InsertRowBottomIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('addTableRowBelow')}
                  />
                  <TableMenuAction
                    title="删除当前行"
                    icon={<DeleteRowIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('deleteTableRow')}
                  />
                  <Separator orientation="vertical" className="table-floating-toolbar-divider" />
                  <TableMenuAction
                    title="删除表格"
                    icon={<DeleteLineIcon className="table-floating-toolbar-icon" />}
                    onSelect={() => runCommand('deleteTable')}
                  />
                </TableToolbarSurface>
              </MenuPopup>
            </MenuPositioner>
          </TableHandleRowMenuRoot>
        </TableHandleRowPopup>
      </TableHandleRowPositioner>
    </TableHandleRoot>
  )
}
