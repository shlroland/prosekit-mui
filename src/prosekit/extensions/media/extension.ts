import { union } from 'prosekit/core'

import { defineMediaCommands } from './commands'
import { defineMediaNodeView } from './node-view'
import { defineMediaSpec } from './spec'
import type { MediaExtension, MediaExtensionOptions } from './types'

import './view.css'

export function defineMediaExtension(options: MediaExtensionOptions = {}): MediaExtension {
  return union(
    defineMediaSpec(),
    defineMediaCommands(),
    ...defineMediaNodeView(options),
  ) as MediaExtension
}
