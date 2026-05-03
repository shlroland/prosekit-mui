import { defineBasicExtension } from 'prosekit/basic'
import { union } from 'prosekit/core'
import { defineFontSizeExtension } from '../../src/prosekit/extensions/font-size'

export const minimalEditorExtension = union(
  defineBasicExtension(),
  defineFontSizeExtension(),
)
