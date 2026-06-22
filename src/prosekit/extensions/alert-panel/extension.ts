import { definePlugin, union } from 'prosekit/core'
import type { PlainExtension } from 'prosekit/core'
import { keymap } from 'prosekit/pm/keymap'

import { defineAlertPanelCommands, insertCollapsiblePanel } from './commands'
import { defineAlertPanelNodeView } from './node-view'
import { defineAlertPanelSpec } from './spec'
import type { AlertPanelExtension } from './types'

function defineAlertPanelKeymap(): PlainExtension {
  return definePlugin(keymap({
    'Mod-8': insertCollapsiblePanel('输入面板标题'),
  }))
}

export function defineAlertPanelExtension(): AlertPanelExtension {
  return union(
    defineAlertPanelSpec(),
    defineAlertPanelCommands(),
    ...defineAlertPanelNodeView(),
    defineAlertPanelKeymap(),
  ) as AlertPanelExtension
}
