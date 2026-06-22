import { defineNodeSpec, union } from 'prosekit/core'

import type {
  AlertAttrs,
  AlertVariant,
  AlertPanelSpecExtension,
  DetailsAttrs,
} from './types'

const alertVariants = new Set<AlertVariant>(['info', 'success', 'warning', 'error', 'default'])

function normalizeAlertVariant(value: unknown): AlertVariant {
  return typeof value === 'string' && alertVariants.has(value as AlertVariant)
    ? value as AlertVariant
    : 'default'
}

export function defineAlertPanelSpec(): AlertPanelSpecExtension {
  return union(
    defineNodeSpec<'alert', AlertAttrs>({
      name: 'alert',
      group: 'block',
      content: 'block+',
      defining: true,
      isolating: true,
      attrs: {
        id: { default: null },
        variant: { default: 'default' },
        type: { default: 'icon' },
      },
      parseDOM: [
        {
          tag: 'div[data-node="alert"]',
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) {
              return {}
            }

            return {
              id: node.getAttribute('data-id'),
              variant: normalizeAlertVariant(node.getAttribute('data-variant')),
              type: node.getAttribute('data-type') === 'text' ? 'text' : 'icon',
            }
          },
        },
        {
          tag: 'div[data-type="alert-box"]',
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) {
              return {}
            }

            return {
              id: node.getAttribute('data-id'),
              variant: normalizeAlertVariant(
                node.getAttribute('data-variant') || node.getAttribute('data-kind'),
              ),
              type: 'icon',
            }
          },
        },
      ],
      toDOM: (node) => [
        'div',
        {
          'data-node': 'alert',
          'data-id': typeof node.attrs.id === 'string' && node.attrs.id ? node.attrs.id : null,
          'data-variant': normalizeAlertVariant(node.attrs.variant),
          'data-type': node.attrs.type === 'text' ? 'text' : 'icon',
        },
        0,
      ],
    }),
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
          'data-node': 'details',
          open: node.attrs.open === false ? null : '',
        },
        0,
      ],
    }),
    defineNodeSpec<'detailsSummary', Record<string, never>>({
      name: 'detailsSummary',
      content: 'inline*',
      defining: true,
      parseDOM: [{ tag: 'summary' }],
      toDOM: () => [
        'summary',
        {
          'data-placeholder': '输入面板标题',
        },
        0,
      ],
    }),
    defineNodeSpec<'detailsContent', Record<string, never>>({
      name: 'detailsContent',
      content: 'block+',
      defining: true,
      parseDOM: [
        { tag: 'div[data-type="detailsContent"]' },
        { tag: 'div[data-node="details-content"]' },
      ],
      toDOM: () => [
        'div',
        {
          'data-type': 'detailsContent',
          'data-node': 'details-content',
        },
        0,
      ],
    }),
  ) as AlertPanelSpecExtension
}
