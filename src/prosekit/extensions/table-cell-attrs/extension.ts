import { union } from 'prosekit/core'

import { defineTableCellAttrs } from './attrs'
import { defineTableCellAttrsCommands } from './commands'

export function defineTableCellAttrsExtension() {
  return union(
    ...defineTableCellAttrs(),
    defineTableCellAttrsCommands(),
  )
}
