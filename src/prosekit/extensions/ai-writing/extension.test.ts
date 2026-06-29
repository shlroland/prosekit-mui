import { createEditor, union } from 'prosekit/core'
import { defineBasicExtension } from 'prosekit/basic'
import { TextSelection } from 'prosekit/pm/state'
import { describe, expect, it } from 'vitest'

import { aiWritingPluginKey, defineAiWritingExtension, getAiWritingState } from './extension'

describe('ai writing extension', () => {
  it('accepts the current suggestion with a command', () => {
    const editor = createEditor({
      extension: union(defineBasicExtension(), defineAiWritingExtension()),
      defaultContent: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello' }],
          },
        ],
      },
    })

    editor.commands.setAiWriting(true)
    editor.updateState(
      editor.state.apply(
        editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 6)),
      ),
    )
    editor.updateState(editor.state.apply(editor.state.tr.setMeta(aiWritingPluginKey, {
      type: 'setSuggestion',
      text: ' world',
      pos: 6,
      lastDocText: 'Hello',
      lastTriggerPos: 6,
      requestId: 1,
    })))

    expect(getAiWritingState(editor.state)).toMatchObject({
      enabled: true,
      hasSuggestion: true,
      suggestion: ' world',
    })

    editor.commands.acceptAiWriting()

    expect(editor.state.doc.textContent).toBe('Hello world')
    expect(getAiWritingState(editor.state)).toMatchObject({
      enabled: true,
      hasSuggestion: false,
    })
  })
})
