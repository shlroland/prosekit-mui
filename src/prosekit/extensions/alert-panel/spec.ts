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
      draggable: true,
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
          class: 'alert-wrapper',
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
  ) as AlertPanelSpecExtension
}
