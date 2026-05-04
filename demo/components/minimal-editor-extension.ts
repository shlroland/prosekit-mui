import { defineBasicExtension } from 'prosekit/basic'
import { union } from 'prosekit/core'
import {
  defineHighlightExtension,
  defineSubscriptExtension,
  defineSuperscriptExtension,
  defineTextStyleExtension,
} from '../../src/prosekit/extensions'

export const minimalEditorExtension = union(
  defineBasicExtension(),
  defineTextStyleExtension(),
  defineHighlightExtension(),
  defineSuperscriptExtension(),
  defineSubscriptExtension(),
)

export type MinimalEditorExtension = typeof minimalEditorExtension
