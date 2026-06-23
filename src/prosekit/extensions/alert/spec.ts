import { defineNodeSpec } from 'prosekit/core'

import type { AlertAttrs, AlertSpecExtension, AlertVariant } from './types'

const alertVariants = new Set<AlertVariant>(['info', 'success', 'warning', 'error', 'default'])

function normalizeAlertVariant(value: unknown): AlertVariant {
  return typeof value === 'string' && alertVariants.has(value as AlertVariant)
    ? value as AlertVariant
    : 'default'
}

export function defineAlertSpec(): AlertSpecExtension {
  return defineNodeSpec<'alert', AlertAttrs>({
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
  }) as AlertSpecExtension
}
