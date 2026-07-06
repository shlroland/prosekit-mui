import { defineReactNodeView } from 'prosekit/react'

import { DetailsContentView, DetailsView } from './view'

export function defineDetailsNodeView() {
  return [
    defineReactNodeView({
      name: 'details',
      component: DetailsView,
      as: 'div',
      contentAs: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('button'))
          : false
      },
    }),
    defineReactNodeView({
      name: 'detailsContent',
      component: DetailsContentView,
      as: 'div',
      contentAs: 'div',
    }),
  ] as const
}
