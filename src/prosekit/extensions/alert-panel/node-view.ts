import { defineReactNodeView } from 'prosekit/react'

import { AlertView, DetailsContentView, DetailsSummaryView, DetailsView } from './view'

export function defineAlertPanelNodeView() {
  return [
    defineReactNodeView({
      name: 'alert',
      component: AlertView,
      as: 'div',
      contentAs: 'div',
    }),
    defineReactNodeView({
      name: 'details',
      component: DetailsView,
      as: 'details',
      contentAs: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('[data-node="details"] button'))
          : false
      },
    }),
    defineReactNodeView({
      name: 'detailsSummary',
      component: DetailsSummaryView,
      as: 'summary',
      contentAs: 'summary',
    }),
    defineReactNodeView({
      name: 'detailsContent',
      component: DetailsContentView,
      as: 'div',
      contentAs: 'div',
    }),
  ] as const
}
