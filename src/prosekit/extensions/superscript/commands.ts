import { addMark, defineCommands, removeMark, toggleMark } from 'prosekit/core'

import type { SuperscriptCommandsExtension } from './types'

export function defineSuperscriptCommands(): SuperscriptCommandsExtension {
  return defineCommands({
    setSuperscript: () =>
      addMark({
        type: 'superscript',
      }),
    toggleSuperscript: () =>
      toggleMark({
        type: 'superscript',
      }),
    unsetSuperscript: () =>
      removeMark({
        type: 'superscript',
      }),
  }) as SuperscriptCommandsExtension
}
