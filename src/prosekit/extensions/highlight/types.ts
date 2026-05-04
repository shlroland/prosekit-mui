import type { Extension, Union } from 'prosekit/core'

export type HighlightAttrs = {
  color?: string
}

export type HighlightOptions = {
  multicolor?: boolean
}

export type HighlightSpecExtension = Extension<{
  Marks: {
    highlight: HighlightAttrs
  }
}>

export type HighlightCommandsExtension = Extension<{
  Commands: {
    setHighlight: [HighlightAttrs?]
    toggleHighlight: [HighlightAttrs?]
    unsetHighlight: []
  }
}>

export type HighlightExtension = Union<[HighlightSpecExtension, HighlightCommandsExtension]>
