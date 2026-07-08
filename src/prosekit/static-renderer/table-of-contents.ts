import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'

import type { TableOfContentsItem } from '../extensions/table-of-contents/types'
import { createHeadingSlug, createTocId, createUniqueHeadingId } from '../extensions/table-of-contents/utils'
import { isNodeJSON, normalizeNodeJSON } from '../normalize-node-json'

export type StaticHeadingsOptions = {
  minLevel?: number
  maxLevel?: number
}

export type StaticHeadingItem = TableOfContentsItem

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeLevel(value: unknown): number {
  const level = typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 1

  return Math.min(6, Math.max(1, level))
}

function normalizeBoundaryLevel(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(6, Math.max(1, Math.trunc(value)))
    : fallback
}

function shouldIncludeHeading(level: number, options: StaticHeadingsOptions) {
  const minLevel = normalizeBoundaryLevel(options.minLevel, 1)
  const maxLevel = normalizeBoundaryLevel(options.maxLevel, 6)

  return level >= Math.min(minLevel, maxLevel) && level <= Math.max(minLevel, maxLevel)
}

function getTextContent(node: NodeJSON): string {
  if (node.type === 'text') {
    return normalizeText(node.text)
  }

  return (node.content ?? []).map((child) => getTextContent(child)).join('')
}

function getNodeSize(node: NodeJSON): number {
  if (node.type === 'text') {
    return normalizeText(node.text).length
  }

  if (!node.content?.length) {
    return 1
  }

  return 2 + node.content.reduce((size, child) => size + getNodeSize(child), 0)
}

function collectHeadings(
  node: NodeJSON,
  pos: number,
  state: {
    headingIndex: number
    usedIds: Set<string>
    usedTocIds: Set<string>
    items: TableOfContentsItem[]
    options: StaticHeadingsOptions
  },
) {
  if (node.type === 'heading') {
    state.headingIndex += 1

    const attrs = isRecord(node.attrs) ? node.attrs : {}
    const text = getTextContent(node).trim()
    const currentId = normalizeText(attrs.id) || null
    const currentTocId = normalizeText(attrs.tocId) || null
    const normalizedId = currentId ? createHeadingSlug(currentId) : null
    const id = createUniqueHeadingId(text, state.usedIds, normalizedId)
    let tocId = currentTocId || createTocId(pos, state.headingIndex)
    const level = normalizeLevel(attrs.level)

    if (state.usedTocIds.has(tocId)) {
      tocId = createTocId(pos, state.headingIndex)
    }

    state.usedTocIds.add(tocId)

    if (shouldIncludeHeading(level, state.options)) {
      state.items.push({
        id,
        tocId,
        level,
        text: text || 'Untitled',
        pos,
      })
    }

    return
  }

  if (!node.content?.length) {
    return
  }

  let childPos = node.type === 'doc' ? 0 : pos + 1

  for (const child of node.content) {
    collectHeadings(child, childPos, state)
    childPos += getNodeSize(child)
  }
}

function toNodeJSON(content: NodeJSON | ProseMirrorNode): NodeJSON {
  return isNodeJSON(content) ? normalizeNodeJSON(content) : normalizeNodeJSON(content.toJSON() as NodeJSON)
}

export function getStaticHeadings(
  content: NodeJSON | ProseMirrorNode,
  options: StaticHeadingsOptions = {},
): TableOfContentsItem[] {
  const items: TableOfContentsItem[] = []

  collectHeadings(toNodeJSON(content), 0, {
    headingIndex: 0,
    usedIds: new Set<string>(),
    usedTocIds: new Set<string>(),
    items,
    options,
  })

  return items
}

export const getStaticTableOfContents = getStaticHeadings
