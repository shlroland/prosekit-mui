import type { Extension, Union } from 'prosekit/core'

export type AttachmentAttrs = {
  url?: string | null
  title?: string | null
  size?: string | null
}

export type AttachmentSpecExtension = Extension<{
  Nodes: {
    attachment: AttachmentAttrs
  }
}>

export type AttachmentCommandsExtension = Extension<{
  Commands: {
    insertAttachment: [attrs?: AttachmentAttrs]
  }
}>

export type AttachmentViewExtension = Extension

export type AttachmentExtension = Union<
  [AttachmentSpecExtension, AttachmentCommandsExtension, AttachmentViewExtension]
>
