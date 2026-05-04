import { defineMarkSpec } from 'prosekit/core'

import type { TooltipAttrs, TooltipSpecExtension } from './types'

function getTooltipDomAttrs(attrs: TooltipAttrs) {
  const tooltip = attrs.tooltip ?? ''

  return {
    'data-tooltip': tooltip,
    title: tooltip,
  }
}

export function defineTooltipSpec(): TooltipSpecExtension {
  return defineMarkSpec<'tooltip', TooltipAttrs>({
    name: 'tooltip',
    attrs: {
      tooltip: { default: undefined },
    },
    parseDOM: [
      {
        tag: 'span[data-tooltip]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false
          }

          const tooltip = node.getAttribute('data-tooltip')
          return { tooltip: tooltip || undefined }
        },
      },
    ],
    toDOM: (mark) => {
      return ['span', getTooltipDomAttrs(mark.attrs), 0]
    },
  })
}
