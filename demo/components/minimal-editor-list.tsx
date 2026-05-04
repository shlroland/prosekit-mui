import { Box } from '@mui/material'
import {
  ChevronDown,
  List,
  ListIndentDecrease,
  ListIndentIncrease,
  ListOrdered,
  ListTodo,
} from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import type { ReactElement } from 'react'

import { ToolbarItem, ToolbarMenu, type ToolbarMenuOption } from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'

type ListKind = 'bullet' | 'ordered' | 'task'

type ListState = {
  selectedKey: ListKind
  isActive: boolean
  canToggleBullet: boolean
  canToggleOrdered: boolean
  canToggleTask: boolean
  canIndent: boolean
  canDedent: boolean
}

const toolbarIconProps = {
  className: 'toolbar-icon-svg',
  strokeWidth: 1.9,
}

const listIcons = {
  bullet: <List {...toolbarIconProps} />,
  ordered: <ListOrdered {...toolbarIconProps} />,
  task: <ListTodo {...toolbarIconProps} />,
} satisfies Record<ListKind, ReactElement>

const listOptions: ToolbarMenuOption<ListKind>[] = [
  {
    key: 'bullet',
    label: '无序列表',
    icon: listIcons.bullet,
  },
  {
    key: 'ordered',
    label: '有序列表',
    icon: listIcons.ordered,
  },
  {
    key: 'task',
    label: '任务列表',
    icon: listIcons.task,
  },
]

function getListState(editor: Editor<MinimalEditorExtension>): ListState {
  const isBulletList = editor.nodes.list.isActive({ kind: 'bullet' })
  const isOrderedList = editor.nodes.list.isActive({ kind: 'ordered' })
  const isTaskList = editor.nodes.list.isActive({ kind: 'task' })
  const isActive = isBulletList || isOrderedList || isTaskList

  return {
    selectedKey: isTaskList ? 'task' : isOrderedList ? 'ordered' : 'bullet',
    isActive,
    canToggleBullet: editor.commands.toggleList.canExec({ kind: 'bullet' }),
    canToggleOrdered: editor.commands.toggleList.canExec({ kind: 'ordered' }),
    canToggleTask: editor.commands.toggleList.canExec({ kind: 'task', checked: false }),
    canIndent: editor.commands.indentList ? editor.commands.indentList.canExec() : false,
    canDedent: editor.commands.dedentList ? editor.commands.dedentList.canExec() : false,
  }
}

function applyListKind(editor: Editor<MinimalEditorExtension>, selectedKey: ListKind) {
  if (selectedKey === 'task') {
    editor.commands.toggleList({ kind: 'task', checked: false })
    return
  }

  editor.commands.toggleList({ kind: selectedKey })
}

export function MinimalEditorList() {
  const editor = useEditor<MinimalEditorExtension>()
  const listState = useEditorDerivedValue<MinimalEditorExtension, ListState>(getListState)

  return (
    <>
      <ToolbarMenu
        tip="列表"
        options={listOptions}
        selectedKey={listState.selectedKey}
        active={listState.isActive}
        disabled={
          !listState.canToggleBullet &&
          !listState.canToggleOrdered &&
          !listState.canToggleTask
        }
        triggerContent={
          <Box className="inline-flex shrink-0 items-center gap-1.5">
            <Box
              component="span"
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
            >
              {listIcons[listState.selectedKey]}
            </Box>
            <ChevronDown
              className="pointer-events-none h-3 w-3 shrink-0 text-[var(--mui-palette-text-disabled)]"
              strokeWidth={1.85}
            />
          </Box>
        }
        onSelect={(selectedKey) => applyListKind(editor, selectedKey)}
      />
      <ToolbarItem
        tip="增加缩进"
        icon={<ListIndentIncrease {...toolbarIconProps} />}
        disabled={!listState.canIndent}
        onClick={() => editor.commands.indentList?.()}
      />
      <ToolbarItem
        tip="减少缩进"
        icon={<ListIndentDecrease {...toolbarIconProps} />}
        disabled={!listState.canDedent}
        onClick={() => editor.commands.dedentList?.()}
      />
    </>
  )
}
