import { defineNodeAttr, union } from 'prosekit/core'

import {
  defineTextAlignCommands,
} from './commands'
import { defineTextAlignKeymap } from './keymap'
import type {
  TextAlignExtension,
  TextAlignOptions,
  TextAlignValue,
} from './types'

const defaultTextAlignOptions: Required<TextAlignOptions> = {
  types: ['paragraph', 'heading'],
  alignments: ['left', 'center', 'right', 'justify'],
  defaultAlignment: 'left',
}

export function defineTextAlignExtension(
  options: TextAlignOptions = {},
): TextAlignExtension {
  const resolvedOptions: Required<TextAlignOptions> = {
    ...defaultTextAlignOptions,
    ...options,
    types: options.types ?? defaultTextAlignOptions.types,
    alignments: options.alignments ?? defaultTextAlignOptions.alignments,
    defaultAlignment: options.defaultAlignment ?? defaultTextAlignOptions.defaultAlignment,
  }

  return union(
    ...resolvedOptions.types.map((type) =>
      defineNodeAttr({
        type,
        attr: 'textAlign',
        default: resolvedOptions.defaultAlignment,
        splittable: true,
        parseDOM: (node) => {
          const value = node.style.textAlign
          return resolvedOptions.alignments.includes(value as TextAlignValue)
            ? (value as TextAlignValue)
            : resolvedOptions.defaultAlignment
        },
        toDOM: (value) => {
          const style =
            !value || value === resolvedOptions.defaultAlignment
              ? null
              : `text-align:${value}`

          return style ? ['style', style] : null
        },
      }),
    ),
    defineTextAlignCommands(resolvedOptions),
    defineTextAlignKeymap(resolvedOptions),
  ) as TextAlignExtension
}
