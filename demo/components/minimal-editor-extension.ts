import { defineBasicExtension } from 'prosekit/basic'
import { union } from 'prosekit/core'
import { defineTextStyleExtension } from '../../src/prosekit/extensions'

export const minimalEditorExtension = union(
  defineBasicExtension(),
  defineTextStyleExtension(),
)

export type MinimalEditorExtension = typeof minimalEditorExtension
