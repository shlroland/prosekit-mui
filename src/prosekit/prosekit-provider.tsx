import { defineBasicExtension } from 'prosekit/basic'
import { createEditor, type NodeJSON } from 'prosekit/core'
import { ProseKit } from 'prosekit/react'
import { type PropsWithChildren, useMemo } from 'react'

import { defaultContent } from './default-content'

export type ProseKitProviderProps = PropsWithChildren<{
  initialContent?: NodeJSON
}>

export function ProseKitProvider({
  initialContent = defaultContent,
  children,
}: ProseKitProviderProps) {
  const editor = useMemo(
    () =>
      createEditor({
        extension: defineBasicExtension(),
        defaultContent: initialContent,
      }),
    [initialContent],
  )

  return (
    <ProseKit editor={editor}>
      {children}
    </ProseKit>
  )
}
