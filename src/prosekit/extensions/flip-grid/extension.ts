import { union } from 'prosekit/core'

import { defineFlipGridCommands } from './commands'
import { defineFlipGridNodeView } from './node-view'
import { defineFlipGridSpec } from './spec'
import type { FlipGridExtension } from './types'

export function defineFlipGridExtension(): FlipGridExtension {
  return union(
    defineFlipGridSpec(),
    defineFlipGridCommands(),
    ...defineFlipGridNodeView(),
  ) as FlipGridExtension
}
