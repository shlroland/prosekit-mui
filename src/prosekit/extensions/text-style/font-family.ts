import { defineCommands, union, type Extension } from 'prosekit/core'

import { createSetTextStyleCommand, createUnsetTextStyleCommand } from './commands'
import { defineTextStyleExtension } from './extension'
import type { TextStyleFontFamilyCommandsExtension } from './types'

export type FontFamilyCommandsExtension = TextStyleFontFamilyCommandsExtension

export function defineFontFamilyCommands(): FontFamilyCommandsExtension {
  return defineCommands({
    setFontFamily: (value: string) => createSetTextStyleCommand({ fontFamily: value }),
    unsetFontFamily: () => createUnsetTextStyleCommand('fontFamily'),
  }) as FontFamilyCommandsExtension
}

export function defineFontFamilyExtension() {
  return union(defineTextStyleExtension(), defineFontFamilyCommands())
}
