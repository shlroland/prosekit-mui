import type { Extension, NodeJSON, Union } from 'prosekit/core'

export type DiffTextChange = {
  offset: number
  length: number
  text: string
  operation: -1 | 0 | 1
}

export type DiffAttrChange = {
  key: string
  oldValue: unknown
  newValue: unknown
  fromOffset?: number
  toOffset?: number
}

export type DiffItem = {
  type: 'insert' | 'delete' | 'modify'
  path: number[]
  node?: NodeJSON
  textDiff?: DiffTextChange
  attrChange?: DiffAttrChange
}

export type DiffComparison = {
  oldDoc: NodeJSON
  newDoc: NodeJSON
  diffs: DiffItem[]
  hasChanges: boolean
}

export type DiffOptions = {
  ignoreAttrs?: string[]
  nodePreviewSerializer?: (node: NodeJSON) => string | null | undefined
}

export type DiffStateSnapshot = {
  isActive: boolean
  diffCount: number
  baseline: NodeJSON | null
}

export type DiffCommandsExtension = Extension<{
  Commands: {
    setDiffBaseline: [baseline?: NodeJSON]
    showDiff: [baseline?: NodeJSON]
    hideDiff: []
    toggleDiff: [baseline?: NodeJSON]
  }
}>

export type DiffExtension = Union<[Extension, DiffCommandsExtension]>
