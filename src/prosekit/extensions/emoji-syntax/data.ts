import emojiMartData from '@emoji-mart/data'
import { init, SearchIndex } from 'emoji-mart/dist/module.js'

export type EmojiMartDataSet = {
  aliases?: Record<string, string>
  emojis?: Record<string, EmojiMartEmojiRecord>
}

export type EmojiMartEmojiRecord = {
  id: string
  name: string
  keywords?: string[]
  shortcodes?: string
  emoticons?: string[]
  skins?: Array<{
    native?: string
  }>
}

export type EmojiSearchItem = {
  id: string
  name: string
  emoji: string
  shortcodes: string[]
  keywords: string[]
}

export const emojiAutocompleteRegex = /:([a-z0-9_+-]*)$/i

export const emojiInputRuleRegex = /:([a-z0-9_+-]+):$/i

export const emojiPickerData = emojiMartData as EmojiMartDataSet

let emojiMartInitPromise: Promise<void> | null = null

function getEmojiShortcodes(value: string | undefined, fallbackId: string): string[] {
  if (!value) {
    return [fallbackId]
  }

  return value
    .split(':')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getEmojiNative(record: EmojiMartEmojiRecord): string | null {
  const value = record.skins?.[0]?.native
  return typeof value === 'string' && value.length > 0 ? value : null
}

function createEmojiShortcodeMap(data: EmojiMartDataSet): Record<string, string> {
  const output: Record<string, string> = {}

  for (const record of Object.values(data.emojis ?? {})) {
    const native = getEmojiNative(record)

    if (!native) {
      continue
    }

    for (const shortcode of getEmojiShortcodes(record.shortcodes, record.id)) {
      output[shortcode] = native
    }

    output[record.id] = native
  }

  for (const [alias, targetId] of Object.entries(data.aliases ?? {})) {
    const native = output[targetId]

    if (native) {
      output[alias] = native
    }
  }

  return output
}

function toEmojiSearchItem(record: EmojiMartEmojiRecord): EmojiSearchItem | null {
  const emoji = getEmojiNative(record)

  if (!emoji) {
    return null
  }

  return {
    id: record.id,
    name: record.name,
    emoji,
    shortcodes: getEmojiShortcodes(record.shortcodes, record.id),
    keywords: record.keywords ?? [],
  }
}

export const defaultEmojiShortcodes = createEmojiShortcodeMap(emojiPickerData)

const popularEmojiIds = [
  'grinning',
  'smile',
  'joy',
  'heart_eyes',
  'thinking_face',
  'sob',
  '+1',
  'pray',
  'fire',
  'sparkles',
  'rocket',
  'tada',
] as const

export const defaultEmojiSuggestions = popularEmojiIds
  .map((id) => emojiPickerData.emojis?.[id])
  .map((record) => (record ? toEmojiSearchItem(record) : null))
  .filter((record): record is EmojiSearchItem => Boolean(record))

export function initializeEmojiMart() {
  if (!emojiMartInitPromise) {
    emojiMartInitPromise = init({ data: emojiPickerData }).then(() => undefined)
  }

  return emojiMartInitPromise
}

export async function searchEmojis(
  query: string,
  maxResults = 8,
): Promise<EmojiSearchItem[]> {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return defaultEmojiSuggestions.slice(0, maxResults)
  }

  await initializeEmojiMart()

  const result = await SearchIndex.search(normalizedQuery, {
    maxResults,
    caller: 'prosekit-mui',
  }) as EmojiMartEmojiRecord[]

  return result
    .map((entry: EmojiMartEmojiRecord) => toEmojiSearchItem(entry))
    .filter((entry): entry is EmojiSearchItem => Boolean(entry))
}
