import { defineBasicExtension } from 'prosekit/basic'
import { union } from 'prosekit/core'
import { defineFontSizeSpec } from '../../src/prosekit/extensions/font-size'

export const minimalEditorExtension = union(defineBasicExtension(), defineFontSizeSpec())
