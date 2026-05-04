import { defineCommands, union, type Extension } from 'prosekit/core'

import { createSetTextStyleCommand, createUnsetTextStyleCommand } from './commands'
import { defineTextStyleExtension } from './extension'
import { defineTextStyleSpec } from './spec'
import type { TextStyleFontSizeCommandsExtension } from './types'

export type FontSizeSpecExtension = Extension<{
  Marks: {
    textStyle: {
      fontSize?: string
    }
  }
}>

export function defineFontSizeSpec(): FontSizeSpecExtension {
  return defineTextStyleSpec() as FontSizeSpecExtension
}

export type FontSizeCommandsExtension = TextStyleFontSizeCommandsExtension

export function defineFontSizeCommands(): FontSizeCommandsExtension {
  return defineCommands({
    setFontSize: (value: string | number) =>
      createSetTextStyleCommand({
        fontSize: typeof value === 'number' ? `${value}px` : value,
      }),
    unsetFontSize: () => createUnsetTextStyleCommand('fontSize'),
  }) as FontSizeCommandsExtension
}

export function defineFontSizeExtension() {
  return union(defineTextStyleExtension(), defineFontSizeCommands())
}
