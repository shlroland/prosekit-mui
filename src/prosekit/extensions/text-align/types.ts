import type { Extension, Union } from 'prosekit/core'

export const textAlignValues = ['left', 'center', 'right', 'justify'] as const

export type TextAlignValue = typeof textAlignValues[number]

export type TextAlignOptions = {
  types?: string[]
  alignments?: TextAlignValue[]
  defaultAlignment?: TextAlignValue
}

export type TextAlignNodesExtension = Extension<{
  Nodes: {
    paragraph: {
      textAlign?: TextAlignValue
    }
    heading: {
      textAlign?: TextAlignValue
    }
  }
}>

export type TextAlignCommandsExtension = Extension<{
  Commands: {
    setTextAlign: [TextAlignValue]
    unsetTextAlign: []
    toggleTextAlign: [TextAlignValue]
  }
}>

export type TextAlignExtension = Union<[
  TextAlignNodesExtension,
  TextAlignCommandsExtension,
]>
