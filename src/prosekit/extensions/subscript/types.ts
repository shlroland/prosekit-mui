import type { Extension } from 'prosekit/core'

export type SubscriptSpecExtension = Extension<{
  Marks: {
    subscript: {}
  }
}>

export type SubscriptCommandsExtension = Extension<{
  Commands: {
    setSubscript: []
    toggleSubscript: []
    unsetSubscript: []
  }
}>

export type SubscriptExtension = SubscriptSpecExtension & SubscriptCommandsExtension
