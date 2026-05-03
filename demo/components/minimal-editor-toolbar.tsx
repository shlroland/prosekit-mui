import {
  Bold,
  Ellipsis,
  Eraser,
  Highlighter,
  type LucideIcon,
  Italic,
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
import { MinimalEditorFontSize } from './minimal-editor-font-size'
import { MinimalEditorHeading } from './minimal-editor-heading'

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

function createCommandToolbarButtonItem(
  key: string,
  options: {
    tip: string
    icon: LucideIcon
    shortcutKey?: string[]
    isActive?: boolean
    canExec: boolean
    command: () => void
  },
): ToolbarButtonItem {
  return createToolbarButtonItem(key, {
    tip: options.tip,
    icon: options.icon,
    shortcutKey: options.shortcutKey,
    isActive: options.isActive ?? false,
    canExec: options.canExec,
    command: options.command,
  })
}

function createStaticToolbarButtonItem(
  key: string,
  options: {
    tip: string
    icon: LucideIcon
    shortcutKey?: string[]
    isActive?: boolean
    canExec?: boolean
  },
): ToolbarButtonItem {
  return createToolbarButtonItem(key, {
    tip: options.tip,
    icon: options.icon,
    shortcutKey: options.shortcutKey,
    isActive: options.isActive ?? false,
    canExec: options.canExec ?? false,
  })
}

function clearFormatting(editor: Editor<BasicExtension>) {
  editor.commands.unsetMark({ type: 'bold' })
  editor.commands.unsetMark({ type: 'italic' })
  editor.commands.unsetMark({ type: 'underline' })
  editor.commands.unsetMark({ type: 'strike' })
  editor.commands.unsetMark({ type: 'code' })
  editor.commands.unsetMark({ type: 'fontSize' })
  editor.commands.removeLink()
  editor.commands.setParagraph()

  if (editor.nodes.list.isActive() && editor.commands.unwrapList?.canExec()) {
    editor.commands.unwrapList()
  }
}

function toggleLink(editor: Editor<BasicExtension>) {
  if (editor.marks.link.isActive()) {
    editor.commands.removeLink()
    return
  }

  const href = window.prompt('输入链接地址', 'https://')

  if (!href) {
    return
  }

  editor.commands.toggleLink({ href })
}

function getMinimalToolbarGroups(editor: Editor<BasicExtension>): ToolbarGroup[] {
  const isBulletList = editor.nodes.list.isActive({ kind: 'bullet' })
  const isCodeBlock = editor.nodes.codeBlock.isActive()
  const isLink = editor.marks.link.isActive()

  return [
    [
      createStaticToolbarButtonItem('insert', {
        tip: '插入',
        icon: Plus,
        canExec: false,
      }),
    ],
    [
      createCommandToolbarButtonItem('undo', {
        tip: '撤销',
        shortcutKey: ['ctrl', 'z'],
        icon: Undo2,
        canExec: editor.commands.undo ? editor.commands.undo.canExec() : false,
        command: () => editor.commands.undo(),
      }),
      createCommandToolbarButtonItem('redo', {
        tip: '重做',
        shortcutKey: ['ctrl', 'y'],
        icon: Redo2,
        canExec: editor.commands.redo ? editor.commands.redo.canExec() : false,
        command: () => editor.commands.redo(),
      }),
      createCommandToolbarButtonItem('clear', {
        tip: '清除格式',
        icon: Eraser,
        canExec:
          editor.commands.setParagraph.canExec() ||
          editor.commands.removeLink.canExec() ||
          editor.commands.unsetMark.canExec({ type: 'bold' }) ||
          editor.commands.unsetMark.canExec({ type: 'italic' }) ||
          editor.commands.unsetMark.canExec({ type: 'underline' }) ||
          editor.commands.unsetMark.canExec({ type: 'strike' }) ||
          editor.commands.unsetMark.canExec({ type: 'code' }) ||
          editor.commands.unsetMark.canExec({ type: 'fontSize' }),
        command: () => clearFormatting(editor),
      }),
    ],
    [],
    [
      createStaticToolbarButtonItem('text-color', {
        tip: '文字颜色',
        icon: Palette,
      }),
      createStaticToolbarButtonItem('highlight', {
        tip: '高亮',
        icon: Highlighter,
      }),
    ],
    [
      createCommandToolbarButtonItem('bold', {
        tip: '加粗',
        shortcutKey: ['ctrl', 'b'],
        icon: Bold,
        isActive: editor.marks.bold ? editor.marks.bold.isActive() : false,
        canExec: editor.commands.toggleBold ? editor.commands.toggleBold.canExec() : false,
        command: () => editor.commands.toggleBold(),
      }),
      createCommandToolbarButtonItem('italic', {
        tip: '斜体',
        shortcutKey: ['ctrl', 'i'],
        icon: Italic,
        isActive: editor.marks.italic ? editor.marks.italic.isActive() : false,
        canExec: editor.commands.toggleItalic ? editor.commands.toggleItalic.canExec() : false,
        command: () => editor.commands.toggleItalic(),
      }),
    ],
    [
      createCommandToolbarButtonItem('underline', {
        tip: '下划线',
        icon: Underline,
        isActive: editor.marks.underline ? editor.marks.underline.isActive() : false,
        canExec: editor.commands.toggleUnderline ? editor.commands.toggleUnderline.canExec() : false,
        command: () => editor.commands.toggleUnderline(),
      }),
      createCommandToolbarButtonItem('strike', {
        tip: '删除线',
        icon: Strikethrough,
        isActive: editor.marks.strike ? editor.marks.strike.isActive() : false,
        canExec: editor.commands.toggleStrike ? editor.commands.toggleStrike.canExec() : false,
        command: () => editor.commands.toggleStrike(),
      }),
      createStaticToolbarButtonItem('tooltip', {
        tip: '提示',
        icon: MessageSquareQuote,
      }),
    ],
    [
      createCommandToolbarButtonItem('list', {
        tip: '列表',
        icon: List,
        isActive: isBulletList,
        canExec: editor.commands.toggleList.canExec({ kind: 'bullet' }),
        command: () => editor.commands.toggleList({ kind: 'bullet' }),
      }),
    ],
    [
      createCommandToolbarButtonItem('link', {
        tip: '链接',
        icon: Link2,
        isActive: isLink,
        canExec:
          editor.commands.removeLink.canExec() ||
          editor.commands.toggleLink.canExec({ href: 'https://example.com' }),
        command: () => toggleLink(editor),
      }),
      createStaticToolbarButtonItem('align', {
        tip: '对齐',
        icon: AlignLeft,
      }),
      createStaticToolbarButtonItem('more', {
        tip: '更多',
        icon: Ellipsis,
      }),
    ],
    [
      createCommandToolbarButtonItem('code-block', {
        tip: '代码块',
        icon: SquareCode,
        isActive: isCodeBlock,
        canExec: editor.commands.toggleCodeBlock.canExec({ language: 'text' }),
        command: () => editor.commands.toggleCodeBlock({ language: 'text' }),
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
      <EditorToolbarGroup>
        <MinimalEditorHeading />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <MinimalEditorFontSize />
      </EditorToolbarGroup>
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
