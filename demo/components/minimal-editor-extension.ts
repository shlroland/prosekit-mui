import { defineBasicExtension } from 'prosekit/basic'
import { defineDropCursor } from 'prosekit/extensions/drop-cursor'
import { union } from 'prosekit/core'
import {
  defineHighlightExtension,
  defineSubscriptExtension,
  defineSuperscriptExtension,
  defineTextAlignExtension,
  defineTextStyleExtension,
  defineTrailingNode,
  defineTooltipExtension,
} from '../../src/prosekit/extensions'

export const minimalEditorExtension = union(
  defineBasicExtension(),
  defineDropCursor({
    color: 'rgba(25, 118, 210, 0.72)',
    width: 2,
  }),
  defineTrailingNode(),
  defineTextStyleExtension(),
  defineTextAlignExtension(),
  defineHighlightExtension(),
  defineSuperscriptExtension(),
  defineSubscriptExtension(),
  defineTooltipExtension(),
)

export type MinimalEditorExtension = typeof minimalEditorExtension
