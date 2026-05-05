import { InputRule } from 'prosekit/pm/inputrules'
import { defineInputRule } from 'prosekit/extensions/input-rule'

import type { EmojiSyntaxExtension, EmojiSyntaxOptions } from './types'
import { defaultEmojiShortcodes, emojiInputRuleRegex } from './data'

function createEmojiInputRule(shortcodes: Record<string, string>) {
  return new InputRule(emojiInputRuleRegex, (state, match, start, end) => {
    const shortcode = String(match[1] || '').toLowerCase()
    const emoji = shortcodes[shortcode]

    if (!emoji) {
      return null
    }

    return state.tr.replaceWith(start, end, state.schema.text(emoji))
  })
}

export function defineEmojiSyntaxExtension(
  options: EmojiSyntaxOptions = {},
): EmojiSyntaxExtension {
  const shortcodes = {
    ...defaultEmojiShortcodes,
    ...options.emojis,
  }

  return defineInputRule(createEmojiInputRule(shortcodes)) as EmojiSyntaxExtension
}
