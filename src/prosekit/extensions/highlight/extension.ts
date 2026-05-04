import { union } from 'prosekit/core'

import { defineHighlightCommands } from './commands'
import { defineHighlightInputRule } from './input-rule'
import { defineHighlightKeymap } from './keymap'
import { defineHighlightPasteRule } from './paste-rule'
import { defineHighlightSpec } from './spec'
import type { HighlightExtension, HighlightOptions } from './types'

export function defineHighlightExtension(
  options: HighlightOptions = {},
): HighlightExtension {
  return union(
    defineHighlightSpec(options),
    defineHighlightCommands(),
    defineHighlightKeymap(),
    defineHighlightInputRule(),
    defineHighlightPasteRule(options),
  ) as HighlightExtension
}
