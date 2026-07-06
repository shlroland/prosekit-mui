import { getEmojiNativeById } from '../../extensions/emoji/data'
import { normalizeText } from './utils'

export function renderEmojiText(attrs: Record<string, unknown>) {
  return normalizeText(attrs.native) || getEmojiNativeById(normalizeText(attrs.name))
}
