import type { Extension } from 'prosekit/core'
import type { CodeBlockShikiOptions } from 'prosekit/extensions/code-block'

export type CodeBlockLanguageOption = {
  id: string
  name: string
}

export type CodeBlockExtensionOptions = CodeBlockShikiOptions & {
  enablePreview?: boolean
  mermaidTemplate?: string
}

export type CodeBlockCommandsExtension = Extension<{
  Commands: {
    insertMermaidCodeBlock: [source?: string]
    setMermaidCodeBlock: [source?: string]
  }
}>

export type CodeBlockExtension = Extension
