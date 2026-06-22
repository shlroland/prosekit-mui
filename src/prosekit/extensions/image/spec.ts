import { defineNodeAttr, union } from 'prosekit/core'

import type { ImageAttrs, ImageExtensionOptions, ImageSpecExtension } from './types'

function normalizeImageAlign(value: string | null | undefined): ImageAttrs['align'] {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }

  return null
}

function withBaseUrl(url: string, baseUrl: string) {
  if (!url || !baseUrl || /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return url
  }
}

function removeBaseUrl(url: string, baseUrl: string) {
  if (!url || !baseUrl || !url.startsWith(baseUrl)) {
    return url
  }

  return url.slice(baseUrl.length) || '/'
}

export function defineImageSpec(options: ImageExtensionOptions = {}): ImageSpecExtension {
  const baseUrl = options.baseUrl ?? ''

  return union(
    defineNodeAttr<'image', 'src', ImageAttrs['src']>({
      type: 'image',
      attr: 'src',
      default: null,
      parseDOM: (element) => {
        return withBaseUrl(element.getAttribute('src') || '', baseUrl) || null
      },
      toDOM: (value) => {
        return value ? ['src', removeBaseUrl(value, baseUrl)] : null
      },
    }),
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
