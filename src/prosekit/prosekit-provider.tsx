import type { Editor, Extension, NodeJSON } from 'prosekit/core'
import { ProseKit } from 'prosekit/react'
import { type PropsWithChildren, useMemo } from 'react'

import { createProseKitEditor } from './create-prose-kit-editor'

export type ProseKitProviderProps = PropsWithChildren<{
  editor?: Editor
  extension?: Extension
  initialContent?: NodeJSON
}>

export function ProseKitProvider({
  editor,
  extension,
  initialContent,
  children,
}: ProseKitProviderProps) {
  const resolvedEditor = useMemo(() => {
    if (editor) {
      return editor
    }

    if (!extension) {
      throw new Error('ProseKitProvider requires either an editor or an extension.')
    }

    return createProseKitEditor({
      extension,
      defaultContent: initialContent,
    })
  }, [editor, extension, initialContent])

  return (
    <ProseKit editor={resolvedEditor}>
      {children}
    </ProseKit>
  )
}
