import { defineCommands, union, type Extension } from 'prosekit/core'

import {
  createSetTextStyleCommand,
  createUnsetTextStyleCommand,
} from './commands'
import { defineTextStyleExtension } from './extension'
import { defineTextStyleSpec } from './spec'
import type { TextStyleVerticalAlignCommandsExtension } from './types'
import {
  getActiveTextStyleAttrs,
  isVerticalAlignValue,
  type VerticalAlignValue,
} from './utils'

export type VerticalAlignSpecExtension = Extension<{
  Marks: {
    textStyle: {
      verticalAlign?: string
    }
  }
}>

export function defineVerticalAlignSpec(): VerticalAlignSpecExtension {
  return defineTextStyleSpec() as VerticalAlignSpecExtension
}

export type VerticalAlignCommandsExtension = TextStyleVerticalAlignCommandsExtension

export function defineVerticalAlignCommands(): VerticalAlignCommandsExtension {
  return defineCommands({
    setVerticalAlign: (value: string) => {
      if (!isVerticalAlignValue(value)) {
        return () => false
      }

      return createSetTextStyleCommand({
        verticalAlign: value,
      })
    },
    unsetVerticalAlign: () => createUnsetTextStyleCommand('verticalAlign'),
    toggleVerticalAlign: (value: string) => {
      if (!isVerticalAlignValue(value)) {
        return () => false
      }

      return (state, dispatch) => {
        const activeValue = getActiveTextStyleAttrs(state).verticalAlign

        if (activeValue === value) {
          return createUnsetTextStyleCommand('verticalAlign')(state, dispatch)
        }

        return createSetTextStyleCommand({
          verticalAlign: value as VerticalAlignValue,
        })(state, dispatch)
      }
    },
  }) as VerticalAlignCommandsExtension
}

export function defineVerticalAlignExtension() {
  return union(defineTextStyleExtension(), defineVerticalAlignCommands())
}
