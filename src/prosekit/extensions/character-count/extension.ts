import { definePlugin } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import { PluginKey, ProseMirrorPlugin, type Transaction } from 'prosekit/pm/state'

import type {
  CharacterCountCharactersOptions,
  CharacterCountExtension,
  CharacterCountMode,
  CharacterCountOptions,
  CharacterCountState,
  CharacterCountWordsOptions,
} from './types'

const defaultCharacterCountOptions = {
  limit: null,
  mode: 'textSize',
  textCounter: (text: string) => text.length,
  wordCounter: (text: string) => text.trim().split(/\s+/).filter(Boolean).length,
} satisfies Required<CharacterCountOptions>

export const characterCountPluginKey = new PluginKey<CharacterCountState>(
  'prosekit-character-count',
)

function resolveCharacterCountOptions(
  options: CharacterCountOptions = {},
): Required<CharacterCountOptions> {
  return {
    limit: options.limit ?? defaultCharacterCountOptions.limit,
    mode: options.mode ?? defaultCharacterCountOptions.mode,
    textCounter: options.textCounter ?? defaultCharacterCountOptions.textCounter,
    wordCounter: options.wordCounter ?? defaultCharacterCountOptions.wordCounter,
  }
}

function getText(node: ProseMirrorNode, blockSeparator?: string): string {
  return node.textBetween(0, node.content.size, blockSeparator, ' ')
}

export function countCharacters(
  node: ProseMirrorNode,
  options: CharacterCountOptions = {},
): number {
  const resolvedOptions = resolveCharacterCountOptions(options)

  if (resolvedOptions.mode === 'nodeSize') {
    return node.nodeSize
  }

  return resolvedOptions.textCounter(getText(node))
}

export function countWords(
  node: ProseMirrorNode,
  options: Pick<CharacterCountOptions, 'wordCounter'> = {},
): number {
  const wordCounter = options.wordCounter ?? defaultCharacterCountOptions.wordCounter

  return wordCounter(getText(node, ' '))
}

function createCharacterCountState(
  doc: ProseMirrorNode,
  options: CharacterCountOptions = {},
): CharacterCountState {
  const resolvedOptions = resolveCharacterCountOptions(options)
  const characters = countCharacters(doc, resolvedOptions)
  const words = countWords(doc, resolvedOptions)
  const limit = resolvedOptions.limit
  const remaining = typeof limit === 'number' ? limit - characters : null

  return {
    characters,
    words,
    limit,
    remaining,
    isAtLimit: typeof limit === 'number' && characters >= limit,
    isOverLimit: typeof limit === 'number' && characters > limit,
  }
}

function isPasteTransaction(transaction: Transaction): boolean {
  return Boolean(transaction.getMeta('paste'))
}

function isLimitConfigured(limit: number | null): limit is number {
  return typeof limit === 'number' && Number.isFinite(limit)
}

function shouldAllowOversizedTransaction(
  oldSize: number,
  newSize: number,
  limit: number,
): boolean {
  return oldSize > limit && newSize > limit && newSize <= oldSize
}

export function getCharacterCountState(
  state: Parameters<typeof characterCountPluginKey.getState>[0],
): CharacterCountState {
  return characterCountPluginKey.getState(state) ?? createCharacterCountState(state.doc)
}

export function getCharacterCount(
  state: Parameters<typeof characterCountPluginKey.getState>[0],
  options: CharacterCountCharactersOptions = {},
): number {
  return countCharacters(options.node ?? state.doc, options)
}

export function getWordCount(
  state: Parameters<typeof characterCountPluginKey.getState>[0],
  options: CharacterCountWordsOptions = {},
): number {
  return countWords(options.node ?? state.doc, options)
}

export function defineCharacterCountExtension(
  options: CharacterCountOptions = {},
): CharacterCountExtension {
  const resolvedOptions = resolveCharacterCountOptions(options)

  return definePlugin(
    () =>
      new ProseMirrorPlugin<CharacterCountState>({
        key: characterCountPluginKey,
        state: {
          init: (_, state) => createCharacterCountState(state.doc, resolvedOptions),
          apply: (tr, pluginState, _oldState, newState) => {
            if (!tr.docChanged) {
              return pluginState
            }

            return createCharacterCountState(newState.doc, resolvedOptions)
          },
        },
        filterTransaction: (transaction, state) => {
          const limit = resolvedOptions.limit

          if (!transaction.docChanged || !isLimitConfigured(limit)) {
            return true
          }

          const oldSize = countCharacters(state.doc, resolvedOptions)
          const newSize = countCharacters(transaction.doc, resolvedOptions)

          if (newSize <= limit || shouldAllowOversizedTransaction(oldSize, newSize, limit)) {
            return true
          }

          if (!isPasteTransaction(transaction)) {
            return false
          }

          const overLimit = newSize - limit
          const to = transaction.selection.$head.pos
          const from = Math.max(0, to - overLimit)

          transaction.deleteRange(from, to)

          return countCharacters(transaction.doc, resolvedOptions) <= limit
        },
      }),
  )
}
