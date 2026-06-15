import {
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material'
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
    <Tooltip title={title} arrow>
      <IconButton
        size="small"
        aria-label={title}
        sx={{
          width: 28,
          height: 28,
          borderRadius: 0.75,
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'text.primary',
          },
        }}
      >
        {icon}
      </IconButton>
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
      style={{
        display: 'inline-flex',
        outline: 'none',
      }}
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
  const iconProps = { sx: { fontSize: '0.95rem' } }

  return (
    <Tooltip title={title} arrow>
      <Paper
        elevation={5}
        sx={{
          width: orientation === 'horizontal' ? 38 : 18,
          height: orientation === 'horizontal' ? 18 : 34,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0.75,
          bgcolor: 'background.paper',
          color: 'text.secondary',
          cursor: 'grab',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.14)',
          '&:hover': {
            color: 'text.primary',
            bgcolor: 'action.hover',
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <DraggableIcon {...iconProps} />
      </Paper>
    </Tooltip>
  )
}

function TableToolbarSurface({ children }: { children: ReactNode }) {
  return (
    <Paper
      elevation={8}
      sx={{
        p: 0.375,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.25} sx={{ lineHeight: 0 }}>
        {children}
      </Stack>
    </Paper>
  )
}

export function TableFloatingToolbar() {
  const editor = useEditor<any>()
  const iconProps = { sx: { fontSize: '1rem' } }

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
            <TableHandleColumnMenuTrigger editor={editor} style={{ display: 'inline-flex' }}>
              <TableHandleTrigger title="列操作" orientation="horizontal" />
            </TableHandleColumnMenuTrigger>
            <MenuPositioner placement="top" offset={2} strategy="fixed" hoist>
              <MenuPopup style={{ outline: 'none' }}>
                <TableToolbarSurface>
                  <TableMenuAction
                    title="左侧插入列"
                    icon={<InsertColumnLeftIcon {...iconProps} />}
                    onSelect={() => runCommand('addTableColumnBefore')}
                  />
                  <TableMenuAction
                    title="右侧插入列"
                    icon={<InsertColumnRightIcon {...iconProps} />}
                    onSelect={() => runCommand('addTableColumnAfter')}
                  />
                  <TableMenuAction
                    title="删除当前列"
                    icon={<DeleteColumnIcon {...iconProps} />}
                    onSelect={() => runCommand('deleteTableColumn')}
                  />
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
                  <TableMenuAction
                    title="删除表格"
                    icon={<DeleteLineIcon {...iconProps} />}
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
            <TableHandleRowMenuTrigger editor={editor} style={{ display: 'inline-flex' }}>
              <TableHandleTrigger title="行操作" orientation="vertical" />
            </TableHandleRowMenuTrigger>
            <MenuPositioner placement="left" offset={2} strategy="fixed" hoist>
              <MenuPopup style={{ outline: 'none' }}>
                <TableToolbarSurface>
                  <TableMenuAction
                    title="上方插入行"
                    icon={<InsertRowTopIcon {...iconProps} />}
                    onSelect={() => runCommand('addTableRowAbove')}
                  />
                  <TableMenuAction
                    title="下方插入行"
                    icon={<InsertRowBottomIcon {...iconProps} />}
                    onSelect={() => runCommand('addTableRowBelow')}
                  />
                  <TableMenuAction
                    title="删除当前行"
                    icon={<DeleteRowIcon {...iconProps} />}
                    onSelect={() => runCommand('deleteTableRow')}
                  />
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
                  <TableMenuAction
                    title="删除表格"
                    icon={<DeleteLineIcon {...iconProps} />}
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
