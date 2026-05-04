import { addMark, defineCommands, removeMark, toggleMark } from 'prosekit/core'

import type { SubscriptCommandsExtension } from './types'

export function defineSubscriptCommands(): SubscriptCommandsExtension {
  return defineCommands({
    setSubscript: () =>
      addMark({
        type: 'subscript',
      }),
    toggleSubscript: () =>
      toggleMark({
        type: 'subscript',
      }),
    unsetSubscript: () =>
      removeMark({
        type: 'subscript',
      }),
  }) as SubscriptCommandsExtension
}
