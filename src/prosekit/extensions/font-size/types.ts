import type { Extension, Union } from 'prosekit/core'

export type FontSizeAttrs = {
  size: string
}

export type FontSizeSpecExtension = Extension<{
  Marks: {
    fontSize: FontSizeAttrs
  }
}>

export type FontSizeCommandsExtension = Extension<{
  Commands: {
    addFontSize: [attrs: FontSizeAttrs]
    removeFontSize: []
  }
}>

export type FontSizeExtension = Union<
  [FontSizeSpecExtension, FontSizeCommandsExtension]
>
