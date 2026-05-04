import { defineCommands, union, type Extension } from 'prosekit/core'

import { createSetTextStyleCommand, createUnsetTextStyleCommand } from './commands'
import { defineTextStyleExtension } from './extension'
import { defineTextStyleSpec } from './spec'
import type { TextStyleColorCommandsExtension } from './types'

export type TextColorSpecExtension = Extension<{
  Marks: {
    textStyle: {
      color?: string
    }
  }
}>

export function defineTextColorSpec(): TextColorSpecExtension {
  return defineTextStyleSpec() as TextColorSpecExtension
}

export type TextColorCommandsExtension = TextStyleColorCommandsExtension

export function defineTextColorCommands(): TextColorCommandsExtension {
  return defineCommands({
    setTextColor: (value: string) => createSetTextStyleCommand({ color: value }),
    unsetTextColor: () => createUnsetTextStyleCommand('color'),
  }) as TextColorCommandsExtension
}

export function defineTextColorExtension() {
  return union(defineTextStyleExtension(), defineTextColorCommands())
}
