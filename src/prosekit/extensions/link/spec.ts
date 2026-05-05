import { defineNodeSpec, union } from 'prosekit/core'

import type { LinkAttrs, LinkSpecExtension } from './types'
import { getLinkTitle, getSafeHref, toLinkAttrs } from './utils'

export function defineLinkSpec(): LinkSpecExtension {
  return union(
    defineNodeSpec<'inlineLink', LinkAttrs>({
      name: 'inlineLink',
      group: 'inline',
      inline: true,
      atom: true,
      draggable: true,
      selectable: true,
      attrs: {
        href: { default: '', validate: 'string' },
        target: { default: '_blank', validate: 'string|null' },
        rel: { default: null, validate: 'string|null' },
        class: { default: null, validate: 'string|null' },
        title: { default: null, validate: 'string|null' },
        type: { default: 'icon', validate: 'string|null' },
        download: { default: null, validate: 'string|null' },
      },
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (dom: HTMLElement) => {
            if (dom.hasAttribute('download') || dom.getAttribute('type') === 'block') {
              return false
            }

            const hasImageChild = Array.from(dom.childNodes).some((node) => {
              return node.nodeType === 1 && (node as HTMLElement).tagName.toLowerCase() === 'img'
            })
            if (hasImageChild) {
              return false
            }

            const attrs = toLinkAttrs(dom.getAttribute('href') || '', {
              target: dom.getAttribute('target'),
              rel: dom.getAttribute('rel'),
              class: dom.getAttribute('class'),
              title: dom.textContent || dom.getAttribute('title'),
              type: dom.getAttribute('type') || 'icon',
              download: dom.getAttribute('download'),
            })
            return attrs ?? false
          },
        },
      ],
      toDOM(node) {
        const attrs = node.attrs as LinkAttrs
        const label = attrs.title || getLinkTitle(attrs.href)
        return ['a', {
          href: getSafeHref(attrs.href),
          target: attrs.target,
          rel: attrs.rel,
          class: attrs.class,
          title: attrs.title,
          type: attrs.type,
          download: attrs.download,
        }, label]
      },
    }),
    defineNodeSpec<'blockLink', LinkAttrs>({
      name: 'blockLink',
      group: 'block',
      atom: true,
      draggable: true,
      selectable: true,
      attrs: {
        href: { default: '', validate: 'string' },
        target: { default: '_blank', validate: 'string|null' },
        rel: { default: null, validate: 'string|null' },
        class: { default: null, validate: 'string|null' },
        title: { default: null, validate: 'string|null' },
        type: { default: 'block', validate: 'string|null' },
        download: { default: null, validate: 'string|null' },
      },
      parseDOM: [
        {
          tag: 'a[type="block"][href]',
          getAttrs: (dom: HTMLElement) => {
            if (dom.hasAttribute('download')) {
              return false
            }

            const attrs = toLinkAttrs(dom.getAttribute('href') || '', {
              target: dom.getAttribute('target'),
              rel: dom.getAttribute('rel'),
              class: dom.getAttribute('class'),
              title: dom.textContent || dom.getAttribute('title'),
              type: 'block',
              download: dom.getAttribute('download'),
            })
            return attrs ? { ...attrs, type: 'block' } : false
          },
        },
      ],
      toDOM(node) {
        const attrs = node.attrs as LinkAttrs
        const label = attrs.title || getLinkTitle(attrs.href)
        return ['a', {
          href: getSafeHref(attrs.href),
          target: attrs.target,
          rel: attrs.rel,
          class: attrs.class,
          title: attrs.title,
          type: 'block',
          download: attrs.download,
        }, label]
      },
    }),
  ) as LinkSpecExtension
}
