import { defineBasicExtension } from 'prosekit/basic'
import { union } from 'prosekit/core'
import {
  defineHighlightExtension,
  defineTextStyleExtension,
} from '../../src/prosekit/extensions'

export const minimalEditorExtension = union(
  defineBasicExtension(),
  defineTextStyleExtension(),
  defineHighlightExtension(),
)

export type MinimalEditorExtension = typeof minimalEditorExtension
