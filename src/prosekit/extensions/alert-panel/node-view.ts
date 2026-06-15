import { defineReactNodeView } from 'prosekit/react'

import { AlertBoxView, CollapsiblePanelView } from './view'

export function defineAlertPanelNodeView() {
  return [
    defineReactNodeView({
      name: 'alertBox',
      component: AlertBoxView,
      as: 'div',
      contentAs: 'div',
    }),
    defineReactNodeView({
      name: 'collapsiblePanel',
      component: CollapsiblePanelView,
      as: 'section',
      contentAs: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('[data-type="collapsible-panel"] button'))
          : false
      },
    }),
  ] as const
}
