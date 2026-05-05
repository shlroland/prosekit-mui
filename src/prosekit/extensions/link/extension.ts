import { defineClickHandler, definePasteHandler, definePlugin, union, type PlainExtension } from 'prosekit/core'
import { Fragment, Slice } from 'prosekit/pm/model'
import type { EditorState } from 'prosekit/pm/state'
import { InputRule } from 'prosekit/pm/inputrules'
import { Plugin, PluginKey } from 'prosekit/pm/state'
import { defineEnterRule } from 'prosekit/extensions/enter-rule'
import { defineInputRule } from 'prosekit/extensions/input-rule'

import { defineLinkCommands } from './commands'
import { LINK_ENTER_RE, LINK_INPUT_RE, LINK_MARK_RE } from './link-regex'
import { defineLinkNodeView } from './node-view'
import { defineLinkSpec } from './spec'
import type { LinkExtension } from './types'
import { getLinkMatch, toLinkAttrs } from './utils'

function buildInlineLinkNode(state: EditorState, href: string) {
  const attrs = toLinkAttrs(href, { type: 'icon' })
  if (!attrs) {
    return null
  }

  const nodeType = state.schema.nodes.inlineLink
  return nodeType ? nodeType.create({ ...attrs, title: null }) : null
}

function defineLinkInputRule(): PlainExtension {
  return defineInputRule(new InputRule(LINK_INPUT_RE, (state, match, from) => {
    const href = match[1]
    if (!href) {
      return null
    }

    const node = buildInlineLinkNode(state, href)
    if (!node) {
      return null
    }

    return state.tr.replaceWith(from, from + href.length, node).insertText(' ')
  }))
}

function defineLinkEnterRule(): PlainExtension {
  return defineEnterRule({
    regex: LINK_ENTER_RE,
    handler: ({ state, from, match }) => {
      const href = match[1]
      if (!href) {
        return null
      }

      const node = buildInlineLinkNode(state, href)
      if (!node) {
        return null
      }

      const tr = state.tr.replaceWith(from, from + href.length, node)
      return tr.docChanged ? tr : null
    },
  })
}

function defineLinkOnPasteHandler(): PlainExtension {
  return definePasteHandler((view, event, slice) => {
    const { state } = view
    const { selection } = state

    const plainText = event.clipboardData?.getData('text/plain')?.trim() ?? ''
    if (plainText) {
      const parts: Array<{ type: 'text' | 'link', value: string }> = []
      let lastIndex = 0
      const regex = new RegExp(LINK_MARK_RE.source, 'gi')

      for (const match of plainText.matchAll(regex)) {
        const href = match[1]
        const text = match[0]
        const index = match.index ?? 0

        if (index > lastIndex) {
          parts.push({ type: 'text', value: plainText.slice(lastIndex, index) })
        }

        parts.push({ type: 'link', value: href || text })
        lastIndex = index + text.length
      }

      if (lastIndex < plainText.length) {
        parts.push({ type: 'text', value: plainText.slice(lastIndex) })
      }

      const inlineLinkType = state.schema.nodes.inlineLink
      if (inlineLinkType && parts.some((part) => part.type === 'link')) {
        const nodes = parts.flatMap((part) => {
          if (part.type === 'text') {
            return part.value ? [state.schema.text(part.value)] : []
          }

          const attrs = toLinkAttrs(part.value, { type: 'icon', title: null })
          return attrs ? [inlineLinkType.create(attrs)] : [state.schema.text(part.value)]
        })

        if (nodes.length > 0) {
          const tr = state.tr.replaceSelection(
            new Slice(Fragment.fromArray(nodes), 0, 0),
          )
          view.dispatch(tr)
          return true
        }
      }
    }

    if (selection.empty) {
      return false
    }

    let textContent = ''
    slice.content.forEach((node) => {
      textContent += node.textContent
    })

    const match = getLinkMatch(textContent)
    const href = match?.[1]
    const attrs = href ? toLinkAttrs(href) : null
    if (!attrs) {
      return false
    }

    const title = state.doc.textBetween(selection.from, selection.to, ' ', ' ').trim()
    const inlineLinkType = state.schema.nodes.inlineLink
    if (!inlineLinkType) {
      return false
    }

    const node = inlineLinkType.create({
      ...attrs,
      title: title || null,
      type: 'icon',
    })
    view.dispatch(state.tr.replaceSelectionWith(node, false))
    return true
  })
}

function defineOpenOnClickHandler(): PlainExtension {
  return defineClickHandler((view, _pos, event) => {
    if (event.button !== 0 || !view.editable) {
      return false
    }

    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return false
    }

    const link = target.closest('a[href]')
    if (!(link instanceof HTMLAnchorElement)) {
      return false
    }

    const attrs = toLinkAttrs(link.getAttribute('href') || '', {
      target: link.getAttribute('target'),
      rel: link.getAttribute('rel'),
    })

    if (!attrs?.href) {
      return false
    }

    window.open(attrs.href, attrs.target ?? '_blank')
    return true
  })
}

function defineDownloadClickHandler(): PlainExtension {
  return definePlugin(new Plugin({
    key: new PluginKey('prosekit-link-download-handler'),
    props: {
      handleDOMEvents: {
        click: (_view, event) => {
          const target = event.target
          if (!(target instanceof HTMLElement)) {
            return false
          }

          const link = target.closest('a[download]')
          if (!(link instanceof HTMLAnchorElement)) {
            return false
          }

          const href = link.getAttribute('href')
          if (!href) {
            return false
          }

          event.preventDefault()
          const downloadLink = document.createElement('a')
          downloadLink.href = href
          downloadLink.download = link.getAttribute('download') || href.split('/').pop() || 'download'
          document.body.append(downloadLink)
          downloadLink.click()
          downloadLink.remove()
          return true
        },
      },
    },
  }))
}

export function defineLinkExtension(): LinkExtension {
  return union(
    defineLinkSpec(),
    defineLinkCommands(),
    ...defineLinkNodeView(),
    defineLinkInputRule(),
    defineLinkEnterRule(),
    defineLinkOnPasteHandler(),
    defineOpenOnClickHandler(),
    defineDownloadClickHandler(),
  )
}
