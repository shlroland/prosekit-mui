import type { Extension, Union } from 'prosekit/core'

export type AiWritingSuggestionRequest = {
  prefix: string
  suffix: string
}

export type AiWritingOptions = {
  minChars?: number
  debounceMs?: number
  onGetSuggestion?: (request: AiWritingSuggestionRequest) => Promise<string> | string
}

export type AiWritingStateSnapshot = {
  enabled: boolean
  hasSuggestion: boolean
  suggestion: string
}

export type AiWritingCommandsExtension = Extension<{
  Commands: {
    setAiWriting: [enabled: boolean]
    toggleAiWriting: []
    acceptAiWriting: []
    clearAiWritingSuggestion: []
  }
}>

export type AiWritingExtension = Union<[Extension, AiWritingCommandsExtension]>
