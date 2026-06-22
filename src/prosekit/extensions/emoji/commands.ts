import { defineCommands } from 'prosekit/core'
import type { Command } from 'prosekit/pm/state'

import { getEmojiById } from './data'
import type { EmojiCommandsExtension, EmojiInsertAttrs } from './types'

function insertEmojiNode(attrs: EmojiInsertAttrs): Command {
  return (state, dispatch) => {
    const nodeType = state.schema.nodes.emoji
    const emoji = getEmojiById(attrs.name)

    if (!nodeType || !emoji) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const node = nodeType.create({
      name: emoji.id,
      native: emoji.native,
    })
    const tr = state.tr.replaceSelectionWith(node, false)

    dispatch(tr.scrollIntoView())
    return true
  }
}

export function defineEmojiCommands(): EmojiCommandsExtension {
  return defineCommands({
    insertEmoji: insertEmojiNode,
  }) as EmojiCommandsExtension
}
