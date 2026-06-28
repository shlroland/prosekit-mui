import { defineMarkSpec } from 'prosekit/core'

import type { FontSizeAttrs, FontSizeSpecExtension } from './types'

function normalizeFontSize(value: string | null | undefined) {
  const text = value?.trim() ?? ''

  if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(text)) {
    return text
  }

  return ''
}

export function defineFontSizeSpec(): FontSizeSpecExtension {
  return defineMarkSpec<'fontSize', FontSizeAttrs>({
    name: 'fontSize',
    attrs: {
      size: { validate: 'string' },
    },
    parseDOM: [
      {
        tag: ':where([style*="font-size:"], [data-font-size])',
        getAttrs: (node): FontSizeAttrs | false => {
          const value = normalizeFontSize(node.getAttribute('data-font-size') || node.style.fontSize)
          return value ? { size: value } : false
        },
        consuming: false,
      },
    ],
    toDOM: (mark) => {
      const size = normalizeFontSize(mark.attrs.size)
      return ['span', { 'style': `font-size: ${size};`, 'data-font-size': size }, 0]
    },
  }) as FontSizeSpecExtension
}
