import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import type { CustomMappingOptions, StaticRendererSecurityOptions } from 'prosekit-static-renderer'
import { createHTMLRenderer, renderToHTMLString } from 'prosekit-static-renderer/html'

import { defineStaticRichTextExtension, type StaticRichTextExtensionOptions } from './extension'
import { createBuiltinHTMLMarkMapping, createBuiltinHTMLNodeMapping } from './html-mapping'

export type ProseKitHTMLRendererOptions =
  & StaticRichTextExtensionOptions
  & StaticRendererSecurityOptions
  & CustomMappingOptions<string>

export function createProseKitHTMLRenderer(options: ProseKitHTMLRendererOptions = {}) {
  const extension = defineStaticRichTextExtension(options)
  const render = createHTMLRenderer({
    extension,
    sanitizeURL: options.sanitizeURL,
    nodeMapping: {
      ...createBuiltinHTMLNodeMapping(options),
      ...options.nodeMapping,
    },
    markMapping: {
      ...createBuiltinHTMLMarkMapping(),
      ...options.markMapping,
    },
    unhandledNode: options.unhandledNode,
    unhandledMark: options.unhandledMark,
  })

  return (content: NodeJSON | ProseMirrorNode) => {
    return `<div class="ProseMirror prosekit-static-renderer" data-static-renderer="true">${render(content)}</div>`
  }
}

export function renderProseKitHTML(
  content: NodeJSON | ProseMirrorNode,
  options: ProseKitHTMLRendererOptions = {},
) {
  const extension = defineStaticRichTextExtension(options)

  const html = renderToHTMLString({
    extension,
    content,
    sanitizeURL: options.sanitizeURL,
    nodeMapping: {
      ...createBuiltinHTMLNodeMapping(options),
      ...options.nodeMapping,
    },
    markMapping: {
      ...createBuiltinHTMLMarkMapping(),
      ...options.markMapping,
    },
    unhandledNode: options.unhandledNode,
    unhandledMark: options.unhandledMark,
  })

  return `<div class="ProseMirror prosekit-static-renderer" data-static-renderer="true">${html}</div>`
}
