import type { ProseMirrorNode } from 'prosekit/pm/model'
import { NodeSelection, TextSelection, type EditorState } from 'prosekit/pm/state'
import type { EditorView } from 'prosekit/pm/view'

import type { LinkAttrs } from './types'
import { getLinkTitle, toLinkAttrs } from './utils'

export type LinkNodeName = 'inlineLink' | 'blockLink'

export type ActiveLinkNode = {
  node: ProseMirrorNode
  pos: number
  type: LinkNodeName
}

function isLinkNodeName(value: string): value is LinkNodeName {
  return value === 'inlineLink' || value === 'blockLink'
}

export function getActiveLinkNode(state: EditorState): ActiveLinkNode | null {
  const { selection } = state

  if (selection instanceof NodeSelection) {
    const nodeName = selection.node.type.name
    if (isLinkNodeName(nodeName)) {
      return {
        node: selection.node,
        pos: selection.from,
        type: nodeName,
      }
    }
  }

  if (!selection.empty) {
    return null
  }

  const { $from } = selection
  const before = $from.nodeBefore
  if (before && isLinkNodeName(before.type.name)) {
    return {
      node: before,
      pos: $from.pos - before.nodeSize,
      type: before.type.name,
    }
  }

  const after = $from.nodeAfter
  if (after && isLinkNodeName(after.type.name)) {
    return {
      node: after,
      pos: $from.pos,
      type: after.type.name,
    }
  }

  return null
}

export function isLinkActive(state: EditorState) {
  return getActiveLinkNode(state) !== null
}

export function getCurrentLinkHref(state: EditorState) {
  const active = getActiveLinkNode(state)
  const href = active?.node.attrs.href
  return typeof href === 'string' ? href : ''
}

export function getCurrentLinkAttrs(state: EditorState): LinkAttrs | null {
  const active = getActiveLinkNode(state)
  if (!active) {
    return null
  }

  const href = typeof active.node.attrs.href === 'string' ? active.node.attrs.href : ''
  const attrs = toLinkAttrs(href, active.node.attrs as Partial<LinkAttrs>)
  return attrs
}

export function getReplacementText(attrs: Partial<LinkAttrs>) {
  const title = typeof attrs.title === 'string' ? attrs.title.trim() : ''
  if (title) {
    return title
  }

  const href = typeof attrs.href === 'string' ? attrs.href.trim() : ''
  return href || getLinkTitle(href)
}

export function selectLinkNode(view: EditorView, pos: number) {
  const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos))
  view.dispatch(tr)
  view.focus()
}

export function replaceLinkNode(
  view: EditorView,
  pos: number,
  node: ProseMirrorNode,
) {
  const tr = view.state.tr.replaceWith(pos, pos + view.state.doc.nodeAt(pos)!.nodeSize, node)
  tr.setSelection(NodeSelection.create(tr.doc, pos))
  view.dispatch(tr)
  view.focus()
}

export function removeCurrentLinkNode(view: EditorView, active: ActiveLinkNode) {
  const text = getReplacementText(active.node.attrs as Partial<LinkAttrs>)
  const { schema } = view.state
  const tr = view.state.tr

  if (active.type === 'blockLink') {
    const paragraphType = schema.nodes.paragraph
    if (!paragraphType) {
      return false
    }

    const paragraph = paragraphType.createAndFill(
      null,
      text ? schema.text(text) : undefined,
    )
    if (!paragraph) {
      return false
    }

    tr.replaceWith(active.pos, active.pos + active.node.nodeSize, paragraph)
    tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(tr.doc.content.size, active.pos + 1))))
  } else {
    tr.replaceWith(active.pos, active.pos + active.node.nodeSize, schema.text(text))
    tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(tr.doc.content.size, active.pos + text.length))))
  }

  view.dispatch(tr)
  view.focus()
  return true
}
