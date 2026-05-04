import { union } from 'prosekit/core'

import { defineTooltipCommands } from './commands'
import { defineTooltipMarkView } from './mark-view'
import { defineTooltipSpec } from './spec'
import type { TooltipExtension } from './types'

export function defineTooltipExtension(): TooltipExtension {
  return union(
    defineTooltipSpec(),
    defineTooltipCommands(),
    defineTooltipMarkView(),
  ) as TooltipExtension
}
