import type { Extension, Union } from 'prosekit/core'

export type MediaUploadProgress = {
  progress: number
}

export type ImageUploadFunction = (
  file: File,
  onProgress: (event: MediaUploadProgress) => void,
) => string | Promise<string>

export type ImageUploadUrlFunction = (
  url: string,
  signal: AbortSignal,
) => string | Promise<string>

export type MediaValidateUrlFunction = (
  url: string,
  kind: 'image' | 'video' | 'audio',
) => string | Promise<string>

export type ImageOptions = {
  onUpload?: ImageUploadFunction
  onUploadUrl?: ImageUploadUrlFunction
  onValidateUrl?: MediaValidateUrlFunction
  onError?: (error: Error) => void
}

export type MediaExtensionOptions = {
  image?: ImageOptions
}

export type ImageAttrs = {
  src?: string | null
  width?: number | null
  height?: number | null
  title?: string | null
  align?: 'left' | 'center' | 'right' | null
}

export type VideoAttrs = {
  src?: string | null
  width?: string | null
}

export type AudioAttrs = {
  src?: string | null
}

export type MediaSpecExtension = Extension<{
  Nodes: {
    video: VideoAttrs
    audio: AudioAttrs
  }
}>

export type MediaCommandsExtension = Extension<{
  Commands: {
    insertVideo: [attrs?: VideoAttrs]
    insertAudio: [attrs?: AudioAttrs]
  }
}>

export type MediaViewExtension = Extension

export type MediaExtension = Union<
  [MediaSpecExtension, MediaCommandsExtension, MediaViewExtension]
>
