import { Box } from '@mui/material'
import { ChevronDown } from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import { ToolbarMenu, type ToolbarMenuOption } from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'
import { getTextStyleAttribute } from './minimal-editor-text-style'

type FontSizeOptionKey = '12px' | '14px' | '16px' | '18px' | '20px' | '24px' | '28px'

type FontSizeOptionPreset = {
  key: FontSizeOptionKey
  label: string
}

type FontSizeState = {
  selectedKey: FontSizeOptionKey
  canOpen: boolean
  isActive: boolean
}

const defaultFontSize: FontSizeOptionKey = '16px'

export function createMinimalEditorFontSizePreset(): FontSizeOptionPreset[] {
  return [
    { key: '12px', label: '12' },
    { key: '14px', label: '14' },
    { key: '16px', label: '16' },
    { key: '18px', label: '18' },
    { key: '20px', label: '20' },
    { key: '24px', label: '24' },
    { key: '28px', label: '28' },
  ]
}

const fontSizeOptionPreset = createMinimalEditorFontSizePreset()

const fontSizeOptions: ToolbarMenuOption<FontSizeOptionKey>[] = fontSizeOptionPreset.map(
  (option) => ({
    key: option.key,
    label: option.label,
    icon: (
      <Box component="span" className="toolbar-font-size-menu-icon">
        {option.label}
      </Box>
    ),
  }),
)

function getActiveFontSize(editor: Editor<MinimalEditorExtension>): string | undefined {
  return getTextStyleAttribute(editor, 'fontSize')
}

function getFontSizeState(editor: Editor<MinimalEditorExtension>): FontSizeState {
  const activeFontSize = getActiveFontSize(editor)
  const selectedKey = fontSizeOptionPreset.some((option) => option.key === activeFontSize)
    ? (activeFontSize as FontSizeOptionKey)
    : defaultFontSize

  return {
    selectedKey,
    canOpen:
      (editor.commands.setFontSize
        ? editor.commands.setFontSize.canExec(defaultFontSize)
        : editor.commands.setTextStyle
          ? editor.commands.setTextStyle.canExec({ fontSize: defaultFontSize })
        : editor.commands.addMark.canExec({
            type: 'textStyle',
            attrs: { fontSize: defaultFontSize },
          })) ||
      (editor.commands.unsetFontSize
        ? editor.commands.unsetFontSize.canExec()
        : editor.commands.unsetTextStyle
          ? editor.commands.unsetTextStyle.canExec('fontSize')
        : editor.commands.removeMark.canExec({ type: 'textStyle' })),
    isActive: Boolean(activeFontSize),
  }
}

function applyFontSize(editor: Editor<MinimalEditorExtension>, value: FontSizeOptionKey) {
  if (editor.commands.setFontSize) {
    editor.commands.setFontSize(value)
    return
  }

  if (editor.commands.setTextStyle) {
    editor.commands.setTextStyle({ fontSize: value })
    return
  }

  editor.commands.addMark({
    type: 'textStyle',
    attrs: { fontSize: value },
  })
}

export function MinimalEditorFontSize() {
  const editor = useEditor<MinimalEditorExtension>()
  const fontSizeState = useEditorDerivedValue<MinimalEditorExtension, FontSizeState>(
    getFontSizeState,
  )

  return (
    <ToolbarMenu
      tip="字号"
      options={fontSizeOptions}
      selectedKey={fontSizeState.selectedKey}
      active={fontSizeState.isActive}
      disabled={!fontSizeState.canOpen}
      triggerContent={
        <Box className="toolbar-font-size-trigger">
          <Box component="span" className="toolbar-font-size-label">
            {fontSizeState.selectedKey.replace('px', '')}
          </Box>
          <ChevronDown className="toolbar-font-size-chevron" strokeWidth={1.85} />
        </Box>
      }
      onSelect={(selectedKey) => applyFontSize(editor, selectedKey)}
    />
  )
}
