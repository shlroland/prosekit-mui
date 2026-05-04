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
  PenTool,
  Plus,
  Redo2,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
} from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import {
  EditorToolbar,
  EditorToolbarDivider,
  EditorToolbarGroup,
  ToolbarItem,
} from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'
import { MinimalEditorFontSize } from './minimal-editor-font-size'
import { MinimalEditorTextBackgroundColor } from './minimal-editor-text-background-color'
import { MinimalEditorHeading } from './minimal-editor-heading'
import { MinimalEditorTextAlign } from './minimal-editor-text-align'
import { MinimalEditorTextColor } from './minimal-editor-text-color'

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

function clearFormatting(editor: Editor<MinimalEditorExtension>) {
  editor.commands.removeMark({ type: 'bold' })
  editor.commands.removeMark({ type: 'italic' })
  editor.commands.removeMark({ type: 'underline' })
  editor.commands.removeMark({ type: 'strike' })
  editor.commands.removeMark({ type: 'code' }) 
  if (editor.commands.unsetHighlight) {
    editor.commands.unsetHighlight()
  } else {
    editor.commands.removeMark({ type: 'highlight' })
  }
  if (editor.commands.unsetSuperscript) {
    editor.commands.unsetSuperscript()
  } else {
    editor.commands.removeMark({ type: 'superscript' })
  }
  if (editor.commands.unsetSubscript) {
    editor.commands.unsetSubscript()
  } else {
    editor.commands.removeMark({ type: 'subscript' })
  }
  if (editor.commands.unsetTooltip) {
    editor.commands.unsetTooltip()
  } else {
    editor.commands.removeMark({ type: 'tooltip' })
  }
  if (editor.commands.unsetFontSize) {
    editor.commands.unsetFontSize()
  }
  if (editor.commands.unsetTextColor) {
    editor.commands.unsetTextColor()
  }
  if (editor.commands.unsetTextBackgroundColor) {
    editor.commands.unsetTextBackgroundColor()
  }
  if (editor.commands.unsetFontFamily) {
    editor.commands.unsetFontFamily()
  }
  if (editor.commands.unsetLineHeight) {
    editor.commands.unsetLineHeight()
  }
  if (editor.commands.unsetTextAlign) {
    editor.commands.unsetTextAlign()
  }
  if (editor.commands.unsetTextStyle) {
    editor.commands.unsetTextStyle([
      'fontSize',
      'color',
      'backgroundColor',
      'fontFamily',
      'lineHeight',
    ])
  } else {
    editor.commands.removeMark({ type: 'textStyle' })
  }
  if (editor.commands.removeEmptyTextStyle) {
    editor.commands.removeEmptyTextStyle()
  }
  editor.commands.removeLink()
  editor.commands.setParagraph()

  if (editor.nodes.list.isActive() && editor.commands.unwrapList?.canExec()) {
    editor.commands.unwrapList()
  }
}

function toggleTooltip(editor: Editor<MinimalEditorExtension>) {
  if (editor.marks.tooltip?.isActive()) {
    editor.commands.unsetTooltip?.()
    return
  }

  if (editor.commands.setTooltip) {
    editor.commands.setTooltip('')
    return
  }

  editor.commands.toggleTooltip?.('')
}

