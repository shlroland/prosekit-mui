import { defineMarkSpec } from 'prosekit/core'

import { getHighlightDomAttrs } from './shared'
import type {
  HighlightAttrs,
  HighlightOptions,
  HighlightSpecExtension,
} from './types'

export function defineHighlightSpec(
  options: HighlightOptions = {},
): HighlightSpecExtension {
  const resolvedOptions: Required<HighlightOptions> = {
    multicolor: options.multicolor ?? false,
  }

  return defineMarkSpec<'highlight', HighlightAttrs>({
    name: 'highlight',
    attrs: {
      color: { default: undefined },
    },
    parseDOM: [
      {
        tag: 'mark',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return resolvedOptions.multicolor ? {} : null
          }

          if (!resolvedOptions.multicolor) {
            return {}
          }

          const color = node.getAttribute('data-color') || node.style.backgroundColor
          return color ? { color } : {}
        },
      },
    ],
    toDOM: (mark) => {
      return ['mark', getHighlightDomAttrs(mark.attrs, resolvedOptions), 0]
    },
  })
}
