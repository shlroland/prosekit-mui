import type { Editor, NodeJSON } from 'prosekit/core'
import { ProseKit } from 'prosekit/react'
import { type PropsWithChildren, useMemo } from 'react'

import { createBasicProseKitEditor } from './createBasicProseKitEditor'

export type ProseKitProviderProps = PropsWithChildren<{
  editor?: Editor
  initialContent?: NodeJSON
}>

export function ProseKitProvider({
  editor,
  initialContent,
  children,
}: ProseKitProviderProps) {
  const resolvedEditor = useMemo(
    () => editor ?? createBasicProseKitEditor({ defaultContent: initialContent }),
    [editor, initialContent],
  )

  return (
    <ProseKit editor={resolvedEditor}>
      {children}
    </ProseKit>
  )
}
