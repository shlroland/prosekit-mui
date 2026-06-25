import { union } from 'prosekit/core'
import {
  defineCodeBlockPreviewPlugin,
  defineCodeBlockShiki,
  shikiBundledLanguagesInfo,
} from 'prosekit/extensions/code-block'

import { defineCodeBlockNodeView } from './node-view'
import type { CodeBlockExtension, CodeBlockExtensionOptions, CodeBlockLanguageOption } from './types'

const defaultLanguageIds = [
  'text',
  'mermaid',
  'typescript',
  'tsx',
  'javascript',
  'jsx',
  'python',
  'java',
  'go',
  'rust',
  'php',
  'ruby',
  'c',
  'cpp',
  'csharp',
  'kotlin',
  'scala',
  'swift',
  'dart',
  'elixir',
  'erlang',
  'haskell',
  'clojure',
  'lua',
  'perl',
  'r',
  'matlab',
  'json',
  'html',
  'css',
  'markdown',
  'yaml',
  'toml',
  'xml',
  'ini',
  'graphql',
  'http',
  'shellscript',
  'powershell',
  'dockerfile',
  'nginx',
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
    return union(
      shikiExtension,
      defineCodeBlockNodeView(),
    ) as CodeBlockExtension
  }

  return union(
    shikiExtension,
    defineCodeBlockPreviewPlugin(),
    defineCodeBlockNodeView(),
  ) as CodeBlockExtension
}
