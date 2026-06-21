import { defineNodeSpec, union } from 'prosekit/core'

import type {
  AttachmentAttrs,
  AttachmentExtensionOptions,
  AttachmentSpecExtension,
  AttachmentViewMode,
} from './types'

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeView(value: unknown): AttachmentViewMode {
  return value === '1' ? '1' : '0'
}

function normalizeHeight(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 300
}

function withBaseUrl(url: string, baseUrl: string) {
  if (!url || !baseUrl || /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return url
  }
}

function removeBaseUrl(url: string, baseUrl: string) {
  if (!url || !baseUrl || !url.startsWith(baseUrl)) {
    return url
  }

  return url.slice(baseUrl.length) || '/'
}

function getUrl(element: HTMLElement, baseUrl: string) {
  return withBaseUrl(element.getAttribute('data-url') || element.getAttribute('href') || '', baseUrl)
}

function getTitle(element: HTMLElement) {
  return element.getAttribute('data-title')
    || element.getAttribute('title')
    || element.getAttribute('aria-label')
    || element.textContent
    || ''
}

export function defineAttachmentSpec(options: AttachmentExtensionOptions = {}): AttachmentSpecExtension {
  const baseUrl = options.baseUrl ?? ''

  return union(
    defineNodeSpec<'inlineAttachment', AttachmentAttrs>({
      name: 'inlineAttachment',
      group: 'inline',
      inline: true,
      atom: true,
      selectable: true,
      draggable: true,
      attrs: {
        url: { default: '', validate: 'string' },
        title: { default: '', validate: 'string' },
        size: { default: '0', validate: 'string' },
        type: { default: 'icon', validate: 'string|null' },
      },
      parseDOM: [
        {
          tag: 'span[data-tag="attachment"]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement)) {
              return false
            }

            return {
              url: getUrl(dom, baseUrl),
              title: getTitle(dom),
              size: dom.getAttribute('data-size') || '0',
              type: dom.getAttribute('data-type') || 'icon',
            }
          },
        },
        {
          tag: 'a[download]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement) || dom.getAttribute('type') === 'block') {
              return false
            }

            return {
              url: getUrl(dom, baseUrl),
              title: getTitle(dom) || dom.getAttribute('download') || '',
              size: dom.getAttribute('data-size') || '0',
              type: 'icon',
            }
          },
        },
      ],
      toDOM: (node) => {
        const attrs = node.attrs as AttachmentAttrs

        return [
          'span',
          {
            'data-tag': 'attachment',
            'data-url': removeBaseUrl(normalizeText(attrs.url), baseUrl),
            'data-title': normalizeText(attrs.title),
            'data-size': normalizeText(attrs.size) || '0',
            'data-type': 'icon',
          },
        ]
      },
    }),
    defineNodeSpec<'blockAttachment', AttachmentAttrs>({
      name: 'blockAttachment',
      group: 'block',
      atom: true,
      selectable: true,
      draggable: true,
      attrs: {
        url: { default: '', validate: 'string' },
        title: { default: '', validate: 'string' },
        size: { default: '0', validate: 'string' },
        type: { default: 'block', validate: 'string|null' },
        view: { default: '0', validate: 'string|null' },
        height: { default: 300, validate: 'number|null' },
      },
      parseDOM: [
        {
          tag: 'div[data-tag="attachment"]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement)) {
              return false
            }

            return {
              url: getUrl(dom, baseUrl),
              title: getTitle(dom),
              size: dom.getAttribute('data-size') || '0',
              type: dom.getAttribute('data-type') || 'block',
              view: normalizeView(dom.getAttribute('data-view')),
              height: normalizeHeight(dom.getAttribute('data-height')),
            }
          },
        },
        {
          tag: 'a[download][type="block"]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement)) {
              return false
            }

            return {
              url: getUrl(dom, baseUrl),
              title: getTitle(dom) || dom.getAttribute('download') || '',
              size: dom.getAttribute('data-size') || '0',
              type: 'block',
              view: normalizeView(dom.getAttribute('data-view')),
              height: normalizeHeight(dom.getAttribute('data-height')),
            }
          },
        },
      ],
      toDOM: (node) => {
        const attrs = node.attrs as AttachmentAttrs
        const url = normalizeText(attrs.url)
        const domAttrs: Record<string, string | number> = {
          'data-tag': 'attachment',
          'data-title': normalizeText(attrs.title),
          'data-size': normalizeText(attrs.size) || '0',
          'data-type': 'block',
          'data-view': normalizeView(attrs.view),
          'data-height': normalizeHeight(attrs.height),
        }

        if (url) {
          domAttrs['data-url'] = removeBaseUrl(url, baseUrl)
        }

        return ['div', domAttrs]
      },
    }),
  ) as AttachmentSpecExtension
}