function toggleLink(editor: Editor<MinimalEditorExtension>) {
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

function getMinimalToolbarGroups(editor: Editor<MinimalEditorExtension>): ToolbarGroup[] {
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
          editor.commands.removeMark.canExec({ type: 'bold' }) ||
          editor.commands.removeMark.canExec({ type: 'italic' }) ||
          editor.commands.removeMark.canExec({ type: 'underline' }) ||
          editor.commands.removeMark.canExec({ type: 'strike' }) ||
          editor.commands.removeMark.canExec({ type: 'code' }) ||
          (editor.commands.unsetHighlight
            ? editor.commands.unsetHighlight.canExec()
            : editor.commands.removeMark.canExec({ type: 'highlight' })) ||
          (editor.commands.unsetSuperscript
            ? editor.commands.unsetSuperscript.canExec()
            : editor.commands.removeMark.canExec({ type: 'superscript' })) ||
          (editor.commands.unsetSubscript
            ? editor.commands.unsetSubscript.canExec()
            : editor.commands.removeMark.canExec({ type: 'subscript' })) ||
          (editor.commands.unsetTooltip
            ? editor.commands.unsetTooltip.canExec()
            : editor.commands.removeMark.canExec({ type: 'tooltip' })) ||
          (editor.commands.unsetTextStyle
            ? editor.commands.unsetTextStyle.canExec([
                'fontSize',
                'color',
                'backgroundColor',
                'fontFamily',
                'lineHeight',
              ])
            : false) ||
          (editor.commands.unsetTextBackgroundColor
            ? editor.commands.unsetTextBackgroundColor.canExec()
            : editor.commands.removeMark.canExec({ type: 'textStyle' })) ||
          (editor.commands.unsetTextColor
            ? editor.commands.unsetTextColor.canExec()
            : editor.commands.removeMark.canExec({ type: 'textStyle' })) ||
          (editor.commands.unsetFontFamily
            ? editor.commands.unsetFontFamily.canExec()
            : false) ||
          (editor.commands.unsetLineHeight
            ? editor.commands.unsetLineHeight.canExec()
            : false) ||
          (editor.commands.unsetFontSize
            ? editor.commands.unsetFontSize.canExec()
            : editor.commands.removeMark.canExec({ type: 'textStyle' })),
        command: () => clearFormatting(editor),
      }),
    ],
    [],
    [],
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
      createCommandToolbarButtonItem('highlight', {
        tip: '高亮',
        shortcutKey: ['ctrl', 'shift', 'h'],
        icon: PenTool,
        isActive: editor.marks.highlight ? editor.marks.highlight.isActive() : false,
        canExec: editor.commands.toggleHighlight
          ? editor.commands.toggleHighlight.canExec()
          : false,
        command: () => editor.commands.toggleHighlight(),
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
      createCommandToolbarButtonItem('superscript', {
        tip: '上标',
        shortcutKey: ['ctrl', '.'],
        icon: Superscript,
        isActive: editor.marks.superscript
          ? editor.marks.superscript.isActive()
          : false,
        canExec: editor.commands.toggleSuperscript
          ? editor.commands.toggleSuperscript.canExec()
          : false,
        command: () => editor.commands.toggleSuperscript(),
      }),
      createCommandToolbarButtonItem('subscript', {
        tip: '下标',
        shortcutKey: ['ctrl', ','],
        icon: Subscript,
        isActive: editor.marks.subscript ? editor.marks.subscript.isActive() : false,
        canExec: editor.commands.toggleSubscript
          ? editor.commands.toggleSubscript.canExec()
          : false,
        command: () => editor.commands.toggleSubscript(),
      }),
      createCommandToolbarButtonItem('tooltip', {
        tip: '提示',
        icon: MessageSquareQuote,
        isActive: editor.marks.tooltip ? editor.marks.tooltip.isActive() : false,
        canExec:
          editor.commands.setTooltip
            ? editor.commands.setTooltip.canExec('tooltip')
            : editor.commands.toggleTooltip
              ? editor.commands.toggleTooltip.canExec('tooltip')
              : false,
        command: () => toggleTooltip(editor),
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
  useEditor<MinimalEditorExtension>()
  const toolbarGroups = useEditorDerivedValue<MinimalEditorExtension, ToolbarGroup[]>(
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
      <EditorToolbarGroup>
        <MinimalEditorTextColor />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <MinimalEditorTextBackgroundColor />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>{toolbarGroups[4]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[5]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>
        <MinimalEditorTextAlign />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>{toolbarGroups[6]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[7]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[8]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
    </EditorToolbar>
  )
}
