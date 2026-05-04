import { defineCommands, union, type Extension } from 'prosekit/core'

import { createSetTextStyleCommand, createUnsetTextStyleCommand } from './commands'
import { defineTextStyleExtension } from './extension'
import { defineTextStyleSpec } from './spec'
import type { TextStyleBackgroundColorCommandsExtension } from './types'

export type TextBackgroundColorSpecExtension = Extension<{
  Marks: {
    textStyle: {
      backgroundColor?: string
    }
  }
}>

export function defineTextBackgroundColorSpec(): TextBackgroundColorSpecExtension {
  return defineTextStyleSpec() as TextBackgroundColorSpecExtension
}

export type TextBackgroundColorCommandsExtension =
  TextStyleBackgroundColorCommandsExtension

export function defineTextBackgroundColorCommands(): TextBackgroundColorCommandsExtension {
  return defineCommands({
    setTextBackgroundColor: (value: string) =>
      createSetTextStyleCommand({ backgroundColor: value }),
    unsetTextBackgroundColor: () =>
      createUnsetTextStyleCommand('backgroundColor'),
  }) as TextBackgroundColorCommandsExtension
}

export function defineTextBackgroundColorExtension() {
  return union(defineTextStyleExtension(), defineTextBackgroundColorCommands())
}
