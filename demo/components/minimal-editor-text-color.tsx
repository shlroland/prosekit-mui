import { Box, IconButton } from '@mui/material'
import { ChevronDown, Palette } from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useState, type MouseEvent } from 'react'

import { ColorPicker, ToolbarItem } from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'
import { getTextStyleAttribute } from './minimal-editor-text-style'

type TextColorState = {
  selectedColor: string
  canApply: boolean
  canUnset: boolean
  isActive: boolean
}

type TextColorPreset = {
  key: string
  color: string
  label?: string
}

const defaultTextColor = '#171717'

export function createMinimalEditorTextColorPreset(): TextColorPreset[] {
  return [
    { key: 'default', color: '#171717', label: 'Default' },
    { key: 'gray', color: '#52525B', label: 'Gray' },
    { key: 'stone', color: '#78716C', label: 'Stone' },
    { key: 'brown', color: '#7C2D12', label: 'Brown' },
    { key: 'orange', color: '#9A3412', label: 'Orange' },
    { key: 'amber', color: '#B45309', label: 'Amber' },
    { key: 'lime', color: '#4D7C0F', label: 'Lime' },
    { key: 'green', color: '#15803D', label: 'Green' },
    { key: 'teal', color: '#0F766E', label: 'Teal' },
    { key: 'blue', color: '#0369A1', label: 'Blue' },
    { key: 'indigo', color: '#4338CA', label: 'Indigo' },
    { key: 'pink', color: '#BE123C', label: 'Pink' },
  ]
}

const textColorPreset = createMinimalEditorTextColorPreset()

function getActiveTextColor(editor: Editor<MinimalEditorExtension>): string | undefined {
  return getTextStyleAttribute(editor, 'color')
}

function canSetTextColor(editor: Editor<MinimalEditorExtension>, color: string) {
  if (editor.commands.setTextColor) {
    return editor.commands.setTextColor.canExec(color)
  }

  if (editor.commands.setTextStyle) {
    return editor.commands.setTextStyle.canExec({ color })
  }

  return editor.commands.addMark.canExec({
    type: 'textStyle',
    attrs: { color },
  })
}

function canUnsetTextColor(editor: Editor<MinimalEditorExtension>) {
  if (editor.commands.unsetTextColor) {
    return editor.commands.unsetTextColor.canExec()
  }

  if (editor.commands.unsetTextStyle) {
    return editor.commands.unsetTextStyle.canExec('color')
  }

  return editor.commands.removeMark.canExec({ type: 'textStyle' })
}

function setTextColor(editor: Editor<MinimalEditorExtension>, color: string) {
  if (editor.commands.setTextColor) {
    editor.commands.setTextColor(color)
    return
  }

  if (editor.commands.setTextStyle) {
    editor.commands.setTextStyle({ color })
    return
  }

  editor.commands.addMark({
    type: 'textStyle',
    attrs: { color },
  })
}

function unsetTextColor(editor: Editor<MinimalEditorExtension>) {
  if (editor.commands.unsetTextColor) {
    editor.commands.unsetTextColor()
    return
  }

  if (editor.commands.unsetTextStyle) {
    editor.commands.unsetTextStyle('color')
    return
  }

  editor.commands.removeMark({ type: 'textStyle' })
}

function getTextColorState(editor: Editor<MinimalEditorExtension>): TextColorState {
  const activeTextColor = getActiveTextColor(editor)
  return {
    selectedColor: activeTextColor ?? defaultTextColor,
    canApply: canSetTextColor(editor, defaultTextColor),
    canUnset: canUnsetTextColor(editor),
    isActive: Boolean(activeTextColor),
  }
}

export function MinimalEditorTextColor() {
  const editor = useEditor<MinimalEditorExtension>()
  const textColorState = useEditorDerivedValue<MinimalEditorExtension, TextColorState>(
    getTextColorState,
  )
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [draftColor, setDraftColor] = useState(textColorState.selectedColor)

  const open = Boolean(anchorEl)

  function handleTogglePopover(event: MouseEvent<HTMLButtonElement>) {
    setDraftColor(textColorState.selectedColor)
    setAnchorEl((current) => (current ? null : event.currentTarget))
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Box className="toolbar-color-trigger">
        <ToolbarItem
          tip="文字颜色"
          icon={<Palette className="toolbar-icon-svg" strokeWidth={1.9} />}
          className={
            textColorState.isActive
              ? 'tool-active toolbar-color-main-button'
              : 'toolbar-color-main-button'
          }
          disabled={!textColorState.canApply}
          onClick={() => setTextColor(editor, draftColor)}
        />
        <Box
          className="toolbar-color-indicator"
          sx={{ backgroundColor: textColorState.selectedColor }}
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
        defaultColor={defaultTextColor}
        presets={textColorPreset}
        onClose={handleClose}
        onChange={setDraftColor}
        onSubmit={(color) => setTextColor(editor, color)}
        onReset={() => unsetTextColor(editor)}
        resetLabel="默认"
      />
    </>
  )
}
