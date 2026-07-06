import {
  defineBaseCommands,
  defineBaseKeymap,
  defineHistory,
  union,
  type BaseCommandsExtension,
  type BaseKeymapExtension,
  type HistoryExtension,
  type Union,
} from 'prosekit/core'
import { defineBlockquote, type BlockquoteExtension } from 'prosekit/extensions/blockquote'
import { defineBold, type BoldExtension } from 'prosekit/extensions/bold'
import { defineCode, type CodeExtension } from 'prosekit/extensions/code'
import { defineCodeBlock, type CodeBlockExtension } from 'prosekit/extensions/code-block'
import { defineDoc, type DocExtension } from 'prosekit/extensions/doc'
import { defineGapCursor, type GapCursorExtension } from 'prosekit/extensions/gap-cursor'
import { defineHardBreak, type HardBreakExtension } from 'prosekit/extensions/hard-break'
import { defineHeading, type HeadingExtension } from 'prosekit/extensions/heading'
import { defineHorizontalRule, type HorizontalRuleExtension } from 'prosekit/extensions/horizontal-rule'
import { defineImage, type ImageExtension } from 'prosekit/extensions/image'
import { defineItalic, type ItalicExtension } from 'prosekit/extensions/italic'
import { defineList, type ListExtension } from 'prosekit/extensions/list'
import { defineModClickPrevention, type ModClickPreventionExtension } from 'prosekit/extensions/mod-click-prevention'
import { defineParagraph, type ParagraphExtension } from 'prosekit/extensions/paragraph'
import { defineStrike, type StrikeExtension } from 'prosekit/extensions/strike'
import { defineText, type TextExtension } from 'prosekit/extensions/text'
import { defineUnderline, type UnderlineExtension } from 'prosekit/extensions/underline'
import { defineVirtualSelection, type VirtualSelectionExtension } from 'prosekit/extensions/virtual-selection'

import { defineLinkExtension, type LinkExtension } from '../link'
import { defineInsertContentCommands, type InsertContentCommandsExtension } from '../insert-content'
import { defineTableExtension, type TableOverlayExtension } from '../table'

export type BasicExtension = Union<
  [
    DocExtension,
    TextExtension,
    ParagraphExtension,
    HeadingExtension,
    ListExtension,
    BlockquoteExtension,
    ImageExtension,
    HorizontalRuleExtension,
    HardBreakExtension,
    TableOverlayExtension,
    CodeBlockExtension,
    ItalicExtension,
    BoldExtension,
    UnderlineExtension,
    StrikeExtension,
    CodeExtension,
    LinkExtension,
    BaseKeymapExtension,
    BaseCommandsExtension,
    InsertContentCommandsExtension,
    HistoryExtension,
    GapCursorExtension,
    VirtualSelectionExtension,
    ModClickPreventionExtension,
  ]
>

export function defineBasicExtension(): BasicExtension {
  return union(
    defineDoc(),
    defineText(),
    defineParagraph(),
    defineHeading(),
    defineList(),
    defineBlockquote(),
    defineImage(),
    defineHorizontalRule(),
    defineHardBreak(),
    defineTableExtension(),
    defineCodeBlock(),
    defineItalic(),
    defineBold(),
    defineUnderline(),
    defineStrike(),
    defineCode(),
    defineLinkExtension(),
    defineBaseKeymap(),
    defineBaseCommands(),
    defineInsertContentCommands(),
    defineHistory(),
    defineGapCursor(),
    defineVirtualSelection(),
    defineModClickPrevention(),
  )
}
