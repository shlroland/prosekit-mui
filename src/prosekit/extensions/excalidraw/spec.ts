import { defineNodeSpec } from 'prosekit/core'

import type { ExcalidrawSpecExtension } from './types'

export function defineExcalidrawSpec(): ExcalidrawSpecExtension {
  return defineNodeSpec<'excalidraw'>({
    name: 'excalidraw',
    attrs: {
      src: { default: null },
      url: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
    },
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,
    isolating: true,
    defining: true,
    parseDOM: [
      {
        tag: 'figure[data-type="excalidraw"]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return null
          }

          const image = element.querySelector('img')

          return {
            src: image?.getAttribute('src') ?? element.dataset.src ?? null,
            url: element.dataset.url ?? null,
            title: image?.getAttribute('title') ?? image?.getAttribute('alt') ?? element.dataset.title ?? null,
            width: Number.parseInt(image?.getAttribute('width') ?? element.dataset.width ?? '', 10) || null,
            height: Number.parseInt(image?.getAttribute('height') ?? element.dataset.height ?? '', 10) || null,
          }
        },
      },
    ],
    toDOM: (node) => {
      const src = node.attrs.src || node.attrs.url

      if (!src) {
        return ['figure', { 'data-type': 'excalidraw' }]
      }

      return ['figure', { 'data-type': 'excalidraw' }, ['img', {
        src,
        alt: node.attrs.title || '',
        title: node.attrs.title || undefined,
        width: node.attrs.width || undefined,
        height: node.attrs.height || undefined,
      }]]
    },
  }) as ExcalidrawSpecExtension
}
