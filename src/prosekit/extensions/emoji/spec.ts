import { defineNodeSpec } from 'prosekit/core'

import type { EmojiAttrs, EmojiSpecExtension } from './types'
import { getEmojiByNative, getEmojiNativeById } from './data'

function normalizeName(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function defineEmojiSpec(): EmojiSpecExtension {
  return defineNodeSpec<'emoji', EmojiAttrs>({
    name: 'emoji',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    draggable: false,
    attrs: {
      name: { default: '', validate: 'string' },
      native: { default: '', validate: 'string' },
    },
    parseDOM: [
      {
        tag: 'span[data-type="emoji"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) {
            return false
          }

          const native = dom.textContent?.trim() || dom.getAttribute('data-emoji') || ''
          const name = dom.getAttribute('data-name') || getEmojiByNative(native)?.id || ''

          return {
            name,
            native: native || getEmojiNativeById(name),
          }
        },
      },
    ],
    toDOM: (node) => {
      const attrs = node.attrs as EmojiAttrs
      const name = normalizeName(attrs.name)
      const native = normalizeName(attrs.native) || getEmojiNativeById(name)

      return ['span', {
        'data-type': 'emoji',
        'data-name': name,
        'data-emoji': native,
      }, native]
    },
  }) as EmojiSpecExtension
}
