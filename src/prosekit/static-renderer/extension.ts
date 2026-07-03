import { union } from 'prosekit/core'
import { defineBackgroundColorSpec } from 'prosekit/extensions/background-color'
import { defineBlockquote } from 'prosekit/extensions/blockquote'
import { defineBold } from 'prosekit/extensions/bold'
import { defineCode } from 'prosekit/extensions/code'
import { defineCodeBlock } from 'prosekit/extensions/code-block'
import { defineDoc } from 'prosekit/extensions/doc'
import { defineFontFamilySpec } from 'prosekit/extensions/font-family'
import { defineHardBreak } from 'prosekit/extensions/hard-break'
import { defineHeading } from 'prosekit/extensions/heading'
import { defineHighlightSpec } from 'prosekit/extensions/highlight'
import { defineHorizontalRule } from 'prosekit/extensions/horizontal-rule'
import { defineImage } from 'prosekit/extensions/image'
import { defineItalic } from 'prosekit/extensions/italic'
import { defineListSpec } from 'prosekit/extensions/list'
import { defineMathBlockSpec, defineMathInlineSpec } from 'prosekit/extensions/math'
import { defineParagraph } from 'prosekit/extensions/paragraph'
import { defineStrike } from 'prosekit/extensions/strike'
import { defineSubscriptSpec } from 'prosekit/extensions/subscript'
import { defineSuperscriptSpec } from 'prosekit/extensions/superscript'
import {
  defineTableCellSpec,
  defineTableHeaderCellSpec,
  defineTableRowSpec,
  defineTableSpec,
} from 'prosekit/extensions/table'
import { defineText } from 'prosekit/extensions/text'
import { defineTextAlign } from 'prosekit/extensions/text-align'
import { defineTextColorSpec } from 'prosekit/extensions/text-color'
import { defineUnderline } from 'prosekit/extensions/underline'

import { defineAlertSpec } from '../extensions/alert'
import { defineAttachmentSpec, type AttachmentExtensionOptions } from '../extensions/attachment'
import { defineDetailsSpec } from '../extensions/details'
import { defineEmojiSpec } from '../extensions/emoji'
import { defineExcalidrawSpec } from '../extensions/excalidraw/spec'
import { defineFlipGridSpec } from '../extensions/flip-grid'
import { defineFontSizeSpec } from '../extensions/font-size'
import { defineImageSpec, type ImageExtensionOptions } from '../extensions/image'
import { defineLinkSpec } from '../extensions/link'
import { defineTableCellAttrs } from '../extensions/table-cell-attrs/attrs'
import { defineTableCellVerticalAlignAttrs } from '../extensions/table-cell-vertical-align/attrs'
import { defineTableOfContentsAttrs } from '../extensions/table-of-contents/extension'
import { defineTooltipSpec } from '../extensions/tooltip'

export type StaticRichTextExtensionOptions = {
  baseUrl?: string
  attachment?: AttachmentExtensionOptions
  image?: ImageExtensionOptions
}

export function defineStaticTableExtension() {
  return union(
    defineTableSpec(),
    defineTableRowSpec(),
    defineTableCellSpec(),
    defineTableHeaderCellSpec(),
    ...defineTableCellAttrs(),
    ...defineTableCellVerticalAlignAttrs(),
  )
}

export function defineStaticBasicExtension() {
  return union(
    defineDoc(),
    defineText(),
    defineParagraph(),
    defineHeading(),
    defineTableOfContentsAttrs(),
    defineListSpec(),
    defineBlockquote(),
    defineImage(),
    defineHorizontalRule(),
    defineHardBreak(),
    defineStaticTableExtension(),
    defineCodeBlock(),
    defineMathInlineSpec(),
    defineMathBlockSpec(),
    defineItalic(),
    defineBold(),
    defineUnderline(),
    defineStrike(),
    defineCode(),
    defineTextAlign({
      types: ['paragraph', 'heading'],
      default: 'left',
    }),
    defineTextColorSpec(),
    defineBackgroundColorSpec(),
    defineFontFamilySpec(),
    defineFontSizeSpec(),
    defineHighlightSpec(),
    defineSuperscriptSpec(),
    defineSubscriptSpec(),
  )
}

export function defineStaticRichTextExtension(options: StaticRichTextExtensionOptions = {}) {
  const assetOptions = { baseUrl: options.baseUrl }

  return union(
    defineStaticBasicExtension(),
    defineAlertSpec(),
    defineDetailsSpec(),
    defineAttachmentSpec({
      ...assetOptions,
      ...options.attachment,
    }),
    defineImageSpec({
      ...assetOptions,
      ...options.image,
    }),
    defineLinkSpec(),
    defineEmojiSpec(),
    defineExcalidrawSpec(),
    defineFlipGridSpec(),
    defineTooltipSpec(),
  )
}
