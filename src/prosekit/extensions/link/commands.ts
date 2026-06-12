import { defineCommands } from 'prosekit/core'
import type { Command, EditorState } from 'prosekit/pm/state'
import { NodeSelection, TextSelection } from 'prosekit/pm/state'

import { getActiveLinkNode } from './node-utils'
import type { LinkAttrs, LinkCommandsExtension } from './types'
import { getLinkTitle, normalizeInlineLinkType, toLinkAttrs } from './utils'

function buildEmptyInlineAttrs(state: EditorState, attrs: LinkAttrs): LinkAttrs {
  const active = getActiveLinkNode(state)
  const selectedText = getSelectionText(state)
  const title = attrs.title
    ?? selectedText
    ?? (typeof active?.node.attrs.title === 'string' ? active.node.attrs.title : '')
    ?? ''

  return {
    ...(active?.node.attrs as Partial<LinkAttrs> | undefined),
    ...attrs,
    href: '',
    target: attrs.target ?? '_blank',
    rel: attrs.rel ?? null,
    class: attrs.class ?? null,
    title,
    type: normalizeInlineLinkType(attrs.type),
    download: attrs.download ?? null,
  }
}

function buildEmptyBlockAttrs(state: EditorState, attrs: LinkAttrs): LinkAttrs {
  const active = getActiveLinkNode(state)
  const selectedText = getSelectionText(state)
  const title = attrs.title
    ?? selectedText
    ?? (typeof active?.node.attrs.title === 'string' ? active.node.attrs.title : '')
    ?? ''

  return {
    ...(active?.node.attrs as Partial<LinkAttrs> | undefined),
    ...attrs,
    href: '',
    target: attrs.target ?? '_blank',
    rel: attrs.rel ?? null,
    class: attrs.class ?? null,
    title,
    type: 'block',
    download: attrs.download ?? null,
  }
}

function getSelectionText(state: EditorState) {
  const { from, to, empty } = state.selection
  if (empty) {
    return ''
  }
  return state.doc.textBetween(from, to, ' ', ' ').trim()
}

function replaceSelectionWithNode(type: 'inlineLink' | 'blockLink', attrs: LinkAttrs): Command {
  return (state, dispatch) => {
    const nodeType = state.schema.nodes[type]
    if (!nodeType) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const active = getActiveLinkNode(state)
    const node = nodeType.create(attrs)
    const tr = state.tr

    if (active) {
      tr.replaceWith(active.pos, active.pos + active.node.nodeSize, node)
      tr.setSelection(NodeSelection.create(tr.doc, active.pos))
      dispatch?.(tr.scrollIntoView())
      return true
    }

    if (type === 'blockLink') {
      tr.replaceSelectionWith(node, false)
      const pos = Math.max(0, tr.selection.from - 1)
      tr.setSelection(NodeSelection.create(tr.doc, pos))
      dispatch?.(tr.scrollIntoView())
      return true
    }

    tr.replaceSelectionWith(node, false)
    const pos = Math.max(0, tr.selection.from - node.nodeSize)
    tr.setSelection(NodeSelection.create(tr.doc, pos))
    dispatch?.(tr.scrollIntoView())
    return true
  }
}

function normalizeInlineAttrs(state: EditorState, attrs: LinkAttrs) {
  if (!attrs.href.trim()) {
    return buildEmptyInlineAttrs(state, attrs)
  }

  const active = getActiveLinkNode(state)
  const selectedText = getSelectionText(state)
  const fallbackTitle = selectedText
    || (typeof active?.node.attrs.title === 'string' ? active.node.attrs.title : '')
    || getLinkTitle(attrs.href)

  return toLinkAttrs(attrs.href, {
    ...(active?.node.attrs as Partial<LinkAttrs> | undefined),
    ...attrs,
    title: attrs.title ?? fallbackTitle,
    type: normalizeInlineLinkType(attrs.type),
  })
}

function normalizeBlockAttrs(state: EditorState, attrs: LinkAttrs) {
  if (!attrs.href.trim()) {
    return buildEmptyBlockAttrs(state, attrs)
  }

  const active = getActiveLinkNode(state)
  const selectedText = getSelectionText(state)
  const fallbackTitle = selectedText
    || (typeof active?.node.attrs.title === 'string' ? active.node.attrs.title : '')
    || getLinkTitle(attrs.href)

  return toLinkAttrs(attrs.href, {
    ...(active?.node.attrs as Partial<LinkAttrs> | undefined),
    ...attrs,
    title: attrs.title ?? fallbackTitle,
    type: 'block',
  })
}

