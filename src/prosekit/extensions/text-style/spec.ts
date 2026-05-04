import { defineMarkSpec } from 'prosekit/core'

import type { TextStyleAttrs, TextStyleSpecExtension } from './types'
import {
  createTextStyleDeclaration,
  normalizeTextStyleAttrs,
} from './utils'

export function defineTextStyleSpec(): TextStyleSpecExtension {
  return defineMarkSpec<'textStyle', TextStyleAttrs>({
    name: 'textStyle',
    attrs: {
      color: { default: undefined },
      backgroundColor: { default: undefined },
      fontSize: { default: undefined },
      fontFamily: { default: undefined },
      lineHeight: { default: undefined },
    },
    parseDOM: [
      {
        tag: 'span',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false
          }

          const attrs = normalizeTextStyleAttrs({
            color: node.style.color || undefined,
            backgroundColor: node.style.backgroundColor || undefined,
            fontSize: node.style.fontSize || undefined,
            fontFamily: node.style.fontFamily || undefined,
            lineHeight: node.style.lineHeight || undefined,
            verticalAlign: node.style.verticalAlign || undefined,
          })

          return Object.keys(attrs).length > 0 ? attrs : false
        },
      },
    ],
    toDOM: (mark) => {
      const attrs = normalizeTextStyleAttrs(mark.attrs as Partial<TextStyleAttrs>)
      const style = createTextStyleDeclaration(attrs)

      return ['span', style ? { style } : {}, 0]
    },
  })
}
