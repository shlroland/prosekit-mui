import { Box } from '@mui/material'
import {
  Bold,
  ChevronDown,
  CornerDownLeft,
  Ellipsis,
  Eraser,
  Highlighter,
  type LucideIcon,
  Italic,
  Link2,
  MessageSquareQuote,
  Minus,
  PenTool,
  Plus,
  Quote,
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
import type { ReactElement } from 'react'

import {
  EditorToolbar,
  EditorToolbarDivider,
  EditorToolbarGroup,
  ToolbarMenu,
  ToolbarItem,
} from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'
import { MinimalEditorFontSize } from './minimal-editor-font-size'
import { MinimalEditorTextBackgroundColor } from './minimal-editor-text-background-color'
import { MinimalEditorHeading } from './minimal-editor-heading'
import { MinimalEditorList } from './minimal-editor-list'
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
type InsertOptionKey = 'hard-break' | 'horizontal-rule'

type InsertMenuState = {
  selectedKey: InsertOptionKey
  canOpen: boolean
}

const insertOptions = [
  {
    key: 'hard-break',
    label: '换行',
    shortcutKey: ['shift', 'enter'],
    icon: <CornerDownLeft {...toolbarIconProps} />,
  },
  {
    key: 'horizontal-rule',
    label: '分割线',
    icon: <Minus {...toolbarIconProps} />,
  },
] satisfies {
  key: InsertOptionKey
  label: string
  shortcutKey?: string[]
  icon: ReactElement
}[]

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

  if (editor.nodes.blockquote.isActive() && editor.commands.toggleBlockquote?.canExec()) {
    editor.commands.toggleBlockquote()
  }

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

function getInsertMenuState(editor: Editor<MinimalEditorExtension>): InsertMenuState {
  return {
    selectedKey: 'hard-break',
    canOpen:
      (editor.commands.insertHardBreak
        ? editor.commands.insertHardBreak.canExec()
        : false) ||
      (editor.commands.insertHorizontalRule
        ? editor.commands.insertHorizontalRule.canExec()
        : false),
  }
}

function applyInsertOption(
  editor: Editor<MinimalEditorExtension>,
  selectedKey: InsertOptionKey,
) {
  if (selectedKey === 'hard-break') {
    editor.commands.insertHardBreak()
    return
  }

  editor.commands.insertHorizontalRule()
}

function getMinimalToolbarGroups(editor: Editor<MinimalEditorExtension>): ToolbarGroup[] {
  const isBlockquote = editor.nodes.blockquote.isActive()
  const isCodeBlock = editor.nodes.codeBlock.isActive()
  const isLink = editor.marks.link.isActive()

  return [
    [
      createStaticToolbarButtonItem('insert-placeholder', {
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
            : editor.commands.removeMark.canExec({ type: 'textStyle' })) ||
          (isBlockquote && (editor.commands.toggleBlockquote?.canExec() ?? false)),
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
      createCommandToolbarButtonItem('blockquote', {
        tip: '引用',
        icon: Quote,
        isActive: isBlockquote,
        canExec: editor.commands.toggleBlockquote
          ? editor.commands.toggleBlockquote.canExec()
          : false,
        command: () => editor.commands.toggleBlockquote(),
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
  const editor = useEditor<MinimalEditorExtension>()
  const insertMenuState = useEditorDerivedValue<MinimalEditorExtension, InsertMenuState>(
    getInsertMenuState,
  )

  return (
    <EditorToolbar>
      <EditorToolbarGroup>
        <ToolbarMenu
          tip="插入"
          options={insertOptions}
          selectedKey={insertMenuState.selectedKey}
          disabled={!insertMenuState.canOpen}
          triggerContent={
            <Box className="inline-flex shrink-0 items-center gap-1.5">
              <Box
                component="span"
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
              >
                <Plus className="toolbar-icon-svg" strokeWidth={1.9} />
              </Box>
              <Box
                component="span"
                className="shrink-0 text-[12px] font-medium leading-none"
              >
                插入
              </Box>
              <ChevronDown
                className="pointer-events-none h-3 w-3 shrink-0 text-[var(--mui-palette-text-disabled)]"
                strokeWidth={1.85}
              />
            </Box>
          }
          onSelect={(selectedKey) => applyInsertOption(editor, selectedKey)}
        />
      </EditorToolbarGroup>
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
      <EditorToolbarGroup>
        <MinimalEditorList />
      </EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[6]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[7]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
      <EditorToolbarGroup>{toolbarGroups[8]?.map(renderToolbarButtonItem)}</EditorToolbarGroup>
    </EditorToolbar>
  )
}
