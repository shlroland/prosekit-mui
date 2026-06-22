import { defineReactNodeView } from 'prosekit/react'

import { AudioView, VideoView } from './view'
import type { MediaExtensionOptions } from './types'

export function defineMediaNodeView(options: MediaExtensionOptions = {}) {
  void options

  return [
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
