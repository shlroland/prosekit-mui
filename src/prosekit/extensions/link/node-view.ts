import { defineReactNodeView } from 'prosekit/react'

import { LinkView } from './view'

export function defineLinkNodeView() {
  return [
    defineReactNodeView({
      name: 'inlineLink',
      component: LinkView,
      as: 'span',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('button, [role="dialog"], [data-editor-floating]'))
          : false
      },
    }),
    defineReactNodeView({
      name: 'blockLink',
      component: LinkView,
      as: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('button, [role="dialog"], [data-editor-floating]'))
          : false
      },
    }),
  ] as const
}
