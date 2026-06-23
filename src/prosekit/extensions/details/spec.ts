import { defineNodeSpec, union } from 'prosekit/core'

import type { DetailsAttrs, DetailsSpecExtension } from './types'

export function defineDetailsSpec(): DetailsSpecExtension {
  return union(
    defineNodeSpec<'details', DetailsAttrs>({
      name: 'details',
      group: 'block',
      content: 'detailsSummary detailsContent',
      defining: true,
      isolating: true,
      attrs: {
        open: { default: true },
      },
      parseDOM: [
        {
          tag: 'details',
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) {
              return {}
            }

            return {
              open: node.hasAttribute('open'),
            }
          },
        },
      ],
      toDOM: (node) => [
        'details',
        {
          class: node.attrs.open === false ? 'cq-details' : 'cq-details is-open',
          open: node.attrs.open === false ? null : '',
        },
        0,
      ],
    }),
    defineNodeSpec<'detailsSummary', Record<string, never>>({
      name: 'detailsSummary',
      content: 'text*',
      defining: true,
      isolating: true,
      selectable: false,
      parseDOM: [{ tag: 'summary' }],
      toDOM: () => [
        'summary',
        {
          class: 'cq-details-summary pk:relative pk:cursor-text pk:list-none pk:font-semibold pk:outline-none pk:marker:hidden',
        },
        0,
      ],
    }),
    defineNodeSpec<'detailsContent', Record<string, never>>({
      name: 'detailsContent',
      content: 'block+',
      defining: true,
      selectable: false,
      parseDOM: [
        { tag: 'div[data-type="detailsContent"]' },
        { tag: 'div[data-node="details-content"]' },
      ],
      toDOM: () => [
        'div',
        {
          class: 'cq-details-content',
          'data-type': 'detailsContent',
        },
        0,
      ],
    }),
  ) as DetailsSpecExtension
}
