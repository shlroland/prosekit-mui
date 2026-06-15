import { union } from 'prosekit/core'

import { defineAlertPanelCommands } from './commands'
import { defineAlertPanelNodeView } from './node-view'
import { defineAlertPanelSpec } from './spec'
import type { AlertPanelExtension } from './types'

export function defineAlertPanelExtension(): AlertPanelExtension {
  return union(
    defineAlertPanelSpec(),
    defineAlertPanelCommands(),
    ...defineAlertPanelNodeView(),
  ) as AlertPanelExtension
}
