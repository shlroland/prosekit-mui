import {
  jsonFromHTML,
  nodeFromHTML,
  type DOMDocumentOptions,
  type DOMParserOptions,
  type NodeJSON,
} from 'prosekit/core'
import type { ProseMirrorNode, Schema } from 'prosekit/pm/model'

import { normalizeNodeJSON } from '../normalize-node-json'
import { defineStaticRichTextExtension, type StaticRichTextExtensionOptions } from './extension'
import { renderProseKitHTML, type ProseKitHTMLRendererOptions } from './html-renderer'

export type ProseKitHTMLAdapterOptions =
  & StaticRichTextExtensionOptions
  & DOMDocumentOptions
  & Pick<DOMParserOptions, 'DOMParser' | 'preserveWhitespace'>
  & {
    /**
     * Optional schema override. By default the adapter uses the same static
     * rich-text schema as the renderer.
     */
    schema?: Schema
  }

function getStaticRichTextSchema(options: ProseKitHTMLAdapterOptions = {}) {
  const schema = options.schema ?? defineStaticRichTextExtension(options).schema

  if (!schema) {
    throw new Error('Unable to parse ProseKit HTML without a schema.')
  }

  return schema
}

function getParserOptions(options: ProseKitHTMLAdapterOptions = {}) {
  return {
    schema: getStaticRichTextSchema(options),
    document: options.document,
    DOMParser: options.DOMParser,
    preserveWhitespace: options.preserveWhitespace,
  }
}

/**
 * Parses ProseMirror/ProseKit HTML into a ProseMirror document node using the
 * same schema as the static renderer.
 *
 * SSR note: Node.js does not provide the browser DOM APIs that ProseMirror's
 * HTML parser needs. In SSR, create a DOM with `happy-dom`, `jsdom`, or an
 * equivalent implementation, pass its `document` option, and make sure DOM
 * constructors used by parseDOM rules are available to the runtime:
 *
 * ```ts
 * import { Window } from 'happy-dom'
 *
 * const window = new Window()
 * const document = window.document
 * globalThis.HTMLElement ??= window.HTMLElement
 *
 * parseProseKitHTMLToNodeJSON(html, { document })
 * ```
 */
export function parseProseKitHTMLToNode(
  html: string,
  options: ProseKitHTMLAdapterOptions = {},
): ProseMirrorNode {
  return nodeFromHTML(html, getParserOptions(options))
}

/**
 * Parses ProseMirror/ProseKit HTML into normalized NodeJSON that can be passed
 * to any existing static renderer.
 */
export function parseProseKitHTMLToNodeJSON(
  html: string,
  options: ProseKitHTMLAdapterOptions = {},
): NodeJSON {
  return normalizeNodeJSON(jsonFromHTML(html, getParserOptions(options)))
}

export type RenderProseKitHTMLFromHTMLOptions =
  & ProseKitHTMLRendererOptions
  & ProseKitHTMLAdapterOptions

/**
 * Convenience adapter for callers that only have saved ProseMirror HTML.
 */
export function renderProseKitHTMLFromHTML(
  html: string,
  options: RenderProseKitHTMLFromHTMLOptions = {},
) {
  return renderProseKitHTML(parseProseKitHTMLToNode(html, options), options)
}
