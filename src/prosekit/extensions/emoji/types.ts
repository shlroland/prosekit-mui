import type { Extension, Union } from 'prosekit/core'

export type EmojiAttrs = {
  name?: string | null
  native?: string | null
}

export type EmojiInsertAttrs = {
  name: string
}

export type EmojiSpecExtension = Extension<{
  Nodes: {
    emoji: EmojiAttrs
  }
}>

export type EmojiCommandsExtension = Extension<{
  Commands: {
    insertEmoji: [attrs: EmojiInsertAttrs]
  }
}>

export type EmojiExtension = Union<
  [EmojiSpecExtension, EmojiCommandsExtension]
>
