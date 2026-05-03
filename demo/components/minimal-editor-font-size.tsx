import { Box } from '@mui/material'
import { ChevronDown } from 'lucide-react'
import type { BasicExtension } from 'prosekit/basic'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import { ToolbarMenu, type ToolbarMenuOption } from '../../src'

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

function getActiveFontSize(editor: Editor<BasicExtension>): string | undefined {
  const storedMark = editor.state.storedMarks?.find((mark) => mark.type.name === 'fontSize')

  if (storedMark?.attrs.value) {
    return String(storedMark.attrs.value)
  }

  const marks = editor.state.selection.$from.marks()
  const activeMark = marks.find((mark) => mark.type.name === 'fontSize')
  return activeMark?.attrs.value ? String(activeMark.attrs.value) : undefined
}

function getFontSizeState(editor: Editor<BasicExtension>): FontSizeState {
  const activeFontSize = getActiveFontSize(editor)
  const selectedKey = fontSizeOptionPreset.some((option) => option.key === activeFontSize)
    ? (activeFontSize as FontSizeOptionKey)
    : defaultFontSize

  return {
    selectedKey,
    canOpen:
      (editor.commands.setFontSize
        ? editor.commands.setFontSize.canExec(defaultFontSize)
        : editor.commands.addMark.canExec({
            type: 'fontSize',
            attrs: { value: defaultFontSize },
          })) ||
      (editor.commands.unsetFontSize
        ? editor.commands.unsetFontSize.canExec()
        : editor.commands.unsetMark.canExec({ type: 'fontSize' })),
    isActive: Boolean(activeFontSize),
  }
}

function applyFontSize(editor: Editor<BasicExtension>, value: FontSizeOptionKey) {
  if (editor.commands.setFontSize) {
    editor.commands.setFontSize(value)
    return
  }

  editor.commands.addMark({
    type: 'fontSize',
    attrs: { value },
  })
}

export function MinimalEditorFontSize() {
  const editor = useEditor<BasicExtension>()
  const fontSizeState = useEditorDerivedValue<BasicExtension, FontSizeState>(
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
