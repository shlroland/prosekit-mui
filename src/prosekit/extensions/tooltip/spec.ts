import { defineMarkSpec } from 'prosekit/core'

import type { TooltipAttrs, TooltipSpecExtension } from './types'

function createTooltipId() {
  return `tooltip-${Math.random().toString(36).slice(2, 10)}`
}

function getTooltipText(attrs: TooltipAttrs) {
  return attrs.text ?? attrs.tooltip ?? ''
}

function getTooltipDomAttrs(attrs: TooltipAttrs) {
  const text = getTooltipText(attrs)
  const id = attrs.id ?? createTooltipId()

  return {
    'data-tooltip-id': id,
    'data-tooltip-text': text,
    'data-tooltip': text,
    title: text,
  }
}

export function defineTooltipSpec(): TooltipSpecExtension {
  return defineMarkSpec<'tooltip', TooltipAttrs>({
    name: 'tooltip',
    attrs: {
      id: { default: null },
      text: { default: null },
      tooltip: { default: undefined },
    },
    parseDOM: [
      {
        tag: 'span[data-tooltip], span[data-tooltip-text], span[data-tooltip-id]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false
          }

          const id = node.getAttribute('data-tooltip-id') || createTooltipId()
          const text = node.getAttribute('data-tooltip-text') || node.getAttribute('data-tooltip') || ''
          return { id, text, tooltip: text || undefined }
        },
      },
    ],
    toDOM: (mark) => {
      return ['span', getTooltipDomAttrs(mark.attrs), 0]
    },
  })
}
