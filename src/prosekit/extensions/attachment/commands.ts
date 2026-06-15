import { defineCommands, insertNode } from 'prosekit/core'

import type { AttachmentAttrs, AttachmentCommandsExtension } from './types'

export function defineAttachmentCommands(): AttachmentCommandsExtension {
  return defineCommands({
    insertAttachment: (attrs?: AttachmentAttrs) => insertNode({
      type: 'attachment',
      attrs: {
        url: attrs?.url || '',
        title: attrs?.title || '',
        size: attrs?.size || '',
      },
    }),
  }) as AttachmentCommandsExtension
}
