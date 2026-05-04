import type { PlainExtension } from 'prosekit/core'
import { definePasteRule } from 'prosekit/extensions/paste-rule'
import { Fragment, Slice, type Node as ProseMirrorNode } from 'prosekit/pm/model'

import { highlightPasteRegex } from './shared'
import type { HighlightOptions } from './types'

function replaceHighlightInTextNode(
  node: ProseMirrorNode,
): ProseMirrorNode[] | undefined {
  const text = node.text

  if (!text) {
    return
  }

  if (node.marks.some((mark) => mark.type.name === 'highlight')) {
    return
  }

  if (node.marks.some((mark) => mark.type.spec.code)) {
    return
  }

  highlightPasteRegex.lastIndex = 0

  const schema = node.type.schema
  const nodes: ProseMirrorNode[] = []
  let lastIndex = 0
  let changed = false
  let match: RegExpExecArray | null

  while ((match = highlightPasteRegex.exec(text))) {
    const start = match.index
    const end = highlightPasteRegex.lastIndex
    const content = match[1]

    if (start > lastIndex) {
      nodes.push(schema.text(text.slice(lastIndex, start), node.marks))
    }

    const highlightMark = schema.marks.highlight?.create(null)

    if (content && highlightMark) {
      nodes.push(schema.text(content, [...node.marks, highlightMark]))
      changed = true
    } else {
      nodes.push(schema.text(text.slice(start, end), node.marks))
    }

    lastIndex = end
  }

  if (!changed) {
    return
  }

  if (lastIndex < text.length) {
    nodes.push(schema.text(text.slice(lastIndex), node.marks))
  }

  return nodes
}

function replaceHighlightInFragment(fragment: Fragment): Fragment | undefined {
  let changed = false
  const children: ProseMirrorNode[] = []

  for (const child of fragment.content) {
    const nextChild = replaceHighlightInNode(child)

    if (nextChild) {
      changed = true
      children.push(nextChild)
    } else {
      children.push(child)
    }
  }

  if (!changed) {
    return
  }

  return Fragment.from(children)
}

function replaceHighlightInNode(node: ProseMirrorNode): ProseMirrorNode | undefined {
  if (node.type.spec.code) {
    return
  }

  if (node.type.isInline) {
    return
  }

  if (node.type.isTextblock) {
    let changed = false
    const children: ProseMirrorNode[] = []

    for (const inlineNode of node.content.content) {
      if (inlineNode.isText) {
        const nextInlineNodes = replaceHighlightInTextNode(inlineNode)

        if (nextInlineNodes) {
          changed = true
          children.push(...nextInlineNodes)
          continue
        }
      }

      children.push(inlineNode)
    }

    if (!changed) {
      return
    }

    return node.copy(Fragment.from(children))
  }

  const nextContent = replaceHighlightInFragment(node.content)

  if (!nextContent) {
    return
  }

  return node.copy(nextContent)
}

export function defineHighlightPasteRule(
  _options: HighlightOptions = {},
): PlainExtension {
  return definePasteRule({
    handler: ({ slice, plain }) => {
      if (plain) {
        return slice
      }

      const nextContent = replaceHighlightInFragment(slice.content)

      if (!nextContent) {
        return slice
      }

      return new Slice(nextContent, slice.openStart, slice.openEnd)
    },
  })
}
