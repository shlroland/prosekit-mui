import { union } from 'prosekit/core'

import { defineSuperscriptCommands } from './commands'
import { defineSuperscriptKeymap } from './keymap'
import { defineSuperscriptSpec } from './spec'
import type { SuperscriptExtension } from './types'

export function defineSuperscriptExtension(): SuperscriptExtension {
  return union(
    defineSuperscriptSpec(),
    defineSuperscriptCommands(),
    defineSuperscriptKeymap(),
  ) as SuperscriptExtension
}
