import { defineReactNodeView } from 'prosekit/react'
import { createElement } from 'react'

import { ImageView } from './view'
import type { ImageExtensionOptions } from './types'

export function defineImageNodeView(options: ImageExtensionOptions = {}) {
  return defineReactNodeView({
    name: 'image',
    component: (props) => createElement(ImageView, { ...props, options }),
    as: 'div',
    stopEvent: (event) => {
      return event.target instanceof HTMLElement
        ? Boolean(event.target.closest('.prosekit-media-toolbar, .prosekit-media-placeholder, .prosekit-media-insert-panel, .prosekit-media-upload-control, [data-media-resize-handle]'))
        : false
    },
  })
}
