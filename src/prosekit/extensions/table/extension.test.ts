import { createEditor, union } from 'prosekit/core'
import { defineTextAlign } from 'prosekit/extensions/text-align'
import { describe, expect, it } from 'vitest'

import { defineBasicExtension } from '../basic'

function createTableEditor() {
  return createEditor({
    extension: union(
      defineBasicExtension(),
      defineTextAlign({
        types: ['paragraph', 'heading'],
        default: 'left',
      }),
    ),
    defaultContent: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Before' }],
        },
      ],
    },
  })
}

describe('table extension', () => {
  it('does not inherit paragraph text align into inserted table cells', () => {
    const editor = createTableEditor()

    expect(editor.commands.insertTable({ row: 2, col: 2 })).toBe(true)

    const table = editor.state.doc.firstChild
    const firstCellParagraph = table?.firstChild?.firstChild?.firstChild

    expect(table?.type.name).toBe('table')
    expect(firstCellParagraph?.type.name).toBe('paragraph')
    expect(firstCellParagraph?.attrs.textAlign).toBeNull()
  })
})
