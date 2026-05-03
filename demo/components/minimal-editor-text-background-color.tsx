import { Box, IconButton } from '@mui/material'
import { ChevronDown, Highlighter } from 'lucide-react'
import type { BasicExtension } from 'prosekit/basic'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useState, type MouseEvent } from 'react'

import { ColorPicker, ToolbarItem } from '../../src'

type TextBackgroundColorState = {
  selectedColor: string
  canApply: boolean
  canUnset: boolean
  isActive: boolean
}

type TextBackgroundColorPreset = {
  key: string
  color: string
  label?: string
}

const defaultTextBackgroundColor = '#ffffff'

export function createMinimalEditorTextBackgroundColorPreset(): TextBackgroundColorPreset[] {
  return [
    { key: 'default', color: '#ffffff', label: 'Default' },
    { key: 'yellow', color: '#FEF3C7', label: 'Yellow' },
    { key: 'amber', color: '#FDE68A', label: 'Amber' },
    { key: 'orange', color: '#FED7AA', label: 'Orange' },
    { key: 'red', color: '#FECACA', label: 'Red' },
    { key: 'pink', color: '#FBCFE8', label: 'Pink' },
    { key: 'purple', color: '#E9D5FF', label: 'Purple' },
    { key: 'blue', color: '#DBEAFE', label: 'Blue' },
    { key: 'cyan', color: '#CFFAFE', label: 'Cyan' },
    { key: 'teal', color: '#CCFBF1', label: 'Teal' },
    { key: 'green', color: '#DCFCE7', label: 'Green' },
    { key: 'lime', color: '#ECFCCB', label: 'Lime' },
  ]
}

const textBackgroundColorPreset = createMinimalEditorTextBackgroundColorPreset()

function getActiveTextBackgroundColor(editor: Editor<BasicExtension>): string | undefined {
  const storedMark = editor.state.storedMarks?.find(
    (mark) => mark.type.name === 'textBackgroundColor',
  )

  if (storedMark?.attrs.value) {
    return String(storedMark.attrs.value)
  }

  const marks = editor.state.selection.$from.marks()
  const activeMark = marks.find((mark) => mark.type.name === 'textBackgroundColor')
  return activeMark?.attrs.value ? String(activeMark.attrs.value) : undefined
}

function canSetTextBackgroundColor(editor: Editor<BasicExtension>, color: string) {
  if (editor.commands.setTextBackgroundColor) {
    return editor.commands.setTextBackgroundColor.canExec(color)
  }

  return editor.commands.addMark.canExec({
    type: 'textBackgroundColor',
    attrs: { value: color },
  })
}

function canUnsetTextBackgroundColor(editor: Editor<BasicExtension>) {
  if (editor.commands.unsetTextBackgroundColor) {
    return editor.commands.unsetTextBackgroundColor.canExec()
  }

  return editor.commands.unsetMark.canExec({ type: 'textBackgroundColor' })
}

function setTextBackgroundColor(editor: Editor<BasicExtension>, color: string) {
  if (editor.commands.setTextBackgroundColor) {
    editor.commands.setTextBackgroundColor(color)
    return
  }

  editor.commands.addMark({
    type: 'textBackgroundColor',
    attrs: { value: color },
  })
}

function unsetTextBackgroundColor(editor: Editor<BasicExtension>) {
  if (editor.commands.unsetTextBackgroundColor) {
    editor.commands.unsetTextBackgroundColor()
    return
  }

  editor.commands.unsetMark({ type: 'textBackgroundColor' })
}

function getTextBackgroundColorState(
  editor: Editor<BasicExtension>,
): TextBackgroundColorState {
  const activeTextBackgroundColor = getActiveTextBackgroundColor(editor)

  return {
    selectedColor: activeTextBackgroundColor ?? defaultTextBackgroundColor,
    canApply: canSetTextBackgroundColor(editor, defaultTextBackgroundColor),
    canUnset: canUnsetTextBackgroundColor(editor),
    isActive: Boolean(activeTextBackgroundColor),
  }
}

export function MinimalEditorTextBackgroundColor() {
  const editor = useEditor<BasicExtension>()
  const textBackgroundColorState = useEditorDerivedValue<
    BasicExtension,
    TextBackgroundColorState
  >(getTextBackgroundColorState)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [draftColor, setDraftColor] = useState(textBackgroundColorState.selectedColor)

  const open = Boolean(anchorEl)

  function handleTogglePopover(event: MouseEvent<HTMLButtonElement>) {
    setDraftColor(textBackgroundColorState.selectedColor)
    setAnchorEl((current) => (current ? null : event.currentTarget))
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Box className="toolbar-color-trigger">
        <ToolbarItem
          tip="文字背景颜色"
          icon={<Highlighter className="toolbar-icon-svg" strokeWidth={1.9} />}
          className={
            textBackgroundColorState.isActive
              ? 'tool-active toolbar-color-main-button'
              : 'toolbar-color-main-button'
          }
          disabled={!textBackgroundColorState.canApply}
          onClick={() => setTextBackgroundColor(editor, draftColor)}
        />
        <Box
          className="toolbar-color-indicator"
          sx={{ backgroundColor: textBackgroundColorState.selectedColor }}
        />
        <IconButton
          className={
            open
              ? 'toolbar-color-arrow-button toolbar-color-arrow-button-open'
              : 'toolbar-color-arrow-button'
          }
          onClick={handleTogglePopover}
        >
          <ChevronDown className="toolbar-color-arrow" strokeWidth={1.85} />
        </IconButton>
      </Box>

      <ColorPicker
        anchorEl={anchorEl}
        open={open}
        value={draftColor}
        defaultColor={defaultTextBackgroundColor}
        presets={textBackgroundColorPreset}
        onClose={handleClose}
        onChange={setDraftColor}
        onSubmit={(color) => setTextBackgroundColor(editor, color)}
        onReset={() => unsetTextBackgroundColor(editor)}
        resetLabel="默认"
      />
    </>
  )
}
