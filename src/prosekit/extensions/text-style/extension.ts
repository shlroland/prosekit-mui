import { union } from 'prosekit/core'

import { defineFontFamilyCommands } from './font-family'
import { defineFontSizeCommands } from './font-size'
import { defineTextStyleKeymap } from './keymap'
import { defineLineHeightCommands } from './line-height'
import { defineTextStyleCommands } from './commands'
import { defineTextStyleSpec } from './spec'
import { defineTextBackgroundColorCommands } from './text-background-color'
import { defineTextColorCommands } from './text-color'
import { defineVerticalAlignCommands } from './vertical-align'
import type { TextStyleExtension, TextStyleExtensionOptions } from './types'

const defaultTextStyleFeatures = {
  color: true,
  backgroundColor: true,
  fontSize: true,
  fontFamily: true,
  lineHeight: true,
  verticalAlign: true,
} as const

export function defineTextStyleExtension(
  options: TextStyleExtensionOptions = {},
): TextStyleExtension {
  const features = {
    ...defaultTextStyleFeatures,
    ...options.features,
  }

  return union(
    defineTextStyleSpec(),
    defineTextStyleCommands(),
    defineTextStyleKeymap(),
    ...(features.color ? [defineTextColorCommands()] : []),
    ...(features.backgroundColor ? [defineTextBackgroundColorCommands()] : []),
    ...(features.fontSize ? [defineFontSizeCommands()] : []),
    ...(features.fontFamily ? [defineFontFamilyCommands()] : []),
    ...(features.lineHeight ? [defineLineHeightCommands()] : []),
    ...(features.verticalAlign ? [defineVerticalAlignCommands()] : []),
  ) as TextStyleExtension
}
