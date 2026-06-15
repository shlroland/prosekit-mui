import { union } from 'prosekit/core'

import { defineMediaCommands } from './commands'
import { defineMediaNodeView } from './node-view'
import { defineMediaSpec } from './spec'
import type { MediaExtension } from './types'

import './view.css'

export function defineMediaExtension(): MediaExtension {
  return union(
    defineMediaSpec(),
    defineMediaCommands(),
    ...defineMediaNodeView(),
  ) as MediaExtension
}
