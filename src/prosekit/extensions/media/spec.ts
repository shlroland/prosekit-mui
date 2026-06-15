import { defineNodeSpec, union } from 'prosekit/core'

import type {
  AudioAttrs,
  MediaSpecExtension,
  VideoAttrs,
} from './types'

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function defineMediaSpec(): MediaSpecExtension {
  return union(
    defineNodeSpec<'video', VideoAttrs>({
      name: 'video',
      group: 'block',
      atom: true,
      selectable: true,
      draggable: true,
      attrs: {
        src: { default: '' },
        width: { default: '100%' },
      },
      parseDOM: [
        {
          tag: 'video[src]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLVideoElement)) {
              return false
            }

            return {
              src: dom.getAttribute('src') || '',
              width: dom.getAttribute('width') || dom.style.width || '100%',
            }
          },
        },
      ],
      toDOM: (node) => {
        const attrs = node.attrs as VideoAttrs

        return [
          'video',
          {
            src: normalizeText(attrs.src),
            controls: 'true',
            width: normalizeText(attrs.width) || '100%',
            class: 'prosekit-media-video',
          },
        ]
      },
    }),
    defineNodeSpec<'audio', AudioAttrs>({
      name: 'audio',
      group: 'block',
      atom: true,
      selectable: true,
      draggable: true,
      attrs: {
        src: { default: '' },
      },
      parseDOM: [
        {
          tag: 'audio[src]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLAudioElement)) {
              return false
            }

            return {
              src: dom.getAttribute('src') || '',
            }
          },
        },
      ],
      toDOM: (node) => {
        const attrs = node.attrs as AudioAttrs

        return [
          'audio',
          {
            src: normalizeText(attrs.src),
            controls: 'true',
            class: 'prosekit-media-audio',
          },
        ]
      },
    }),
  ) as MediaSpecExtension
}
