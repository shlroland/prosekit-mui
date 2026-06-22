import type { Extension, Union } from 'prosekit/core'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'default'

export type AlertType = 'text' | 'icon'

export type AlertAttrs = {
  id?: string | null
  variant?: AlertVariant
  type?: AlertType
}

export type DetailsAttrs = {
  open?: boolean
}

export type AlertPanelSpecExtension = Extension<{
  Nodes: {
    alert: AlertAttrs
    details: DetailsAttrs
    detailsSummary: Record<string, never>
    detailsContent: Record<string, never>
  }
}>

export type AlertPanelCommandsExtension = Extension<{
  Commands: {
    setAlert: [attrs?: Partial<AlertAttrs>]
    setAlertVariant: [variant: AlertVariant]
    setAlertType: [type: AlertType]
    toggleAlert: [attrs?: Partial<AlertAttrs>]
    setDetails: [title?: string]
    insertAlertBox: [variant?: AlertVariant]
    insertCollapsiblePanel: [title?: string]
  }
}>

export type AlertPanelViewExtension = Extension

export type AlertPanelExtension = Union<
  [AlertPanelSpecExtension, AlertPanelCommandsExtension, AlertPanelViewExtension]
>
