import type { Extension, Union } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import type { KatexOptions } from 'katex'

export type MathExtensionOptions = {
  katexOptions?: KatexOptions
  inlineTemplate?: string
  blockTemplate?: string
}

export type MathSpecExtension = Extension<{
  Nodes: {
    mathInline: Attrs
    mathBlock: Attrs
  }
}>

export type MathCommandsExtension = Extension<{
  Commands: {
    insertMathInline: [latex?: string]
    setMathInline: [latex?: string]
    updateMathInline: [latex: string]
    deleteMathInline: []
    insertMathBlock: [latex?: string]
    setMathBlock: [latex?: string]
    updateMathBlock: [latex: string]
    deleteMathBlock: []
  }
}>

export type MathViewExtension = Extension

export type MathExtension = Union<
  [MathSpecExtension, MathCommandsExtension, MathViewExtension]
>
