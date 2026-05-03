import { defineBasicExtension } from 'prosekit/basic'
import { createEditor, type Editor, type NodeJSON } from 'prosekit/core'

export type CreateBasicProseKitEditorOptions = {
  defaultContent?: NodeJSON
}

export function createBasicProseKitEditor({
  defaultContent,
}: CreateBasicProseKitEditorOptions = {}): Editor {
  return createEditor({
    extension: defineBasicExtension(),
    defaultContent,
  })
}
