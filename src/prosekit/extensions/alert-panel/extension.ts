import { union } from 'prosekit/core'

import { defineAlertExtension } from '../alert'
import { defineDetailsExtension } from '../details'
import type { AlertPanelExtension } from './types'

export function defineAlertPanelExtension(): AlertPanelExtension {
  return union(
    defineAlertExtension(),
    defineDetailsExtension(),
  ) as AlertPanelExtension
}
