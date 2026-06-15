import { union } from 'prosekit/core'

import { defineAttachmentCommands } from './commands'
import { defineAttachmentNodeView } from './node-view'
import { defineAttachmentSpec } from './spec'
import type { AttachmentExtension } from './types'

import './view.css'

export function defineAttachmentExtension(): AttachmentExtension {
  return union(
    defineAttachmentSpec(),
    defineAttachmentCommands(),
    defineAttachmentNodeView(),
  ) as AttachmentExtension
}
