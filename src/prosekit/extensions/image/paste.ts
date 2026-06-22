import { defineDOMEventHandler, union } from 'prosekit/core'
import { defineFileDropHandler, defineFilePasteHandler } from 'prosekit/extensions/file'
import { InputRule } from 'prosekit/pm/inputrules'
import { defineInputRule } from 'prosekit/extensions/input-rule'
import type { EditorView } from 'prosekit/pm/view'
import type { Command } from 'prosekit/pm/state'

import type { ImageAttrs, ImageExtensionOptions, ImagePasteExtension } from './types'

const IMAGE_URL_REGEX = /^(https?:\/\/|\/\/|blob:).+\.(?:png|jpe?g|gif|webp|avif|svg)(?:[?#].*)?$/i
const DATA_IMAGE_REGEX = /^data:image\/(?:png|jpe?g|gif|webp|avif|svg\+xml);/i
const IMAGE_URL_INPUT_REGEX = /(?:^|\s)((?:https?:\/\/|\/\/|blob:)\S+\.(?:png|jpe?g|gif|webp|avif|svg)(?:[?#]\S*)?)$/i
const MARKDOWN_IMAGE_INPUT_REGEX = /(?:^|\s)(!\[(.*?)]\((\S+?)(?:\s+["'](.+?)["'])?\))$/i

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

function normalizeImageUrl(value: string) {
  const url = value.trim()
  return url.startsWith('//') ? `https:${url}` : url
}

function isImageUrl(value: string) {
  const url = normalizeImageUrl(value)
  return IMAGE_URL_REGEX.test(url) || DATA_IMAGE_REGEX.test(url)
}

function getImageDimensionsFromUrl(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.onerror = () => reject(new Error('无法读取图片尺寸'))
    image.src = src
  })
}

function getImageDimensionsFromFile(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const image = new Image()
      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        })
      }
      image.onerror = () => reject(new Error('无法读取图片文件'))
      image.src = String(event.target?.result || '')
    }
    reader.onerror = () => reject(new Error('无法读取文件'))
    reader.readAsDataURL(file)
  })
}

async function resolveFileAttrs(file: File, options: ImageExtensionOptions): Promise<ImageAttrs> {
  const [src, dimensions] = await Promise.all([
    options.onUpload
      ? options.onUpload(file, () => {})
      : Promise.resolve(URL.createObjectURL(file)),
    getImageDimensionsFromFile(file).catch(() => null),
  ])

  return {
    src,
    width: dimensions?.width ?? 760,
    height: dimensions?.height ?? null,
    title: file.name,
    align: 'center',
  }
}

async function resolveUrlAttrs(url: string, options: ImageExtensionOptions): Promise<ImageAttrs> {
  let src = normalizeImageUrl(url)

  if (options.onValidateUrl) {
    src = await options.onValidateUrl(src)
  }

  if (
    options.onUploadUrl
    && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//'))
  ) {
    const abortController = new AbortController()
    src = await options.onUploadUrl(src, abortController.signal)
  }

  const dimensions = await getImageDimensionsFromUrl(src).catch(() => null)

  return {
    src,
    width: dimensions?.width ?? 760,
    height: dimensions?.height ?? null,
    title: null,
    align: 'center',
  }
}

function insertImage(attrs: ImageAttrs, pos?: number): Command {
  return (state, dispatch) => {
    const nodeType = state.schema.nodes.image

    if (!nodeType) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const node = nodeType.create(attrs)
    const tr = typeof pos === 'number'
      ? state.tr.insert(pos, node)
      : state.tr.replaceSelectionWith(node, false)

    dispatch(tr.scrollIntoView())
    return true
  }
}

function insertImageAsync(view: EditorView, attrsPromise: Promise<ImageAttrs>, pos?: number, options?: ImageExtensionOptions) {
  attrsPromise
    .then((attrs) => {
      insertImage(attrs, pos)(view.state, view.dispatch, view)
      view.focus()
    })
    .catch((error) => {
      options?.onError?.(error instanceof Error ? error : new Error('图片插入失败'))
    })
}

function extractImageUrlsFromHtml(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  const images = Array.from(template.content.querySelectorAll('img[src]'))

  return images
    .map((image) => image.getAttribute('src') || '')
    .filter(Boolean)
}

function isImageOnlyHtml(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html

  const text = template.content.textContent?.trim() ?? ''
  if (text) {
    return false
  }

  return template.content.querySelectorAll('img[src]').length > 0
}

export function defineImagePasteExtension(options: ImageExtensionOptions = {}): ImagePasteExtension {
  return union(
    defineFilePasteHandler(({ view, event, file }) => {
      if (!isImageFile(file)) {
        return false
      }

      event.preventDefault()
      insertImageAsync(view, resolveFileAttrs(file, options), undefined, options)
      return true
    }),
    defineFileDropHandler(({ view, event, file, pos }) => {
      if (!isImageFile(file)) {
        return false
      }

      event.preventDefault()
      insertImageAsync(view, resolveFileAttrs(file, options), pos, options)
      return true
    }),
    defineDOMEventHandler('paste', (view, event) => {
      const clipboardEvent = event as ClipboardEvent
      const html = clipboardEvent.clipboardData?.getData('text/html') ?? ''
      const plainText = clipboardEvent.clipboardData?.getData('text/plain')?.trim() ?? ''

      if (html && isImageOnlyHtml(html)) {
        const urls = extractImageUrlsFromHtml(html)
        if (!urls.length) {
          return false
        }

        clipboardEvent.preventDefault()
        urls.forEach((url) => {
          insertImageAsync(view, resolveUrlAttrs(url, options), undefined, options)
        })
        return true
      }

      if (plainText && isImageUrl(plainText)) {
        clipboardEvent.preventDefault()
        insertImageAsync(view, resolveUrlAttrs(plainText, options), undefined, options)
        return true
      }

      return false
    }),
    defineInputRule(
      new InputRule(IMAGE_URL_INPUT_REGEX, (state, match, start, end) => {
        const url = match[1]
        if (!url || !isImageUrl(url)) {
          return null
        }

        const nodeType = state.schema.nodes.image
        if (!nodeType) {
          return null
        }

        return state.tr.replaceWith(start, end, nodeType.create({
          src: normalizeImageUrl(url),
          width: 760,
          height: null,
          title: null,
          align: 'center',
        }))
      }),
    ),
    defineInputRule(
      new InputRule(MARKDOWN_IMAGE_INPUT_REGEX, (state, match, start, end) => {
        const alt = match[2]?.trim() ?? ''
        const url = match[3]
        const title = match[4]?.trim() || alt || null

        if (!url || !isImageUrl(url)) {
          return null
        }

        const nodeType = state.schema.nodes.image
        if (!nodeType) {
          return null
        }

        return state.tr.replaceWith(start, end, nodeType.create({
          src: normalizeImageUrl(url),
          width: 760,
          height: null,
          title,
          align: 'center',
        }))
      }),
    ),
  ) as ImagePasteExtension
}
