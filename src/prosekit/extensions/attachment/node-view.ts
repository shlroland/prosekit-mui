import { defineReactNodeView } from 'prosekit/react'

import { AttachmentView } from './view'

export function defineAttachmentNodeView() {
  return defineReactNodeView({
    name: 'attachment',
    component: AttachmentView,
    as: 'div',
    stopEvent: (event) => {
      return event.target instanceof HTMLElement
        ? Boolean(event.target.closest('.prosekit-attachment-toolbar, .prosekit-attachment-card, .prosekit-attachment-insert-panel, .prosekit-attachment-upload-control'))
        : false
    },
  })
}
