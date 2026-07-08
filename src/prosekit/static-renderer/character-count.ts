import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'

import {
  countCharacters,
  countWords,
  type CharacterCountMode,
  type CharacterCountState,
} from '../extensions/character-count'

export type StaticCharacterCountContent = NodeJSON | ProseMirrorNode

export type StaticCharacterCountOptions = {
  limit?: number | null
  mode?: CharacterCountMode
  textCounter?: (text: string) => number
  wordCounter?: (text: string) => number
}

const defaultStaticCharacterCountOptions = {
  limit: null,
  mode: 'textSize',
  textCounter: (text: string) => text.length,
  wordCounter: (text: string) => text.trim().split(/\s+/).filter(Boolean).length,
} satisfies Required<StaticCharacterCountOptions>

const inlineNodeTypes = new Set([
  'text',
  'hardBreak',
  'emoji',
  'inlineAttachment',
  'inlineLink',
  'mathInline',
  'diffInline',
  'diffDeleteInline',
])

const containerNodeTypes = new Set([
  'doc',
  'paragraph',
  'heading',
  'codeBlock',
  'blockquote',
  'bulletList',
  'orderedList',
  'list',
  'listItem',
  'taskItem',
  'details',
  'detailsSummary',
  'detailsContent',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'alert',
  'flipGrid',
  'flipGridColumn',
  'mathBlock',
  'diffBlock',
])

const leafTextNodeTypes = new Set([
  'emoji',
  'inlineAttachment',
  'inlineLink',
  'blockAttachment',
  'blockLink',
  'image',
  'excalidraw',
  'diffDeleteInline',
  'diffDeleteBlock',
])

function isProseMirrorNode(content: StaticCharacterCountContent): content is ProseMirrorNode {
  return typeof (content as ProseMirrorNode).textBetween === 'function'
}

function resolveStaticCharacterCountOptions(
  options: StaticCharacterCountOptions = {},
): Required<StaticCharacterCountOptions> {
  return {
    limit: options.limit ?? defaultStaticCharacterCountOptions.limit,
    mode: options.mode ?? defaultStaticCharacterCountOptions.mode,
    textCounter: options.textCounter ?? defaultStaticCharacterCountOptions.textCounter,
    wordCounter: options.wordCounter ?? defaultStaticCharacterCountOptions.wordCounter,
  }
}

function isInlineNode(node: NodeJSON): boolean {
  return inlineNodeTypes.has(node.type) || node.type.startsWith('inline')
}

function isContainerNode(node: NodeJSON): boolean {
  return containerNodeTypes.has(node.type)
}

function getLeafText(node: NodeJSON): string {
  if (node.type === 'hardBreak') {
    return '\n'
  }

  return leafTextNodeTypes.has(node.type) ? ' ' : ''
}

function getChildSeparator(
  previous: NodeJSON | undefined,
  next: NodeJSON,
  blockSeparator: string,
): string {
  if (!previous || !blockSeparator) {
    return ''
  }

  return isInlineNode(previous) && isInlineNode(next) ? '' : blockSeparator
}

function getStaticTextFromNodeJSON(
  node: NodeJSON,
  blockSeparator = '',
): string {
  if (node.type === 'text') {
    return typeof node.text === 'string' ? node.text : ''
  }

  if (!node.content?.length) {
    return getLeafText(node)
  }

  return node.content.reduce((text, child, index) => {
    return [
      text,
      getChildSeparator(node.content?.[index - 1], child, blockSeparator),
      getStaticTextFromNodeJSON(child, blockSeparator),
    ].join('')
  }, '')
}

function getStaticNodeSize(node: NodeJSON): number {
  if (node.type === 'text') {
    return typeof node.text === 'string' ? node.text.length : 0
  }

  if (node.content?.length || isContainerNode(node)) {
    return (node.content ?? []).reduce((size, child) => size + getStaticNodeSize(child), 2)
  }

  return 1
}

export function getStaticCharacterCountText(
  content: StaticCharacterCountContent,
  blockSeparator = '',
): string {
  if (isProseMirrorNode(content)) {
    return content.textBetween(0, content.content.size, blockSeparator, ' ')
  }

  return getStaticTextFromNodeJSON(content, blockSeparator)
}

export function countStaticCharacters(
  content: StaticCharacterCountContent,
  options: StaticCharacterCountOptions = {},
): number {
  if (isProseMirrorNode(content)) {
    return countCharacters(content, options)
  }

  const resolvedOptions = resolveStaticCharacterCountOptions(options)

  if (resolvedOptions.mode === 'nodeSize') {
    return getStaticNodeSize(content)
  }

  return resolvedOptions.textCounter(getStaticCharacterCountText(content))
}

export function countStaticWords(
  content: StaticCharacterCountContent,
  options: Pick<StaticCharacterCountOptions, 'wordCounter'> = {},
): number {
  if (isProseMirrorNode(content)) {
    return countWords(content, options)
  }

  const wordCounter = options.wordCounter ?? defaultStaticCharacterCountOptions.wordCounter

  return wordCounter(getStaticCharacterCountText(content, ' '))
}

export function getStaticCharacterCountState(
  content: StaticCharacterCountContent,
  options: StaticCharacterCountOptions = {},
): CharacterCountState {
  const resolvedOptions = resolveStaticCharacterCountOptions(options)
  const characters = countStaticCharacters(content, resolvedOptions)
  const words = countStaticWords(content, resolvedOptions)
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
