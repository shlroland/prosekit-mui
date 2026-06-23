import { union } from 'prosekit/core'

import { defineAlertSpec } from '../alert'
import { defineDetailsSpec } from '../details'
import type { AlertPanelSpecExtension } from './types'

export function defineAlertPanelSpec(): AlertPanelSpecExtension {
  return union(
    defineAlertSpec(),
    defineDetailsSpec(),
  ) as AlertPanelSpecExtension
}
