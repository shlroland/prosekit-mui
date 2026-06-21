import { definePlugin, union } from 'prosekit/core'
import type { PlainExtension } from 'prosekit/core'
import { keymap } from 'prosekit/pm/keymap'

import { defineAttachmentCommands, insertAttachmentNode } from './commands'
import { defineAttachmentNodeView } from './node-view'
import { defineAttachmentSpec } from './spec'
import type { AttachmentExtension, AttachmentExtensionOptions } from './types'

function defineAttachmentKeymap(): PlainExtension {
  return definePlugin(keymap({
    'Mod-5': insertAttachmentNode('inlineAttachment', {
      url: '',
      title: '',
      size: '0',
      type: 'icon',
    }),
  }))
}

export function defineAttachmentExtension(options: AttachmentExtensionOptions = {}): AttachmentExtension {
  return union(
    defineAttachmentSpec(options),
    defineAttachmentCommands(),
    ...defineAttachmentNodeView(options),
    defineAttachmentKeymap(),
  ) as AttachmentExtension
}
