import { union } from 'prosekit/core'

import { defineExcalidrawCommands } from './commands'
import { defineExcalidrawNodeView } from './node-view'
import { defineExcalidrawSpec } from './spec'
import type { ExcalidrawExtension, ExcalidrawExtensionOptions } from './types'

export function defineExcalidrawExtension(options: ExcalidrawExtensionOptions = {}): ExcalidrawExtension {
  return union(
    defineExcalidrawSpec(),
    defineExcalidrawCommands(),
    defineExcalidrawNodeView(options),
  ) as ExcalidrawExtension
}
