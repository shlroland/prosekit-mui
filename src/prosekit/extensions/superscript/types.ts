import type { Extension } from 'prosekit/core'

export type SuperscriptSpecExtension = Extension<{
  Marks: {
    superscript: {}
  }
}>

export type SuperscriptCommandsExtension = Extension<{
  Commands: {
    setSuperscript: []
    toggleSuperscript: []
    unsetSuperscript: []
  }
}>

export type SuperscriptExtension = SuperscriptSpecExtension &
  SuperscriptCommandsExtension
