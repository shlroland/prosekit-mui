import type { Extension, Union } from 'prosekit/core'

export type DetailsAttrs = {
  open?: boolean
}

export type DetailsSpecExtension = Extension<{
  Nodes: {
    details: DetailsAttrs
    detailsSummary: Record<string, never>
    detailsContent: Record<string, never>
  }
}>

export type DetailsCommandsExtension = Extension<{
  Commands: {
    setDetails: [title?: string]
    unsetDetails: []
    insertCollapsiblePanel: [title?: string]
  }
}>

export type DetailsViewExtension = Extension

export type DetailsExtension = Union<
  [DetailsSpecExtension, DetailsCommandsExtension, DetailsViewExtension]
>
