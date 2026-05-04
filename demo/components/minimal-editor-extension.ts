import { defineBasicExtension } from 'prosekit/basic'
import { union } from 'prosekit/core'
import {
  defineHighlightExtension,
  defineSubscriptExtension,
  defineSuperscriptExtension,
  defineTextStyleExtension,
  defineTooltipExtension,
} from '../../src/prosekit/extensions'

export const minimalEditorExtension = union(
  defineBasicExtension(),
  defineTextStyleExtension(),
  defineHighlightExtension(),
  defineSuperscriptExtension(),
  defineSubscriptExtension(),
  defineTooltipExtension(),
)

export type MinimalEditorExtension = typeof minimalEditorExtension
