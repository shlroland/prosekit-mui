import { defineNodeAttr, union } from 'prosekit/core'

import type { ImageAttrs, ImageSpecExtension } from './types'

function normalizeImageAlign(value: string | null | undefined): ImageAttrs['align'] {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }

  return null
}

export function defineImageSpec(): ImageSpecExtension {
  return union(
    defineNodeAttr<'image', 'title', ImageAttrs['title']>({
      type: 'image',
      attr: 'title',
      default: null,
      parseDOM: (element) => {
        return element.getAttribute('title') || element.getAttribute('alt') || null
      },
      toDOM: (value) => {
        return value ? ['title', value] : null
      },
    }),
    defineNodeAttr<'image', 'align', ImageAttrs['align']>({
      type: 'image',
      attr: 'align',
      default: null,
      parseDOM: (element) => {
        return normalizeImageAlign(element.getAttribute('data-image-align'))
      },
      toDOM: (value) => {
        const align = normalizeImageAlign(value)
        return align ? ['data-image-align', align] : null
      },
    }),
  ) as ImageSpecExtension
}
