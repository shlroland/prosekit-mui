import { union } from 'prosekit/core'

import { defineAlertCommands } from './commands'
import { defineAlertNodeView } from './node-view'
import { defineAlertSpec } from './spec'
import type { AlertExtension } from './types'

export function defineAlertExtension(): AlertExtension {
  return union(
    defineAlertSpec(),
    defineAlertCommands(),
    defineAlertNodeView(),
  ) as AlertExtension
}
