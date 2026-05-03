import { createEditor, type Editor, type Extension, type NodeJSON } from 'prosekit/core'

export type CreateProseKitEditorOptions = {
  extension: Extension
  defaultContent?: NodeJSON
}

export function createProseKitEditor({
  extension,
  defaultContent,
}: CreateProseKitEditorOptions): Editor {
  return createEditor({
    extension,
    defaultContent,
  })
}
