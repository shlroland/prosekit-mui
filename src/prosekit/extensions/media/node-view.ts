import { defineReactNodeView } from 'prosekit/react'

import { AudioView, ImageView, VideoView } from './view'

export function defineMediaNodeView() {
  return [
    defineReactNodeView({
      name: 'image',
      component: ImageView,
      as: 'div',
      stopEvent: (event) => {
        return event.target instanceof HTMLElement
          ? Boolean(event.target.closest('.prosekit-media-toolbar, .prosekit-media-placeholder, .prosekit-media-insert-panel, .prosekit-media-upload-control'))
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
