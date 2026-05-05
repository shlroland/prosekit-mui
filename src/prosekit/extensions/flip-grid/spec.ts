import { defineNodeSpec, union } from 'prosekit/core'

import {
  DEFAULT_GAP,
  MAX_COLUMNS,
  MIN_WIDTH,
  type FlipGridAttrs,
  type FlipGridColumnAttrs,
  type FlipGridSpecExtension,
} from './types'

function parseWidth(element: HTMLElement) {
  const attrWidth = Number(element.getAttribute('data-width') ?? '')

  if (Number.isFinite(attrWidth) && attrWidth > 0) {
    return attrWidth
  }

  const styleWidth = Number(element.style.width.replace('%', ''))

  if (Number.isFinite(styleWidth) && styleWidth > 0) {
    return styleWidth
  }

  return 50
}

export function defineFlipGridSpec(): FlipGridSpecExtension {
  return union(
    defineNodeSpec<'flipGrid', FlipGridAttrs>({
      name: 'flipGrid',
      group: 'block',
      content: `flipGridColumn{1,${MAX_COLUMNS}}`,
      isolating: true,
      defining: true,
      attrs: {
        gap: { default: DEFAULT_GAP },
      },
      parseDOM: [
        {
          tag: 'div[data-type="flip-grid"]',
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) {
              return {}
            }

            return {
              gap: node.getAttribute('data-gap') || node.style.gap || DEFAULT_GAP,
            }
          },
        },
      ],
      toDOM: (node) => [
        'div',
        {
          'data-type': 'flip-grid',
          'data-gap': node.attrs.gap || DEFAULT_GAP,
        },
        0,
      ],
    }),
    defineNodeSpec<'flipGridColumn', FlipGridColumnAttrs>({
      name: 'flipGridColumn',
      content: 'block+',
      isolating: true,
      defining: true,
      attrs: {
        width: { default: 50 },
      },
      parseDOM: [
        {
          tag: 'div[data-type="flip-grid-column"]',
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) {
              return {}
            }

            return {
              width: parseWidth(node),
            }
          },
        },
      ],
      toDOM: (node) => {
        const width = Math.max(MIN_WIDTH, Number(node.attrs.width) || 50)

        return [
          'div',
          {
            'data-type': 'flip-grid-column',
            'data-width': width,
            style: `width: ${width}%; flex: 0 0 ${width}%; min-width: 0;`,
          },
          0,
        ]
      },
    }),
  ) as FlipGridSpecExtension
}
