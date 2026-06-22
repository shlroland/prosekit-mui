import { defineReactNodeView } from 'prosekit/react'
import { createElement } from 'react'

import { AudioView, ImageView, VideoView } from './view'
import type { MediaExtensionOptions } from './types'

export function defineMediaNodeView(options: MediaExtensionOptions = {}) {
  return [
    defineReactNodeView({
      name: 'image',
      component: (props) => createElement(ImageView, { ...props, options: options.image }),
      as: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('.prosekit-media-toolbar, .prosekit-media-placeholder, .prosekit-media-insert-panel, .prosekit-media-upload-control, [data-media-resize-handle]'))
          : false
      },
    }),
    defineReactNodeView({
      name: 'video',
      component: VideoView,
      as: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('.prosekit-media-toolbar, .prosekit-media-placeholder, .prosekit-media-insert-panel, .prosekit-media-upload-control'))
          : false
      },
    }),
    defineReactNodeView({
      name: 'audio',
      component: AudioView,
      as: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('.prosekit-media-toolbar, .prosekit-media-placeholder, .prosekit-media-insert-panel, .prosekit-media-upload-control'))
          : false
      },
    }),
  ] as const
}
