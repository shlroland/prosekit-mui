import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import { ToolbarMenu, type ToolbarMenuOption } from '../../src'
import type { TextAlignValue } from '../../src/prosekit/extensions'
import type { MinimalEditorExtension } from './minimal-editor-extension'

type TextAlignState = {
  value: TextAlignValue
  canExec: boolean
  isActive: boolean
}

const textAlignOptions: ToolbarMenuOption<TextAlignValue>[] = [
  {
    key: 'left',
    label: '左对齐',
    icon: <AlignLeft className="toolbar-icon-svg" strokeWidth={1.9} />,
    shortcutKey: ['ctrl', 'shift', 'l'],
  },
  {
    key: 'center',
    label: '居中对齐',
    icon: <AlignCenter className="toolbar-icon-svg" strokeWidth={1.9} />,
    shortcutKey: ['ctrl', 'shift', 'e'],
  },
  {
    key: 'right',
    label: '右对齐',
    icon: <AlignRight className="toolbar-icon-svg" strokeWidth={1.9} />,
    shortcutKey: ['ctrl', 'shift', 'r'],
  },
  {
    key: 'justify',
    label: '两端对齐',
    icon: <AlignJustify className="toolbar-icon-svg" strokeWidth={1.9} />,
    shortcutKey: ['ctrl', 'shift', 'j'],
  },
]

function getActiveTextAlign(editor: Editor<MinimalEditorExtension>): TextAlignValue {
  const { parent } = editor.state.selection.$anchor
  const value = parent.attrs.textAlign

  if (
    parent.type.name !== 'paragraph' &&
    parent.type.name !== 'heading'
  ) {
    return 'left'
  }

  return value === 'center' || value === 'right' || value === 'justify' ? value : 'left'
}

function getTextAlignState(editor: Editor<MinimalEditorExtension>): TextAlignState {
  const value = getActiveTextAlign(editor)

  return {
    value,
    canExec: editor.commands.setTextAlign
      ? editor.commands.setTextAlign.canExec(value)
      : false,
    isActive: value !== 'left',
  }
}

export function MinimalEditorTextAlign() {
  const editor = useEditor<MinimalEditorExtension>()
  const textAlignState = useEditorDerivedValue<MinimalEditorExtension, TextAlignState>(
    getTextAlignState,
  )

  return (
    <ToolbarMenu
      tip="对齐"
      options={textAlignOptions}
      selectedKey={textAlignState.value}
      active={textAlignState.isActive}
      disabled={!textAlignState.canExec}
      onSelect={(value) => editor.commands.toggleTextAlign(value)}
    />
  )
}
