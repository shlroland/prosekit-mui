import { defineNodeSpec, union } from 'prosekit/core'

import type {
  AlertBoxAttrs,
  AlertBoxKind,
  AlertPanelSpecExtension,
  CollapsiblePanelAttrs,
} from './types'

const alertKinds = new Set<AlertBoxKind>(['info', 'success', 'warning', 'error'])

function normalizeAlertKind(value: unknown): AlertBoxKind {
  return typeof value === 'string' && alertKinds.has(value as AlertBoxKind)
    ? value as AlertBoxKind
    : 'info'
}

function parseBooleanAttr(value: string | null): boolean {
  return value !== 'false'
}

export function defineAlertPanelSpec(): AlertPanelSpecExtension {
  return union(
    defineNodeSpec<'alertBox', AlertBoxAttrs>({
      name: 'alertBox',
      group: 'block',
      content: 'block+',
      defining: true,
      attrs: {
        variant: { default: 'info' },
      },
      parseDOM: [
        {
          tag: 'div[data-type="alert-box"]',
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) {
              return {}
            }

            return {
              variant: normalizeAlertKind(
                node.getAttribute('data-variant') || node.getAttribute('data-kind'),
              ),
            }
          },
        },
      ],
      toDOM: (node) => [
        'div',
        {
          'data-type': 'alert-box',
          'data-variant': normalizeAlertKind(node.attrs.variant),
        },
        0,
      ],
    }),
    defineNodeSpec<'collapsiblePanel', CollapsiblePanelAttrs>({
      name: 'collapsiblePanel',
      group: 'block',
      content: 'block+',
      defining: true,
      isolating: true,
      attrs: {
        open: { default: true },
        title: { default: '折叠面板' },
      },
      parseDOM: [
        {
          tag: 'section[data-type="collapsible-panel"]',
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement)) {
              return {}
            }

            return {
              open: parseBooleanAttr(node.getAttribute('data-open')),
              title: node.getAttribute('data-title') || '折叠面板',
            }
          },
        },
      ],
      toDOM: (node) => [
        'section',
        {
          'data-type': 'collapsible-panel',
          'data-open': node.attrs.open === false ? 'false' : 'true',
          'data-title': node.attrs.title || '折叠面板',
        },
        0,
      ],
    }),
  ) as AlertPanelSpecExtension
}
