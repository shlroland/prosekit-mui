import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import type { CustomMappingOptions, StaticRendererSecurityOptions } from 'prosekit-static-renderer'
import { createMarkdownRenderer, renderToMarkdown } from 'prosekit-static-renderer/markdown'

import { defineStaticRichTextExtension, type StaticRichTextExtensionOptions } from './extension'
import { resolveAssetUrl } from './url'

export type ProseKitMarkdownRendererOptions =
  & StaticRichTextExtensionOptions
  & StaticRendererSecurityOptions
  & CustomMappingOptions<string>

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function joinMarkdown(children: string | string[]): string {
  return Array.isArray(children) ? children.join('') : children
}

function block(value: string) {
  const content = value.trim()
  return content ? `${content}\n\n` : ''
}

function createBuiltinMarkdownNodeMapping(options: StaticRichTextExtensionOptions = {}) {
  return {
    alert: ({ children }: { children: string | string[] }) => {
      return block(joinMarkdown(children).trim().split('\n').map((line) => `> ${line}`).join('\n'))
    },
    details: ({ children }: { children: string | string[] }) => {
      return block(`<details>\n${joinMarkdown(children).trim()}\n</details>`)
    },
    detailsSummary: ({ children }: { children: string | string[] }) => {
      return `<summary>${joinMarkdown(children).trim()}</summary>\n\n`
    },
    detailsContent: ({ children }: { children: string | string[] }) => {
      return joinMarkdown(children)
    },
    inlineAttachment: ({ node }: { node: ProseMirrorNode }) => {
      const href = resolveAssetUrl(node.attrs.url, options.baseUrl)
      const title = normalizeText(node.attrs.title) || href || '附件'
      return href ? `[${title}](${href})` : title
    },
    blockAttachment: ({ node }: { node: ProseMirrorNode }) => {
      const href = resolveAssetUrl(node.attrs.url, options.baseUrl)
      const title = normalizeText(node.attrs.title) || href || '附件'
      return block(href ? `[${title}](${href})` : title)
    },
    inlineLink: ({ node }: { node: ProseMirrorNode }) => {
      const href = normalizeText(node.attrs.href)
      const title = normalizeText(node.attrs.title) || href
      return href ? `[${title}](${href})` : title
    },
    blockLink: ({ node }: { node: ProseMirrorNode }) => {
      const href = normalizeText(node.attrs.href)
      const title = normalizeText(node.attrs.title) || href
      return block(href ? `[${title}](${href})` : title)
    },
    image: ({ node }: { node: ProseMirrorNode }) => {
      const src = resolveAssetUrl(node.attrs.src, options.baseUrl)
      const title = normalizeText(node.attrs.title)
      return block(src ? `![${title}](${src})` : '')
    },
    mathInline: ({ node }: { node: ProseMirrorNode }) => {
      return `$${node.textContent}$`
    },
    mathBlock: ({ node }: { node: ProseMirrorNode }) => {
      return block(`$$\n${node.textContent}\n$$`)
    },
    flipGrid: ({ children }: { children: string | string[] }) => {
      return block(joinMarkdown(children))
    },
    flipGridColumn: ({ children }: { children: string | string[] }) => {
      return joinMarkdown(children)
    },
    emoji: ({ node }: { node: ProseMirrorNode }) => {
      return normalizeText(node.attrs.native) || normalizeText(node.attrs.name)
    },
    excalidraw: ({ node }: { node: ProseMirrorNode }) => {
      const src = resolveAssetUrl(node.attrs.src || node.attrs.url, options.baseUrl)
      const title = normalizeText(node.attrs.title)

      return block(src ? `![${title}](${src})` : '')
    },
  }
}

function createBuiltinMarkdownMarkMapping() {
  return {
    tooltip: ({ children }: { children: string }) => children,
  }
}

export function createProseKitMarkdownRenderer(options: ProseKitMarkdownRendererOptions = {}) {
  const extension = defineStaticRichTextExtension(options)

  return createMarkdownRenderer({
    extension,
    sanitizeURL: options.sanitizeURL,
    nodeMapping: {
      ...createBuiltinMarkdownNodeMapping(options),
      ...options.nodeMapping,
    },
    markMapping: {
      ...createBuiltinMarkdownMarkMapping(),
      ...options.markMapping,
    },
    unhandledNode: options.unhandledNode,
    unhandledMark: options.unhandledMark,
  })
}

export function renderProseKitMarkdown(
  content: NodeJSON | ProseMirrorNode,
  options: ProseKitMarkdownRendererOptions = {},
) {
  const extension = defineStaticRichTextExtension(options)

  return renderToMarkdown({
    extension,
    content,
    sanitizeURL: options.sanitizeURL,
    nodeMapping: {
      ...createBuiltinMarkdownNodeMapping(options),
      ...options.nodeMapping,
    },
    markMapping: {
      ...createBuiltinMarkdownMarkMapping(),
      ...options.markMapping,
    },
    unhandledNode: options.unhandledNode,
    unhandledMark: options.unhandledMark,
  })
}
