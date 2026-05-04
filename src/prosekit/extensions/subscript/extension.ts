import { union } from 'prosekit/core'

import { defineSubscriptCommands } from './commands'
import { defineSubscriptKeymap } from './keymap'
import { defineSubscriptSpec } from './spec'
import type { SubscriptExtension } from './types'

export function defineSubscriptExtension(): SubscriptExtension {
  return union(
    defineSubscriptSpec(),
    defineSubscriptCommands(),
    defineSubscriptKeymap(),
  ) as SubscriptExtension
}
