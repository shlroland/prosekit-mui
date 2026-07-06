import { shikiBundledLanguagesInfo } from 'prosekit/extensions/code-block'

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

export const defaultCodeBlockTheme = 'github-light'

export const defaultCodeBlockLanguages = [...defaultLanguageIds]

export const defaultCodeBlockLanguageOptions = defaultLanguageIds.map((id) => ({
  id,
  name: id === 'text' ? 'Plain Text' : builtInLanguageMap.get(id) ?? id,
}))
