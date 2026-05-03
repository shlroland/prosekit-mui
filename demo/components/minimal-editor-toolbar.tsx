import {
  Bold,
  Ellipsis,
  Eraser,
  Italic,
  Highlighter,
  type LucideIcon,
  Link2,
  List,
  MessageSquareQuote,
  Palette,
  Plus,
  Redo2,
  SquareCode,
  Strikethrough,
  TypeOutline,
  Underline,
  Undo2,
  Heading,
  AlignLeft,
} from 'lucide-react'
import type { BasicExtension } from 'prosekit/basic'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import {
  EditorToolbar,
  EditorToolbarDivider,
  EditorToolbarGroup,
  ToolbarItem,
} from '../../src'

const toolbarIconProps = {
  className: 'toolbar-icon-svg',
  strokeWidth: 1.9,
}

type ToolbarButtonItem = {
  key: string
  tip: string
  icon: LucideIcon
  shortcutKey?: string[]
  isActive: boolean
  canExec: boolean
  command?: () => void
}

type ToolbarGroup = ToolbarButtonItem[]

function createToolbarButtonItem(
  key: string,
  options: Omit<ToolbarButtonItem, 'key'>,
): ToolbarButtonItem {
  return {
    key,
    ...options,
  }
}

function getMinimalToolbarGroups(editor: Editor<BasicExtension>): ToolbarGroup[] {
  return [
    [
      createToolbarButtonItem('insert', {
        tip: '插入',
        icon: Plus,
        isActive: false,
        canExec: true,
      }),
    ],
    [
      createToolbarButtonItem('undo', {
        tip: '撤销',
        shortcutKey: ['ctrl', 'z'],
        icon: Undo2,
        isActive: false,
        canExec: editor.commands.undo ? editor.commands.undo.canExec() : false,
        command: editor.commands.undo ? () => editor.commands.undo() : undefined,
      }),
      createToolbarButtonItem('redo', {
        tip: '重做',
        shortcutKey: ['ctrl', 'y'],
        icon: Redo2,
        isActive: false,
        canExec: editor.commands.redo ? editor.commands.redo.canExec() : false,
        command: editor.commands.redo ? () => editor.commands.redo() : undefined,
      }),
      createToolbarButtonItem('clear', {
        tip: '清除格式',
        icon: Eraser,
        isActive: false,
        canExec: true,
      }),
    ],
    [
      createToolbarButtonItem('heading', {
        tip: '标题',
        icon: Heading,
        isActive: false,
        canExec: true,
      }),
    ],
    [
      createToolbarButtonItem('font-size', {
        tip: '字号',
        icon: TypeOutline,
        isActive: false,
        canExec: true,
      }),
      createToolbarButtonItem('text-color', {
        tip: '文字颜色',
        icon: Palette,
        isActive: false,
        canExec: true,
      }),
      createToolbarButtonItem('highlight', {
        tip: '高亮',
        icon: Highlighter,
        isActive: false,
        canExec: true,
      }),
    ],
    [
      createToolbarButtonItem('bold', {
        tip: '加粗',
        shortcutKey: ['ctrl', 'b'],
        icon: Bold,
        isActive: editor.marks.bold ? editor.marks.bold.isActive() : false,
        canExec: editor.commands.toggleBold ? editor.commands.toggleBold.canExec() : false,
        command: editor.commands.toggleBold ? () => editor.commands.toggleBold() : undefined,
      }),
      createToolbarButtonItem('italic', {
        tip: '斜体',
        shortcutKey: ['ctrl', 'i'],
        icon: Italic,
        isActive: editor.marks.italic ? editor.marks.italic.isActive() : false,
        canExec: editor.commands.toggleItalic ? editor.commands.toggleItalic.canExec() : false,
        command: editor.commands.toggleItalic ? () => editor.commands.toggleItalic() : undefined,
      }),
    ],
    [
      createToolbarButtonItem('underline', {
        tip: '下划线',
        icon: Underline,
        isActive: editor.marks.underline ? editor.marks.underline.isActive() : false,
        canExec: editor.commands.toggleUnderline ? editor.commands.toggleUnderline.canExec() : false,
        command: editor.commands.toggleUnderline ? () => editor.commands.toggleUnderline() : undefined,
      }),
      createToolbarButtonItem('strike', {
        tip: '删除线',
        icon: Strikethrough,
        isActive: editor.marks.strike ? editor.marks.strike.isActive() : false,
        canExec: editor.commands.toggleStrike ? editor.commands.toggleStrike.canExec() : false,
        command: editor.commands.toggleStrike ? () => editor.commands.toggleStrike() : undefined,
      }),
      createToolbarButtonItem('tooltip', {
        tip: '提示',
        icon: MessageSquareQuote,
        isActive: false,
        canExec: true,
      }),
    ],
    [
      createToolbarButtonItem('list', {
        tip: '列表',
        icon: List,
        isActive: false,
        canExec: true,
      }),
    ],
    [
      createToolbarButtonItem('link', {
        tip: '链接',
        icon: Link2,
        isActive: false,
        canExec: true,
      }),
      createToolbarButtonItem('align', {
        tip: '对齐',
        icon: AlignLeft,
        isActive: false,
        canExec: true,
      }),
      createToolbarButtonItem('more', {
        tip: '更多',
        icon: Ellipsis,
        isActive: false,
        canExec: true,
      }),
    ],
    [
      createToolbarButtonItem('code-block', {
        tip: '代码块',
        icon: SquareCode,
        isActive: false,
        canExec: true,
      }),
    ],
  ]
}

function renderToolbarButtonItem(item: ToolbarButtonItem) {
  const Icon = item.icon

  return (
    <ToolbarItem
      key={item.key}
      tip={item.tip}
      shortcutKey={item.shortcutKey}
      icon={<Icon {...toolbarIconProps} />}
      className={item.isActive ? 'tool-active' : undefined}
      disabled={!item.canExec}
      onClick={item.command}
    />
  )
}

export function MinimalEditorToolbar() {
  useEditor<BasicExtension>()
  const toolbarGroups = useEditorDerivedValue<BasicExtension, ToolbarGroup[]>(
    getMinimalToolbarGroups,
  )

  return (
    <EditorToolbar>
      <EditorToolbarGroup>{toolbarGroups[0]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>{toolbarGroups[1]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>{toolbarGroups[2]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[3]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>{toolbarGroups[4]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[5]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>{toolbarGroups[6]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[7]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[8]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
    </EditorToolbar>
  )
}
