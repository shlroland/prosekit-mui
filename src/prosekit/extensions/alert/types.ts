import type { Extension, Union } from 'prosekit/core'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'default'

export type AlertType = 'text' | 'icon'

export type AlertAttrs = {
  id?: string | null
  variant?: AlertVariant
  type?: AlertType
}

export type AlertSpecExtension = Extension<{
  Nodes: {
    alert: AlertAttrs
  }
}>

export type AlertCommandsExtension = Extension<{
  Commands: {
    setAlert: [attrs?: Partial<AlertAttrs>]
    setAlertVariant: [variant: AlertVariant]
    setAlertType: [type: AlertType]
    toggleAlert: [attrs?: Partial<AlertAttrs>]
    insertAlertBox: [variant?: AlertVariant]
  }
}>

export type AlertViewExtension = Extension

export type AlertExtension = Union<
  [AlertSpecExtension, AlertCommandsExtension, AlertViewExtension]
>