function updateCurrentLink(attrs: Partial<LinkAttrs>): Command {
  return (state, dispatch) => {
    const active = getActiveLinkNode(state)
    if (!active) {
      return false
    }

    const nextRawAttrs = {
      ...(active.node.attrs as Partial<LinkAttrs>),
      ...attrs,
      type: active.type === 'blockLink' ? 'block' : normalizeInlineLinkType(attrs.type ?? active.node.attrs.type),
    }

    const nextAttrs = nextRawAttrs.href
      ? toLinkAttrs(nextRawAttrs.href, nextRawAttrs)
      : null

    if (!nextAttrs) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const nextTypeName = nextAttrs.type === 'block' ? 'blockLink' : 'inlineLink'
    const nextType = state.schema.nodes[nextTypeName]
    if (!nextType) {
      return false
    }

    const node = nextType.create({
      ...nextAttrs,
      type: nextTypeName === 'blockLink' ? 'block' : normalizeInlineLinkType(nextAttrs.type),
    })

    const tr = state.tr.replaceWith(active.pos, active.pos + active.node.nodeSize, node)
    tr.setSelection(NodeSelection.create(tr.doc, active.pos))
    dispatch(tr.scrollIntoView())
    return true
  }
}

function removeCurrentLink(): Command {
  return (state, dispatch) => {
    const active = getActiveLinkNode(state)
    if (!active) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const text = (typeof active.node.attrs.title === 'string' && active.node.attrs.title.trim())
      || (typeof active.node.attrs.href === 'string' && active.node.attrs.href.trim())
      || ''

    const tr = state.tr
    if (active.type === 'blockLink') {
      const paragraphType = state.schema.nodes.paragraph
      if (!paragraphType) {
        return false
      }

      const paragraph = paragraphType.createAndFill(
        null,
        text ? state.schema.text(text) : undefined,
      )
      if (!paragraph) {
        return false
      }
      tr.replaceWith(active.pos, active.pos + active.node.nodeSize, paragraph)
      tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(tr.doc.content.size, active.pos + 1))))
    } else {
      tr.replaceWith(active.pos, active.pos + active.node.nodeSize, state.schema.text(text))
      tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(tr.doc.content.size, active.pos + text.length))))
    }

    dispatch?.(tr.scrollIntoView())
    return true
  }
}

export function defineLinkCommands(): LinkCommandsExtension {
  return defineCommands({
    setInlineLink: (attrs: LinkAttrs) => (state, dispatch) => {
      const nextAttrs = normalizeInlineAttrs(state, attrs)
      return nextAttrs ? replaceSelectionWithNode('inlineLink', nextAttrs)(state, dispatch) : false
    },
    toggleInlineLink: (attrs?: LinkAttrs) => (state, dispatch) => {
      if (getActiveLinkNode(state)?.type === 'inlineLink') {
        return removeCurrentLink()(state, dispatch)
      }

      if (!attrs) {
        return false
      }

      const nextAttrs = normalizeInlineAttrs(state, attrs)
      if (!nextAttrs) {
        return false
      }

      return replaceSelectionWithNode('inlineLink', nextAttrs)(state, dispatch)
    },
    unsetInlineLink: () => (state, dispatch) => {
      return removeCurrentLink()(state, dispatch)
    },
    setBlockLink: (attrs: LinkAttrs) => (state, dispatch) => {
      const nextAttrs = normalizeBlockAttrs(state, attrs)
      if (!nextAttrs) {
        return false
      }

      return replaceSelectionWithNode('blockLink', nextAttrs)(state, dispatch)
    },
    setLink: (attrs: LinkAttrs) => (state, dispatch) => {
      if (attrs.type === 'block') {
        const nextAttrs = normalizeBlockAttrs(state, attrs)
        return nextAttrs ? replaceSelectionWithNode('blockLink', nextAttrs)(state, dispatch) : false
      }

      const nextAttrs = normalizeInlineAttrs(state, attrs)
      return nextAttrs ? replaceSelectionWithNode('inlineLink', nextAttrs)(state, dispatch) : false
    },
    updateLink: (attrs: Partial<LinkAttrs>) => (state, dispatch) => {
      return updateCurrentLink(attrs)(state, dispatch)
    },
    addLink: (attrs: LinkAttrs) => (state, dispatch) => {
      const nextAttrs = normalizeInlineAttrs(state, attrs)
      if (!nextAttrs) {
        return false
      }

      return replaceSelectionWithNode('inlineLink', nextAttrs)(state, dispatch)
    },
    removeLink: () => (state, dispatch) => {
      return removeCurrentLink()(state, dispatch)
    },
    toggleLink: (attrs?: LinkAttrs) => (state, dispatch) => {
      if (getActiveLinkNode(state)) {
        return removeCurrentLink()(state, dispatch)
      }

      if (!attrs) {
        return false
      }

      if (attrs.type === 'block') {
        const nextAttrs = normalizeBlockAttrs(state, attrs)
        return nextAttrs ? replaceSelectionWithNode('blockLink', nextAttrs)(state, dispatch) : false
      }

      const nextAttrs = normalizeInlineAttrs(state, attrs)
      if (!nextAttrs) {
        return false
      }

      return replaceSelectionWithNode('inlineLink', nextAttrs)(state, dispatch)
    },
    expandLink: () => (state, dispatch) => {
      const active = getActiveLinkNode(state)
      if (!active) {
        return false
      }

      if (!dispatch) {
        return true
      }

      const tr = state.tr.setSelection(NodeSelection.create(state.doc, active.pos))
      dispatch?.(tr.scrollIntoView())
      return true
    },
  }) as LinkCommandsExtension
}
