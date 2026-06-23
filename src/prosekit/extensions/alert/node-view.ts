import { defineReactNodeView } from 'prosekit/react'

import { AlertView } from './view'

export function defineAlertNodeView() {
  return defineReactNodeView({
    name: 'alert',
    component: AlertView,
    as: 'div',
    contentAs: 'div',
    stopEvent: (event) => {
      return event.target instanceof HTMLElement
        ? Boolean(event.target.closest('button, [role="dialog"], [data-editor-floating]'))
        : false
    },
  })
}
