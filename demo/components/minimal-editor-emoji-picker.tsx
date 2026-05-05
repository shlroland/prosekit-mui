import emojiMartData from '@emoji-mart/data'
import { Popover } from '@mui/material'
import Picker from '@emoji-mart/react'
import { Smile } from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useState, type MouseEvent } from 'react'

import { ToolbarItem } from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'

type EmojiMartSelection = {
  native?: string
}

function insertEmoji(editor: Editor<MinimalEditorExtension>, emoji: string) {
  const { state, view } = editor
  const tr = state.tr.replaceSelectionWith(state.schema.text(emoji), false)
  view.dispatch(tr.scrollIntoView())
  editor.focus()
}

function getEmojiPickerEnabled(editor: Editor<MinimalEditorExtension>) {
  return !editor.marks.code.isActive() && !editor.nodes.codeBlock.isActive()
}

export function MinimalEditorEmojiPicker() {
  const editor = useEditor<MinimalEditorExtension>()
  const enabled = useEditorDerivedValue(getEmojiPickerEnabled)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleOpen(event: MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleEmojiSelect(selection: EmojiMartSelection) {
    if (!selection.native) {
      return
    }

    insertEmoji(editor, selection.native)
    handleClose()
  }

  return (
    <>
      <ToolbarItem
        tip="Emoji"
        icon={<Smile className="toolbar-icon-svg" strokeWidth={1.9} />}
        disabled={!enabled}
        onClick={handleOpen}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            className: 'emoji-picker-popover-paper',
          },
        }}
      >
        <div className="emoji-picker-host">
          <Picker
            data={emojiMartData}
            onEmojiSelect={handleEmojiSelect}
            autoFocus
            locale="zh"
            set="native"
            theme="light"
            navPosition="top"
            searchPosition="sticky"
            skinTonePosition="search"
            previewPosition="none"
            perLine={8}
            emojiSize={20}
            emojiButtonSize={34}
            maxFrequentRows={2}
          />
        </div>
      </Popover>
    </>
  )
}
