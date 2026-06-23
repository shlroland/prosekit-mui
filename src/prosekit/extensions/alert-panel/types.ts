import type { Union } from 'prosekit/core'

import type {
  AlertAttrs,
  AlertCommandsExtension,
  AlertExtension,
  AlertSpecExtension,
  AlertType,
  AlertVariant,
  AlertViewExtension,
} from '../alert'
import type {
  DetailsAttrs,
  DetailsCommandsExtension,
  DetailsExtension,
  DetailsSpecExtension,
  DetailsViewExtension,
} from '../details'

export type { AlertAttrs, AlertType, AlertVariant } from '../alert'
export type { DetailsAttrs } from '../details'

export type AlertPanelSpecExtension = Union<[AlertSpecExtension, DetailsSpecExtension]>

export type AlertPanelCommandsExtension = Union<[AlertCommandsExtension, DetailsCommandsExtension]>

export type AlertPanelViewExtension = Union<[AlertViewExtension, DetailsViewExtension]>

export type AlertPanelExtension = Union<[AlertExtension, DetailsExtension]>
