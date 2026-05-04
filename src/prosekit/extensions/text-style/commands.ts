import { defineCommands } from 'prosekit/core'

import type {
  TextStyleAttrKey,
  TextStyleAttrs,
  TextStyleCommandsExtension,
} from './types'
import {
  normalizeTextStyleAttrs,
} from './utils'
import {
  createRemoveEmptyMarkCommand,
  createSetMarkAttrsCommand,
  createUnsetMarkAttrsCommand,
} from '../shared/mark-attrs'

export function createSetTextStyleCommand(attrs: Partial<TextStyleAttrs>) {
  return createSetMarkAttrsCommand<TextStyleAttrs>(
    'textStyle',
    normalizeTextStyleAttrs(attrs),
  )
}

export function createUnsetTextStyleCommand(
  keys: TextStyleAttrKey | TextStyleAttrKey[],
) {
  return createUnsetMarkAttrsCommand<TextStyleAttrs>('textStyle', keys)
}

export function defineTextStyleCommands(): TextStyleCommandsExtension {
  return defineCommands({
    setTextStyle: (attrs: Partial<TextStyleAttrs>) =>
      createSetTextStyleCommand(attrs),
    unsetTextStyle: (keys: TextStyleAttrKey | TextStyleAttrKey[]) =>
      createUnsetTextStyleCommand(keys),
    removeEmptyTextStyle: () => createRemoveEmptyMarkCommand<TextStyleAttrs>('textStyle'),
  }) as TextStyleCommandsExtension
}
