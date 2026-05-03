import {
  Bold,
  Ellipsis,
  Eraser,
  Italic,
  Highlighter,
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
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useCallback } from 'react'

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

export function MinimalEditorToolbar() {
  const editor = useEditor<any>() as any

  const deriveToolbarState = useCallback((currentEditor: any) => {
    const typedEditor = currentEditor as any

    return {
      canUndo: typedEditor.commands.undo.canExec(),
      canRedo: typedEditor.commands.redo.canExec(),
      isBold: typedEditor.marks.bold.isActive(),
      isItalic: typedEditor.marks.italic?.isActive?.() ?? false,
      isUnderline: typedEditor.marks.underline?.isActive?.() ?? false,
      isStrike: typedEditor.marks.strike?.isActive?.() ?? false,
    }
  }, [])

  const { canUndo, canRedo, isBold, isItalic, isUnderline, isStrike } = useEditorDerivedValue<any, {
    canUndo: boolean
    canRedo: boolean
    isBold: boolean
    isItalic: boolean
    isUnderline: boolean
    isStrike: boolean
  }>(deriveToolbarState)

  return (
    <EditorToolbar>
      <EditorToolbarGroup>
        <ToolbarItem
          tip="插入"
          icon={<Plus {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <ToolbarItem
          tip="撤销"
          shortcutKey={['ctrl', 'z']}
          icon={<Undo2 {...toolbarIconProps} />}
          disabled={!canUndo}
          onClick={() => editor.commands.undo()}
        />
        <ToolbarItem
          tip="重做"
          shortcutKey={['ctrl', 'y']}
          icon={<Redo2 {...toolbarIconProps} />}
          disabled={!canRedo}
          onClick={() => editor.commands.redo()}
        />
        <ToolbarItem
          tip="清除格式"
          icon={<Eraser {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <ToolbarItem
          tip="标题"
          icon={<Heading {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <ToolbarItem
          tip="字号"
          icon={<TypeOutline {...toolbarIconProps} />}
        />
        <ToolbarItem
          tip="文字颜色"
          icon={<Palette {...toolbarIconProps} />}
        />
        <ToolbarItem
          tip="高亮"
          icon={<Highlighter {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <ToolbarItem
          tip="加粗"
          shortcutKey={['ctrl', 'b']}
          icon={<Bold {...toolbarIconProps} />}
          className={isBold ? 'tool-active' : ''}
          onClick={() => editor.commands.toggleBold()}
        />
        <ToolbarItem
          tip="斜体"
          shortcutKey={['ctrl', 'i']}
          icon={<Italic {...toolbarIconProps} />}
          className={isItalic ? 'tool-active' : ''}
          onClick={() => editor.commands.toggleItalic?.()}
        />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <ToolbarItem
          tip="下划线"
          icon={<Underline {...toolbarIconProps} />}
          className={isUnderline ? 'tool-active' : ''}
          onClick={() => editor.commands.toggleUnderline?.()}
        />
        <ToolbarItem
          tip="删除线"
          icon={<Strikethrough {...toolbarIconProps} />}
          className={isStrike ? 'tool-active' : ''}
          onClick={() => editor.commands.toggleStrike?.()}
        />
        <ToolbarItem
          tip="提示"
          icon={<MessageSquareQuote {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <ToolbarItem
          tip="列表"
          icon={<List {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <ToolbarItem
          tip="链接"
          icon={<Link2 {...toolbarIconProps} />}
        />
        <ToolbarItem
          tip="对齐"
          icon={<AlignLeft {...toolbarIconProps} />}
        />
        <ToolbarItem
          tip="更多"
          icon={<Ellipsis {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <ToolbarItem
          tip="代码块"
          icon={<SquareCode {...toolbarIconProps} />}
        />
      </EditorToolbarGroup>
    </EditorToolbar>
  )
}
