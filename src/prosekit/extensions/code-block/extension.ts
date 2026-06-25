import { union } from 'prosekit/core'
import {
  defineCodeBlockPreviewPlugin,
  defineCodeBlockShiki,
  shikiBundledLanguagesInfo,
} from 'prosekit/extensions/code-block'

import type { CodeBlockExtension, CodeBlockExtensionOptions, CodeBlockLanguageOption } from './types'

const defaultLanguageIds = [
  'text',
  'typescript',
  'tsx',
  'javascript',
  'jsx',
  'json',
  'html',
  'css',
  'markdown',
  'yaml',
  'shellscript',
  'sql',
  'diff',
] as const

const builtInLanguageMap = new Map(
  shikiBundledLanguagesInfo.map((item) => [item.id, item.name] as const),
)

export const defaultCodeBlockLanguages = [...defaultLanguageIds]

export const defaultCodeBlockLanguageOptions: CodeBlockLanguageOption[] = defaultLanguageIds.map((id) => ({
  id,
  name: id === 'text' ? 'Plain Text' : builtInLanguageMap.get(id) ?? id,
}))

export function defineCodeBlockExtension(
  options: CodeBlockExtensionOptions = {},
): CodeBlockExtension {
  const {
    enablePreview,
    themes,
    langs,
    nodeTypes,
    engine,
    ...rest
  } = options

  const shikiExtension = defineCodeBlockShiki({
    themes: themes ?? ['github-light'],
    langs: langs ?? defaultCodeBlockLanguages,
    nodeTypes: nodeTypes ?? ['codeBlock'],
    engine,
    ...rest,
  })

  if (enablePreview === false) {
    return shikiExtension
  }

  return union(
    shikiExtension,
    defineCodeBlockPreviewPlugin(),
  ) as CodeBlockExtension
}
