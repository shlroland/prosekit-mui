import { defineCommands, insertNode } from 'prosekit/core'

import type { ExcalidrawCommandsExtension } from './types'

function insertExcalidraw() {
  return insertNode({
    type: 'excalidraw',
  })
}

export function defineExcalidrawCommands(): ExcalidrawCommandsExtension {
  return defineCommands({
    insertExcalidraw,
    setExcalidraw: () => {
      return insertExcalidraw()
    },
  }) as ExcalidrawCommandsExtension
}
