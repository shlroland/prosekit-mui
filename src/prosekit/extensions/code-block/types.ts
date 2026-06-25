import type { Extension } from 'prosekit/core'
import type { CodeBlockShikiOptions } from 'prosekit/extensions/code-block'

export type CodeBlockLanguageOption = {
  id: string
  name: string
}

export type CodeBlockExtensionOptions = CodeBlockShikiOptions & {
  enablePreview?: boolean
}

export type CodeBlockExtension = Extension
