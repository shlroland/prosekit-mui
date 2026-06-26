import type { Extension, Union } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'

import type { ImageUploadFunction } from '../image'

export type ExcalidrawExtensionOptions = {
  onUpload?: ImageUploadFunction
  onError?: (error: Error) => void
  maxWidth?: number
}

export type ExcalidrawSpecExtension = Extension<{
  Nodes: {
    excalidraw: Attrs
  }
}>

export type ExcalidrawCommandsExtension = Extension<{
  Commands: {
    insertExcalidraw: []
    setExcalidraw: []
  }
}>

export type ExcalidrawViewExtension = Extension

export type ExcalidrawExtension = Union<
  [ExcalidrawSpecExtension, ExcalidrawCommandsExtension, ExcalidrawViewExtension]
>
