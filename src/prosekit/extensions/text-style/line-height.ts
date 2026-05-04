import { defineCommands, union, type Extension } from 'prosekit/core'

import { createSetTextStyleCommand, createUnsetTextStyleCommand } from './commands'
import { defineTextStyleExtension } from './extension'
import type { TextStyleLineHeightCommandsExtension } from './types'

export type LineHeightCommandsExtension = TextStyleLineHeightCommandsExtension

export function defineLineHeightCommands(): LineHeightCommandsExtension {
  return defineCommands({
    setLineHeight: (value: string | number) =>
      createSetTextStyleCommand({ lineHeight: String(value) }),
    unsetLineHeight: () => createUnsetTextStyleCommand('lineHeight'),
  }) as LineHeightCommandsExtension
}

export function defineLineHeightExtension() {
  return union(defineTextStyleExtension(), defineLineHeightCommands())
}
