import { createEditor } from 'prosekit/core'
import { TextSelection } from 'prosekit/pm/state'
import { describe, expect, it } from 'vitest'

import { defineBasicExtension } from '../basic'

function createTextEditor() {
  return createEditor({
    extension: defineBasicExtension(),
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
}

describe('insertContent command', () => {
  it('replaces the current selection when no range is provided', () => {
    const editor = createTextEditor()

    editor.updateState(
      editor.state.apply(
        editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 2, 5)),
      ),
    )
    editor.commands.insertContent('i')

    expect(editor.state.doc.textContent).toBe('Hio')
  })

  it('inserts at pos when pos is provided', () => {
    const editor = createTextEditor()

    editor.updateState(
      editor.state.apply(
        editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 2, 5)),
      ),
    )
    editor.commands.insertContent('!', { pos: 6 })

    expect(editor.state.doc.textContent).toBe('Hello!')
  })

  it('replaces from/to when both are provided', () => {
    const editor = createTextEditor()

    editor.commands.insertContent({ content: 'Yo', from: 1, to: 3 })

    expect(editor.state.doc.textContent).toBe('Yollo')
  })

  it('accepts NodeJSON content', () => {
    const editor = createTextEditor()

    editor.updateState(
      editor.state.apply(
        editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 2, 5)),
      ),
    )
    editor.commands.insertContent({
      type: 'text',
      text: 'i',
    })

    expect(editor.state.doc.textContent).toBe('Hio')
  })

  it('accepts block NodeJSON content', () => {
    const editor = createTextEditor()

    expect(editor.commands.insertContent({
      type: 'paragraph',
      content: [{ type: 'text', text: 'World' }],
    }, { pos: 7 })).toBe(true)

    expect(editor.state.doc.textContent).toBe('HelloWorld')
  })
})
