import type { Editor } from 'prosekit/core'

import type { TextStyleAttrKey } from '../../src/prosekit/extensions/text-style'
import type { MinimalEditorExtension } from './minimal-editor-extension'

export function getTextStyleAttribute(
  editor: Editor<MinimalEditorExtension>,
  key: TextStyleAttrKey,
): string | undefined {
  const storedMark = editor.state.storedMarks?.find(
    (mark) => mark.type.name === 'textStyle',
  )

  if (typeof storedMark?.attrs[key] === 'string' && storedMark.attrs[key]) {
    return String(storedMark.attrs[key])
  }

  const activeMark = editor.state.selection.$from
    .marks()
    .find((mark) => mark.type.name === 'textStyle')

  if (typeof activeMark?.attrs[key] === 'string' && activeMark.attrs[key]) {
    return String(activeMark.attrs[key])
  }

  return undefined
}
