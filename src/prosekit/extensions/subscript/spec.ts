import { defineMarkSpec } from 'prosekit/core'

import type { SubscriptSpecExtension } from './types'

export function defineSubscriptSpec(): SubscriptSpecExtension {
  return defineMarkSpec<'subscript'>({
    name: 'subscript',
    parseDOM: [{ tag: 'sub' }],
    toDOM: () => ['sub', 0],
  })
}
