import { union } from 'prosekit/core'
import { defineBackgroundColor } from 'prosekit/extensions/background-color'
import { defineDropCursor } from 'prosekit/extensions/drop-cursor'
import { defineFontFamily } from 'prosekit/extensions/font-family'
import { defineHighlight } from 'prosekit/extensions/highlight'
import { definePlaceholder } from 'prosekit/extensions/placeholder'
import { defineSubscript } from 'prosekit/extensions/subscript'
import { defineSuperscript } from 'prosekit/extensions/superscript'
import { defineTextAlign } from 'prosekit/extensions/text-align'
import { defineTextColor } from 'prosekit/extensions/text-color'

import { defineAlertPanelExtension } from '../alert-panel'
import { defineAttachmentExtension } from '../attachment'
import { defineBasicExtension } from '../basic'
import { defineFlipGridExtension } from '../flip-grid'
import { defineMediaExtension } from '../media'
import { defineTableCellVerticalAlignExtension } from '../table-cell-vertical-align'
import { defineTooltipExtension } from '../tooltip'
import { defineTrailingNode } from '../trailing-node'

export type RichTextExtensionOptions = {
  placeholder?: string
}

export function defineRichTextExtension(options: RichTextExtensionOptions = {}) {
  return union(
    defineBasicExtension(),
    defineDropCursor({
      color: 'rgba(25, 118, 210, 0.72)',
      width: 2,
    }),
    definePlaceholder({
      placeholder: options.placeholder ?? '输入内容...',
      strategy: 'block',
    }),
    defineTrailingNode(),
    defineTextAlign({
      types: ['paragraph', 'heading'],
      default: 'left',
    }),
    defineTextColor(),
    defineBackgroundColor(),
    defineFontFamily(),
    defineHighlight(),
    defineSuperscript(),
    defineSubscript(),
    defineAlertPanelExtension(),
    defineAttachmentExtension(),
    defineMediaExtension(),
    defineTableCellVerticalAlignExtension(),
    defineFlipGridExtension(),
    defineTooltipExtension(),
  )
}
