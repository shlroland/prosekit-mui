import { defineMarkSpec, type Extension } from "prosekit/core"
import type { Attrs } from "prosekit/pm/model"

/**
 * @internal
 */
export type FontSizeSpecExtension = Extension<{
  Marks: {
    fontSize: {
      value: string | number
    }
  }
}>

export function defineFontSizeSpec(): FontSizeSpecExtension {
  return defineMarkSpec<'fontSize', { value: number }>({
    name: 'fontSize',
    attrs: {
      value: { default: undefined },
    },
    parseDOM: [
      {
        style: 'font-size',
        getAttrs: (value: string) => {
          return typeof value === 'string' && value ? { value } : false
        }
      },
      {
        tag: 'span[data-font-size]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false
          }

          return { value: node.dataset.fontSize || node.style.fontSize || null }
        }
      }
    ],
    toDOM: (node) => {
      const value = node.attrs.value
      const fontSize = typeof value === 'number' ? `${value}px` : typeof value === 'string' ? value : null
      return ['span', value ? { 'data-font-size': value, style: `font-size:${value};` } : {}, 0]
    }
  })
}


