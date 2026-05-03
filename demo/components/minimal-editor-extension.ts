import { defineBasicExtension } from 'prosekit/basic'
import { union } from 'prosekit/core'
import { defineFontSizeExtension } from '../../src/prosekit/extensions/font-size'
import { defineTextBackgroundColorExtension } from '../../src/prosekit/extensions/text-background-color'
import { defineTextColorExtension } from '../../src/prosekit/extensions/text-color'

export const minimalEditorExtension = union(
  defineBasicExtension(),
  defineFontSizeExtension(),
  defineTextBackgroundColorExtension(),
  defineTextColorExtension(),
)
