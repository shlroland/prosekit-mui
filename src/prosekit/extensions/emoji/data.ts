import emojiMartData, { type EmojiMartData } from '@emoji-mart/data'

export type EmojiItem = {
  id: string
  name: string
  native: string
  keywords: string[]
  shortcodes: string[]
}

export type EmojiCategory = {
  id: string
  label: string
  items: EmojiItem[]
}

const CATEGORY_LABELS: Record<string, string> = {
  people: '表情',
  nature: '自然',
  foods: '食物',
  activity: '活动',
  places: '旅行',
  objects: '物品',
  symbols: '符号',
  flags: '旗帜',
}

const data = emojiMartData as EmojiMartData

function getEmojiNative(id: string) {
  return data.emojis[id]?.skins[0]?.native ?? ''
}

function normalizeWords(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean).map((value) => value!.toLowerCase())))
}

export const emojiItems: EmojiItem[] = Object.values(data.emojis).map((emoji) => {
  const aliases = Object.entries(data.aliases)
    .filter(([, id]) => id === emoji.id)
    .map(([alias]) => alias)
  const shortcodes = normalizeWords([emoji.id, ...aliases])

  return {
    id: emoji.id,
    name: emoji.name,
    native: emoji.skins[0]?.native ?? '',
    keywords: normalizeWords([emoji.name, ...emoji.keywords, ...shortcodes]),
    shortcodes,
  }
}).filter((item) => item.native)

export const emojiCategories: EmojiCategory[] = data.categories.map((category) => {
  const items = category.emojis
    .map((id) => emojiItems.find((item) => item.id === id))
    .filter((item): item is EmojiItem => Boolean(item))

  return {
    id: category.id,
    label: CATEGORY_LABELS[category.id] ?? category.id,
    items,
  }
}).filter((category) => category.items.length > 0)

export function getEmojiById(id: string) {
  return emojiItems.find((item) => item.id === id) ?? null
}

export function getEmojiByNative(native: string) {
  return emojiItems.find((item) => item.native === native) ?? null
}

export function getEmojiNativeById(id: string) {
  return getEmojiNative(id) || getEmojiById(id)?.native || ''
}

export function searchEmojis(query: string, limit = 100) {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return emojiItems.slice(0, limit)
  }

  return emojiItems
    .map((item) => {
      const terms = [...item.shortcodes, ...item.keywords]
      const exact = terms.some((term) => term === normalizedQuery)
      const startsWith = terms.some((term) => term.startsWith(normalizedQuery))
      const includes = terms.some((term) => term.includes(normalizedQuery))
      const score = exact ? 3 : startsWith ? 2 : includes ? 1 : 0

      return { item, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
    .slice(0, limit)
}
