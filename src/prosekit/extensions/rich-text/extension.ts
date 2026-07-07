import { union } from 'prosekit/core'
import { defineBackgroundColor } from 'prosekit/extensions/background-color'
import { defineDropCursor } from 'prosekit/extensions/drop-cursor'
import { defineHighlight } from 'prosekit/extensions/highlight'
import { definePlaceholder } from 'prosekit/extensions/placeholder'
import { defineSubscript } from 'prosekit/extensions/subscript'
import { defineSuperscript } from 'prosekit/extensions/superscript'
import { defineTextAlign } from 'prosekit/extensions/text-align'
import { defineTextColor } from 'prosekit/extensions/text-color'

import { defineAiWritingExtension, type AiWritingOptions } from '../ai-writing'
import { defineAlertExtension } from '../alert'
import { defineAttachmentExtension, type AttachmentExtensionOptions } from '../attachment'
import { defineBasicExtension } from '../basic'
import { defineCharacterCountExtension, type CharacterCountOptions } from '../character-count'
import { defineCodeBlockExtension, type CodeBlockExtensionOptions } from '../code-block'
import { defineDetailsExtension } from '../details'
import { defineDiffExtension, type DiffOptions } from '../diff'
import { defineEmojiExtension } from '../emoji'
import { defineExcalidrawExtension, type ExcalidrawExtensionOptions } from '../excalidraw'
import { defineFlipGridExtension } from '../flip-grid'
import { defineFontSize } from '../font-size'
import { defineEditorFontFamilyExtension } from '../font-family'
import { defineImageExtension, type ImageExtensionOptions } from '../image'
import { defineMathExtension, type MathExtensionOptions } from '../math'
import { defineMermaidExtension, type MermaidExtensionOptions } from '../mermaid'
import { defineTableCellVerticalAlignExtension } from '../table-cell-vertical-align'
import { defineTableCellAttrsExtension } from '../table-cell-attrs'
import { defineTableOfContentsExtension } from '../table-of-contents'
import { defineTooltipExtension } from '../tooltip'
import { defineTrailingNode } from '../trailing-node'

export type RichTextExtensionOptions = {
  placeholder?: string
  attachment?: AttachmentExtensionOptions
  image?: ImageExtensionOptions
  excalidraw?: ExcalidrawExtensionOptions
  codeBlock?: CodeBlockExtensionOptions
  mermaid?: MermaidExtensionOptions
  math?: MathExtensionOptions
  diff?: DiffOptions
  aiWriting?: AiWritingOptions
  characterCount?: CharacterCountOptions
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
    defineEditorFontFamilyExtension(),
    defineFontSize(),
    defineCharacterCountExtension(options.characterCount),
    defineTableOfContentsExtension(),
    defineDiffExtension(options.diff),
    defineAiWritingExtension(options.aiWriting),
    defineHighlight(),
    defineSuperscript(),
    defineSubscript(),
    defineCodeBlockExtension(options.codeBlock),
    defineMermaidExtension(options.mermaid),
    defineMathExtension(options.math),
    defineEmojiExtension(),
    defineAlertExtension(),
    defineDetailsExtension(),
    defineAttachmentExtension(options.attachment),
    defineImageExtension(options.image),
    defineExcalidrawExtension({
      onUpload: options.excalidraw?.onUpload ?? options.image?.onUpload,
      onError: options.excalidraw?.onError ?? options.image?.onError,
      maxWidth: options.excalidraw?.maxWidth,
    }),
    defineTableCellAttrsExtension(),
    defineTableCellVerticalAlignExtension(),
    defineFlipGridExtension(),
    defineTooltipExtension(),
  )
}
