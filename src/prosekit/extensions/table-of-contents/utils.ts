import type { EditorState } from 'prosekit/pm/state'

import type { TableOfContentsHeadingAttrs, TableOfContentsItem } from './types'

const fallbackHeadingText = 'section'

function normalizeSlugInput(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createHeadingSlug(text: string): string {
  return normalizeSlugInput(text) || fallbackHeadingText
}

export function createTocId(pos: number, index: number): string {
  return `toc-${pos.toString(36)}-${index.toString(36)}`
}

export function createUniqueHeadingId(
  text: string,
  usedIds: Set<string>,
  preferredId?: string | null,
): string {
  const preferredSlug = preferredId ? normalizeSlugInput(preferredId) : ''
  const base = preferredSlug || createHeadingSlug(text)
  let id = base
  let index = 2

  while (usedIds.has(id)) {
    id = `${base}-${index}`
    index += 1
  }

  usedIds.add(id)
  return id
}

export function getTableOfContents(state: EditorState): TableOfContentsItem[] {
  const items: TableOfContentsItem[] = []

  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'heading') {
      return true
    }

    const attrs = node.attrs as TableOfContentsHeadingAttrs
    const id = attrs.id || attrs.tocId

    if (!id) {
      return false
    }

    items.push({
      id,
      tocId: attrs.tocId || id,
      level: Number(attrs.level) || 1,
      text: node.textContent.trim() || 'Untitled',
      pos,
    })

    return false
  })

  return items
}
