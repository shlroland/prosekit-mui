import { Fragment, type ReactNode } from 'react'
import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import type { CustomMappingOptions, MarkMapping, NodeMapping, StaticRendererSecurityOptions } from 'prosekit-static-renderer'
import { createReactRenderer, renderToReactElement } from 'prosekit-static-renderer/react'

import { defineStaticRichTextExtension, type StaticRichTextExtensionOptions } from './extension'
import {
  renderEmojiText,
  StaticAlertView,
  StaticBlockAttachmentView,
  StaticDetailsContentView,
  StaticDetailsSummaryView,
  StaticDetailsView,
  StaticExcalidrawView,
  StaticDocView,
  StaticFlipGridColumnView,
  StaticFlipGridView,
  StaticImageView,
  StaticMathBlockView,
  StaticMathInlineView,
  StaticInlineAttachmentView,
  StaticLinkView,
  StaticTooltipView,
} from './views/react-static-views'

export type ProseKitReactRendererOptions =
  & StaticRichTextExtensionOptions
  & StaticRendererSecurityOptions
  & CustomMappingOptions<ReactNode>

function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

function keyedChildren(children: ReactNode | ReactNode[]) {
  return asArray(children).map((child, index) => <Fragment key={index}>{child}</Fragment>)
}

export function createBuiltinReactNodeMapping(options: StaticRichTextExtensionOptions = {}): NodeMapping<ReactNode> {
  return {
    doc: ({ children }) => <StaticDocView>{keyedChildren(children)}</StaticDocView>,
    alert: ({ node, children }) => <StaticAlertView attrs={node.attrs}>{keyedChildren(children)}</StaticAlertView>,
    details: ({ node, children }) => <StaticDetailsView attrs={node.attrs}>{keyedChildren(children)}</StaticDetailsView>,
    detailsSummary: ({ children }) => <StaticDetailsSummaryView>{keyedChildren(children)}</StaticDetailsSummaryView>,
    detailsContent: ({ children }) => <StaticDetailsContentView>{keyedChildren(children)}</StaticDetailsContentView>,
    inlineAttachment: ({ node }) => <StaticInlineAttachmentView attrs={node.attrs} baseUrl={options.baseUrl} />,
    blockAttachment: ({ node }) => <StaticBlockAttachmentView attrs={node.attrs} baseUrl={options.baseUrl} />,
    image: ({ node }) => <StaticImageView attrs={node.attrs} baseUrl={options.baseUrl} />,
    mathInline: ({ node }) => <StaticMathInlineView attrs={node.attrs}>{node.textContent}</StaticMathInlineView>,
    mathBlock: ({ node }) => <StaticMathBlockView attrs={node.attrs}>{node.textContent}</StaticMathBlockView>,
    inlineLink: ({ node }) => <StaticLinkView attrs={node.attrs} />,
    blockLink: ({ node }) => <StaticLinkView attrs={{ ...node.attrs, type: 'block' }} />,
    flipGrid: ({ node, children }) => {
      const columnWidths: number[] = []
      node.forEach((child) => {
        columnWidths.push(typeof child.attrs.width === 'number' ? child.attrs.width : 50)
      })

      return (
        <StaticFlipGridView attrs={node.attrs} columnWidths={columnWidths}>
          {keyedChildren(children)}
        </StaticFlipGridView>
      )
    },
    flipGridColumn: ({ node, children }) => <StaticFlipGridColumnView attrs={node.attrs}>{keyedChildren(children)}</StaticFlipGridColumnView>,
    emoji: ({ node }) => renderEmojiText(node.attrs),
    excalidraw: () => <StaticExcalidrawView />,
  }
}

export function createBuiltinReactMarkMapping(): MarkMapping<ReactNode> {
  return {
    tooltip: ({ mark, children }) => <StaticTooltipView attrs={mark.attrs}>{children}</StaticTooltipView>,
  }
}

export function createProseKitReactRenderer(options: ProseKitReactRendererOptions = {}) {
  const extension = defineStaticRichTextExtension(options)
  const render = createReactRenderer({
    extension,
    sanitizeURL: options.sanitizeURL,
    nodeMapping: {
      ...createBuiltinReactNodeMapping(options),
      ...options.nodeMapping,
    },
    markMapping: {
      ...createBuiltinReactMarkMapping(),
      ...options.markMapping,
    },
    unhandledNode: options.unhandledNode,
    unhandledMark: options.unhandledMark,
  })

  return (content: NodeJSON | ProseMirrorNode) => {
    return <StaticDocView>{render(content)}</StaticDocView>
  }
}

export function renderProseKitReact(
  content: NodeJSON | ProseMirrorNode,
  options: ProseKitReactRendererOptions = {},
) {
  const extension = defineStaticRichTextExtension(options)

  return <StaticDocView>{renderToReactElement({
    extension,
    content,
    sanitizeURL: options.sanitizeURL,
    nodeMapping: {
      ...createBuiltinReactNodeMapping(options),
      ...options.nodeMapping,
    },
    markMapping: {
      ...createBuiltinReactMarkMapping(),
      ...options.markMapping,
    },
    unhandledNode: options.unhandledNode,
    unhandledMark: options.unhandledMark,
  })}</StaticDocView>
}
