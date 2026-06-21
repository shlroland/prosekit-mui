import { defineReactNodeView } from 'prosekit/react'
import { createElement } from 'react'

import { AttachmentView } from './view'
import type { AttachmentExtensionOptions } from './types'

export function defineAttachmentNodeView(options: AttachmentExtensionOptions = {}) {
  const stopEvent = (event: Event) => {
    return event.target instanceof HTMLElement
      ? Boolean(event.target.closest('button, input, [role="dialog"], [data-editor-floating], [data-attachment-upload-control], [data-attachment-resize-handle]'))
      : false
  }

  return [
    defineReactNodeView({
      name: 'inlineAttachment',
      component: (props) => createElement(AttachmentView, { ...props, options }),
      as: 'span',
      stopEvent,
    }),
    defineReactNodeView({
      name: 'blockAttachment',
      component: (props) => createElement(AttachmentView, { ...props, options }),
      as: 'div',
      stopEvent,
    }),
  ] as const
}
