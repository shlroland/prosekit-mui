import type { PlainExtension } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'

export type CharacterCountMode = 'textSize' | 'nodeSize'

export type CharacterCountOptions = {
  limit?: number | null
  mode?: CharacterCountMode
  textCounter?: (text: string) => number
  wordCounter?: (text: string) => number
}

export type CharacterCountCharactersOptions = {
  node?: ProseMirrorNode
  mode?: CharacterCountMode
  textCounter?: (text: string) => number
}

export type CharacterCountWordsOptions = {
  node?: ProseMirrorNode
  wordCounter?: (text: string) => number
}

export type CharacterCountState = {
  characters: number
  words: number
  limit: number | null
  remaining: number | null
  isAtLimit: boolean
  isOverLimit: boolean
}

export type CharacterCountExtension = PlainExtension
