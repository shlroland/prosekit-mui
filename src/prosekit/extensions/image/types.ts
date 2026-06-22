import type { Extension, Union } from 'prosekit/core'

export type ImageUploadProgress = {
  progress: number
}

export type ImageUploadFunction = (
  file: File,
  onProgress: (event: ImageUploadProgress) => void,
) => string | Promise<string>

export type ImageUploadUrlFunction = (
  url: string,
  signal: AbortSignal,
) => string | Promise<string>

export type ImageValidateUrlFunction = (
  url: string,
) => string | Promise<string>

export type ImageOptions = {
  onUpload?: ImageUploadFunction
  onUploadUrl?: ImageUploadUrlFunction
  onValidateUrl?: ImageValidateUrlFunction
  onError?: (error: Error) => void
}

export type ImageExtensionOptions = ImageOptions

export type ImageAttrs = {
  src?: string | null
  width?: number | null
  height?: number | null
  title?: string | null
  align?: 'left' | 'center' | 'right' | null
}

export type ImageSpecExtension = Extension

export type ImageViewExtension = Extension

export type ImageExtension = Union<
  [ImageSpecExtension, ImageViewExtension]
>
