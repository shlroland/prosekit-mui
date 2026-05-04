import {
  addMark,
  defineCommands,
  removeMark,
  toggleMark,
} from 'prosekit/core'

import type { HighlightCommandsExtension, HighlightAttrs } from './types'

export function defineHighlightCommands(): HighlightCommandsExtension {
  return defineCommands({
    setHighlight: (attrs?: HighlightAttrs) =>
      addMark({
        type: 'highlight',
        attrs,
      }),
    toggleHighlight: (attrs?: HighlightAttrs) =>
      toggleMark({
        type: 'highlight',
        attrs,
      }),
    unsetHighlight: () =>
      removeMark({
        type: 'highlight',
      }),
  }) as HighlightCommandsExtension
}
