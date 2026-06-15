import { union } from 'prosekit/core'

import { defineTableCellVerticalAlignAttrs } from './attrs'
import { defineTableCellVerticalAlignCommands } from './commands'

export function defineTableCellVerticalAlignExtension() {
  return union(
    ...defineTableCellVerticalAlignAttrs(),
    defineTableCellVerticalAlignCommands(),
  )
}
