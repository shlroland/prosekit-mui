import { defineReactNodeView } from 'prosekit/react'

import { FlipGridColumnView, FlipGridView } from './view'

export function defineFlipGridNodeView() {
  return [
    defineReactNodeView({
      name: 'flipGrid',
      component: FlipGridView,
      as: 'div',
      contentAs: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('[data-flip-grid-controls="true"]'))
          : false
      },
    }),
    defineReactNodeView({
      name: 'flipGridColumn',
      component: FlipGridColumnView,
      as: 'div',
      contentAs: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('[data-flip-grid-controls="true"]'))
          : false
      },
    }),
  ] as const
}
