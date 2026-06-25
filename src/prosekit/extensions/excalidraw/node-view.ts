import { defineReactNodeView } from 'prosekit/react'
import { createElement } from 'react'

import { ExcalidrawView } from './view'
import type { ExcalidrawExtensionOptions } from './types'

export function defineExcalidrawNodeView(options: ExcalidrawExtensionOptions = {}) {
  return defineReactNodeView({
    name: 'excalidraw',
    component: (props) => createElement(ExcalidrawView, { ...props, options }),
    as: 'figure',
    stopEvent: (event) => {
      return event.target instanceof HTMLElement
        ? Boolean(event.target.closest('[data-excalidraw-controls], [data-excalidraw-modal]'))
        : false
    },
  })
}
