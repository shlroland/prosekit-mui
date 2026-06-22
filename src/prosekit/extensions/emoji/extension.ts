import { union } from 'prosekit/core'

import { defineEmojiCommands } from './commands'
import { defineEmojiSpec } from './spec'
import type { EmojiExtension } from './types'

import './view.css'

export function defineEmojiExtension(): EmojiExtension {
  return union(
    defineEmojiSpec(),
    defineEmojiCommands(),
  ) as EmojiExtension
}
