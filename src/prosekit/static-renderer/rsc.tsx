import type { ReactNode } from 'react'
import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'

import { parseProseKitHTMLToNode, type ProseKitHTMLAdapterOptions } from './html-adapter'
import {
  createBuiltinReactMarkMapping,
  createBuiltinReactNodeMapping,
  createProseKitReactRenderer,
  renderProseKitReact,
  type ProseKitReactRendererOptions,
} from './react-renderer'

export type ProseKitRSCRendererOptions = ProseKitReactRendererOptions

export type RenderProseKitRSCFromHTMLOptions =
  & ProseKitRSCRendererOptions
  & ProseKitHTMLAdapterOptions

export const createBuiltinRSCNodeMapping = createBuiltinReactNodeMapping
export const createBuiltinRSCMarkMapping = createBuiltinReactMarkMapping

/**
 * Server-safe React renderer for Next.js Server Components.
 *
 * This entrypoint intentionally does not import editor runtime, Base UI, or any
 * client-only views. If a node or mark needs interactivity, pass a Client
 * Component explicitly through `nodeMapping` or `markMapping`.
 */
export function createProseKitRSCRenderer(
  options: ProseKitRSCRendererOptions = {},
): (content: NodeJSON | ProseMirrorNode) => ReactNode {
  return createProseKitReactRenderer(options)
}

export function renderProseKitRSC(
  content: NodeJSON | ProseMirrorNode,
  options: ProseKitRSCRendererOptions = {},
): ReactNode {
  return renderProseKitReact(content, options)
}

export function renderProseKitRSCFromHTML(
  html: string,
  options: RenderProseKitRSCFromHTMLOptions = {},
): ReactNode {
  return renderProseKitRSC(parseProseKitHTMLToNode(html, options), options)
}
