import { defineNodeSpec } from 'prosekit/core'

import type { ExcalidrawSpecExtension } from './types'

export function defineExcalidrawSpec(): ExcalidrawSpecExtension {
  return defineNodeSpec<'excalidraw', Record<string, never>>({
    name: 'excalidraw',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,
    isolating: true,
    defining: true,
    parseDOM: [
      {
        tag: 'figure[data-type="excalidraw"]',
      },
    ],
    toDOM: () => {
      return ['figure', { 'data-type': 'excalidraw' }]
    },
  }) as ExcalidrawSpecExtension
}
