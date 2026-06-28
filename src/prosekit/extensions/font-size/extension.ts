import { union } from 'prosekit/core'

import { defineFontSizeCommands } from './commands'
import { defineFontSizeSpec } from './spec'
import type { FontSizeExtension } from './types'

export function defineFontSize(): FontSizeExtension {
  return union(
    defineFontSizeSpec(),
    defineFontSizeCommands(),
  ) as FontSizeExtension
}
