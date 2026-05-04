import { defineKeymap } from 'prosekit/core'

import {
  createSetTextAlignCommand,
  createToggleTextAlignCommand,
} from './commands'
import type { TextAlignOptions } from './types'

export function defineTextAlignKeymap(options: Required<TextAlignOptions>) {
  return defineKeymap({
    'Mod-Shift-l':
      options.alignments.includes('left')
        ? options.defaultAlignment === 'left'
          ? createToggleTextAlignCommand('left', options)
          : createSetTextAlignCommand('left', options)
        : () => false,
    'Mod-Shift-e': options.alignments.includes('center')
      ? createToggleTextAlignCommand('center', options)
      : () => false,
    'Mod-Shift-r': options.alignments.includes('right')
      ? createToggleTextAlignCommand('right', options)
      : () => false,
    'Mod-Shift-j': options.alignments.includes('justify')
      ? createToggleTextAlignCommand('justify', options)
      : () => false,
  })
}
