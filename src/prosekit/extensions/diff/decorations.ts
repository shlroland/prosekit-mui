import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import { Decoration, DecorationSet } from 'prosekit/pm/view'

import type { DiffItem, DiffOptions } from './types'

function createInsertDecoration(from: number, to: number): Decoration {
  return Decoration.inline(from, to, {
    class: 'prosekit-diff-insert',
  })
}

function createModifyDecoration(from: number, to: number): Decoration {
  return Decoration.inline(from, to, {
    class: 'prosekit-diff-modify',
  })
}

function normalizePreviewText(value: unknown): string {
  if (typeof value === 'string') {
    return value.replace(/\s+/g, ' ').trim()
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return ''
}

function truncatePreviewText(text: string, maxLength = 60): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}...`
}

function getFileNameFromUrl(url: string): string {
  const normalizedUrl = normalizePreviewText(url)

  if (!normalizedUrl) {
    return ''
  }

  try {
    const parsedUrl = new URL(normalizedUrl, 'https://placeholder.local')
    const segments = parsedUrl.pathname.split('/').filter(Boolean)
    return decodeURIComponent(segments[segments.length - 1] || '')
  } catch {
    const segments = normalizedUrl.split('/').filter(Boolean)
    return segments[segments.length - 1] || normalizedUrl
  }
}

function extractTextFromNode(node: NodeJSON | undefined): string {
  if (!node) {
    return ''
  }

  if (node.type === 'text') {
    return node.text || ''
  }

  return (node.content || []).map(extractTextFromNode).join('')
}

function formatDeletedNodeLabel(typeLabel: string, detail?: unknown): string {
  const normalizedDetail = normalizePreviewText(detail)
  return normalizedDetail
    ? `[已删除${typeLabel}: ${truncatePreviewText(normalizedDetail)}]`
    : `[已删除${typeLabel}]`
}

export function getDeletedNodePreviewText(node: NodeJSON, options?: DiffOptions): string {
  const customPreview = normalizePreviewText(options?.nodePreviewSerializer?.(node))

  if (customPreview) {
    return truncatePreviewText(customPreview)
  }

  const textContent = truncatePreviewText(normalizePreviewText(extractTextFromNode(node)))

  if (textContent) {
    return textContent
  }

  const attrs = node.attrs || {}

  switch (node.type) {
    case 'image':
      return formatDeletedNodeLabel('图片', attrs.title || attrs.alt || (attrs.src ? getFileNameFromUrl(String(attrs.src)) : ''))
    case 'inlineAttachment':
    case 'blockAttachment':
      return formatDeletedNodeLabel('附件', attrs.title || (attrs.url ? getFileNameFromUrl(String(attrs.url)) : ''))
    case 'inlineLink':
    case 'blockLink':
      return formatDeletedNodeLabel('链接', attrs.title || attrs.href)
    case 'mathInline':
      return formatDeletedNodeLabel('行内公式')
    case 'mathBlock':
      return formatDeletedNodeLabel('公式')
    case 'table':
      return formatDeletedNodeLabel('表格')
    case 'codeBlock':
      return formatDeletedNodeLabel('代码块', attrs.language)
    case 'details':
      return formatDeletedNodeLabel('折叠块')
    case 'alert':
      return formatDeletedNodeLabel('提示块')
    default:
      return formatDeletedNodeLabel('内容')
  }
}

function createDeleteWidget(pos: number, deletedNode: NodeJSON, options?: DiffOptions): Decoration {
  return Decoration.widget(
    pos,
    (view) => {
      const widget = view.dom.ownerDocument.createElement('span')
      const deletedText = getDeletedNodePreviewText(deletedNode, options)
      widget.className = 'prosekit-diff-delete'
      widget.textContent = deletedText || '[已删除]'
      widget.title = `删除的内容: ${deletedText}`
      return widget
    },
    {
      ignoreSelection: true,
      side: 1,
    },
  )
}

export function pathToPos(path: number[], doc: ProseMirrorNode): number {
  let pos = 0
  let current: ProseMirrorNode = doc

  for (const index of path) {
    const contentStartOffset = current.type.name === 'doc' ? 0 : 1
    let resolvedPos = pos + contentStartOffset
    const childCount = current.childCount
    const effectiveIndex = Math.min(index, childCount)

    for (let i = 0; i < effectiveIndex; i += 1) {
      resolvedPos += current.child(i).nodeSize
    }

    pos = resolvedPos

    if (index < childCount) {
      current = current.child(index)
    } else {
      break
    }
  }

  return pos
}

function getNodeAtPath(path: number[], doc: ProseMirrorNode): ProseMirrorNode | null {
  let current: ProseMirrorNode | null = doc

  for (const index of path) {
    if (!current || index >= current.childCount) {
      return null
    }

    current = current.child(index)
  }

  return current
}

function getNodeSizeAtPath(path: number[], doc: ProseMirrorNode): number {
  return getNodeAtPath(path, doc)?.nodeSize ?? 1
}

function adjustBaseForInline(node: ProseMirrorNode | null, absolutePos: number): number {
  if (!node) {
    return absolutePos
  }

  return node.isText ? absolutePos : absolutePos + 1
}

function mapInlineOffsetToPM(node: ProseMirrorNode | null, inlineOffset: number): number {
  if (!node || node.isText) {
    return inlineOffset
  }

  let remaining = inlineOffset
  let acc = 0

  for (let i = 0; i < node.childCount; i += 1) {
    const child = node.child(i)
    const size = child.isText ? child.text?.length || 0 : child.nodeSize

    if (child.isText) {
      if (remaining <= size) {
        return acc + remaining
      }

      acc += size
      remaining -= size
    } else {
      acc += size
    }
  }

  return acc
}

export function createDecorationsFromDiffs(
  diffs: DiffItem[],
  doc: ProseMirrorNode,
  options?: DiffOptions,
): DecorationSet {
  const decorations: Decoration[] = []

  diffs.forEach((diff) => {
    try {
      const pos = pathToPos(diff.path, doc)
      const nodeAtPath = getNodeAtPath(diff.path, doc)

      if (diff.type === 'insert') {
        if (diff.textDiff) {
          const base = adjustBaseForInline(nodeAtPath, pos)
          const from = base + mapInlineOffsetToPM(nodeAtPath, diff.textDiff.offset)
          const to = base + mapInlineOffsetToPM(nodeAtPath, diff.textDiff.offset + diff.textDiff.length)

          if (to > from) {
            decorations.push(createInsertDecoration(from, to))
          }
        } else if (nodeAtPath) {
          decorations.push(Decoration.node(pos, pos + nodeAtPath.nodeSize, { class: 'prosekit-diff-insert-node' }))
        }
      } else if (diff.type === 'delete' && diff.node) {
        if (diff.textDiff) {
          const base = adjustBaseForInline(nodeAtPath, pos)
          const widgetPos = base + mapInlineOffsetToPM(nodeAtPath, diff.textDiff.offset)
          decorations.push(createDeleteWidget(widgetPos, {
            type: 'text',
            text: diff.textDiff.text,
          }, options))
        } else {
          decorations.push(createDeleteWidget(pos, diff.node, options))
        }
      } else if (diff.type === 'modify' && diff.attrChange) {
        if (
          diff.attrChange.key === 'marks'
          && typeof diff.attrChange.fromOffset === 'number'
          && typeof diff.attrChange.toOffset === 'number'
        ) {
          const base = adjustBaseForInline(nodeAtPath, pos)
          const from = base + mapInlineOffsetToPM(nodeAtPath, diff.attrChange.fromOffset)
          const to = base + mapInlineOffsetToPM(nodeAtPath, diff.attrChange.toOffset)

          if (to > from) {
            decorations.push(createModifyDecoration(from, to))
          }
        } else {
          const nodeSize = getNodeSizeAtPath(diff.path, doc)
          decorations.push(Decoration.node(pos, pos + nodeSize, { class: 'prosekit-diff-modify-node' }))
        }
      }
    } catch (error) {
      console.warn('Failed to create diff decoration:', error, diff)
    }
  })

  return DecorationSet.create(doc, decorations)
}
