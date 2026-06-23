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

import { defineAlertExtension } from '../alert'
import { defineAttachmentExtension, type AttachmentExtensionOptions } from '../attachment'
import { defineBasicExtension } from '../basic'
import { defineDetailsExtension } from '../details'
import { defineEmojiExtension } from '../emoji'
import { defineFlipGridExtension } from '../flip-grid'
import { defineImageExtension, type ImageExtensionOptions } from '../image'
import { defineTableCellVerticalAlignExtension } from '../table-cell-vertical-align'
import { defineTooltipExtension } from '../tooltip'
import { defineTrailingNode } from '../trailing-node'

export type RichTextExtensionOptions = {
  placeholder?: string
  attachment?: AttachmentExtensionOptions
  image?: ImageExtensionOptions
}

export function defineRichTextExtension(options: RichTextExtensionOptions = {}) {
  return union(
    defineBasicExtension(),
    defineDropCursor({
      color: 'rgba(25, 118, 210, 0.72)',
      width: 2,
    }),
    definePlaceholder({
      placeholder: (state) => {
        if (state.selection.$anchor.parent.type.name === 'detailsSummary') {
          return '输入面板标题'
        }

        return options.placeholder ?? '输入内容...'
      },
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
    defineEmojiExtension(),
    defineAlertExtension(),
    defineDetailsExtension(),
    defineAttachmentExtension(options.attachment),
    defineImageExtension(options.image),
    defineTableCellVerticalAlignExtension(),
    defineFlipGridExtension(),
    defineTooltipExtension(),
  )
}
