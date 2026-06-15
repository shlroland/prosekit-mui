import { defineNodeSpec } from 'prosekit/core'

import type { AttachmentAttrs, AttachmentSpecExtension } from './types'

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function defineAttachmentSpec(): AttachmentSpecExtension {
  return defineNodeSpec<'attachment', AttachmentAttrs>({
    name: 'attachment',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,
    attrs: {
      url: { default: '' },
      title: { default: '' },
      size: { default: '' },
    },
    parseDOM: [
      {
        tag: 'a[data-attachment="true"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) {
            return false
          }

          return {
            url: dom.getAttribute('href') || '',
            title: dom.getAttribute('data-title') || dom.textContent || '',
            size: dom.getAttribute('data-size') || '',
          }
        },
      },
    ],
    toDOM: (node) => {
      const attrs = node.attrs as AttachmentAttrs
      const title = normalizeText(attrs.title) || '未命名附件'
      const size = normalizeText(attrs.size)
      const label = size ? `${title} (${size})` : title

      return [
        'a',
        {
          'data-attachment': 'true',
          'data-title': title,
          'data-size': size,
          href: normalizeText(attrs.url) || '#',
          target: '_blank',
          rel: 'noopener noreferrer',
          download: title,
          class: 'prosekit-attachment-card',
        },
        label,
      ]
    },
  }) as AttachmentSpecExtension
}
