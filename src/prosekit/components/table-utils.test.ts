import { createEditor, union } from 'prosekit/core'
import { defineTextColor } from 'prosekit/extensions/text-color'
import { TextSelection } from 'prosekit/pm/state'
import { describe, expect, it } from 'vitest'

import { defineBasicExtension } from '../extensions/basic'
import { applyTextColorToSelection } from './table-utils'

function createTableEditor() {
  return createEditor({
    extension: union(
      defineBasicExtension(),
      defineTextColor(),
    ),
    defaultContent: {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Cell text' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  })
}

function findTextPosition(editor: ReturnType<typeof createTableEditor>) {
  let textPosition = 0

  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === 'Cell text') {
      textPosition = pos
      return false
    }

    return true
  })

  return textPosition
}

describe('applyTextColorToSelection', () => {
  it('applies text color to the current cell when the selection is collapsed inside a cell', () => {
    const editor = createTableEditor()
    const textPosition = findTextPosition(editor)

    editor.updateState(
      editor.state.apply(
        editor.state.tr.setSelection(TextSelection.create(editor.state.doc, textPosition + 1)),
      ),
    )

    expect(applyTextColorToSelection(editor, '#ef4444')).toBe(true)

    const textNode = editor.state.doc.nodeAt(textPosition)
    expect(textNode?.marks).toHaveLength(1)
    expect(textNode?.marks[0]?.type.name).toBe('textColor')
    expect(textNode?.marks[0]?.attrs.color).toBe('#ef4444')
  })
})
