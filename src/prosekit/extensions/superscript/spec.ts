import { defineMarkSpec } from 'prosekit/core'

import type { SuperscriptSpecExtension } from './types'

export function defineSuperscriptSpec(): SuperscriptSpecExtension {
  return defineMarkSpec<'superscript'>({
    name: 'superscript',
    parseDOM: [{ tag: 'sup' }],
    toDOM: () => ['sup', 0],
  })
}
