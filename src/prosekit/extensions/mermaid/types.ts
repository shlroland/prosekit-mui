import type { Extension } from 'prosekit/core'

export type MermaidExtensionOptions = {
  defaultSource?: string
}

export type MermaidCommandsExtension = Extension<{
  Commands: {
    insertMermaidCodeBlock: [source?: string]
    setMermaidCodeBlock: [source?: string]
  }
}>

export type MermaidExtension = Extension
