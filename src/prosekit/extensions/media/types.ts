import type { Extension, Union } from 'prosekit/core'

export type MediaUploadProgress = {
  progress: number
}

export type MediaValidateUrlFunction = (
  url: string,
  kind: 'video' | 'audio',
) => string | Promise<string>

export type MediaExtensionOptions = Record<string, never>

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
