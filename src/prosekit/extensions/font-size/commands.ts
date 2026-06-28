import { addMark, defineCommands, removeMark } from 'prosekit/core'
import type { Command } from 'prosekit/pm/state'

import type { FontSizeAttrs, FontSizeCommandsExtension } from './types'

export function addFontSize(attrs: FontSizeAttrs): Command {
  return addMark({ type: 'fontSize', attrs })
}

export function removeFontSize(): Command {
  return removeMark({ type: 'fontSize' })
}

export function defineFontSizeCommands(): FontSizeCommandsExtension {
  return defineCommands({
    addFontSize,
    removeFontSize,
  }) as FontSizeCommandsExtension
}
