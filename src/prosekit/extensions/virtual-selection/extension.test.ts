// @vitest-environment happy-dom

import { createEditor, union } from 'prosekit/core'
import { defineDoc } from 'prosekit/extensions/doc'
import { defineParagraph } from 'prosekit/extensions/paragraph'
import { defineText } from 'prosekit/extensions/text'
import { TextSelection } from 'prosekit/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

import { defineVirtualSelectionExtension } from './extension'

const mountedEditors: Array<ReturnType<typeof createVirtualSelectionEditor>> = []

function createVirtualSelectionEditor() {
  const editor = createEditor({
    extension: union(
      defineDoc(),
      defineText(),
      defineParagraph(),
      defineVirtualSelectionExtension(),
    ),
    defaultContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello world' }],
      }],
    },
  })
  const element = document.createElement('div')
  document.body.append(element)
  editor.mount(element)
  mountedEditors.push(editor)
  return editor
}

afterEach(() => {
  for (const editor of mountedEditors.splice(0)) {
    const element = editor.view.dom
    editor.unmount()
    element.remove()
  }
})

describe('virtual selection extension', () => {
  it('renders the current selection when the editor blurs', () => {
    const editor = createVirtualSelectionEditor()
    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 1, 6)),
    )

    editor.view.dom.dispatchEvent(new FocusEvent('blur'))

    expect(editor.view.dom.querySelector('.prosekit-virtual-selection')?.textContent).toBe('Hello')
  })

  it('removes the virtual selection before pointer focus restoration', () => {
    const editor = createVirtualSelectionEditor()
    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 1, 6)),
    )
    editor.view.dom.dispatchEvent(new FocusEvent('blur'))

    editor.view.dom.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(editor.view.dom.querySelector('.prosekit-virtual-selection')).toBeNull()
    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.to).toBe(6)
  })
})
