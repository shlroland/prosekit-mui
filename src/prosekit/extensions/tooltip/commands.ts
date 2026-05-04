import { addMark, defineCommands, removeMark, toggleMark } from 'prosekit/core'

import type { TooltipCommandsExtension } from './types'

export function defineTooltipCommands(): TooltipCommandsExtension {
  return defineCommands({
    setTooltip: (tooltip: string) =>
      addMark({
        type: 'tooltip',
        attrs: { tooltip },
      }),
    toggleTooltip: (tooltip?: string) =>
      toggleMark({
        type: 'tooltip',
        attrs: { tooltip: tooltip ?? '' },
      }),
    unsetTooltip: () =>
      removeMark({
        type: 'tooltip',
      }),
  }) as TooltipCommandsExtension
}
