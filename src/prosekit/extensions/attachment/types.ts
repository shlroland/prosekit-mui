import type { Extension, Union } from 'prosekit/core'

export type AttachmentDisplayType = 'icon' | 'block'
export type AttachmentViewMode = '0' | '1'

export type AttachmentUploadProgress = {
  progress: number
}

export type AttachmentUploadFunction = (
  file: File,
  onProgress: (event: AttachmentUploadProgress) => void,
) => string | Promise<string>

export type AttachmentExtensionOptions = {
  baseUrl?: string
  onUpload?: AttachmentUploadFunction
  onError?: (error: Error) => void
}

export interface AttachmentAttrs {
  url: string
  title: string
  size: string
  type?: AttachmentDisplayType | string | null
  view?: AttachmentViewMode | string | null
  height?: number | null
}

export type AttachmentSpecExtension = Extension<{
  Nodes: {
    inlineAttachment: AttachmentAttrs
    blockAttachment: AttachmentAttrs
  }
}>

export type AttachmentCommandsExtension = Extension<{
  Commands: {
    setInlineAttachment: [attrs?: Partial<AttachmentAttrs>]
    setBlockAttachment: [attrs?: Partial<AttachmentAttrs>]
    insertAttachment: [attrs?: Partial<AttachmentAttrs>]
  }
}>

export type AttachmentViewExtension = Extension

export type AttachmentExtension = Union<
  [AttachmentSpecExtension, AttachmentCommandsExtension, AttachmentViewExtension]
>
