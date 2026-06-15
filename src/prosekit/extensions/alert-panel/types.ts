import type { Extension, Union } from 'prosekit/core'

export type AlertBoxKind = 'info' | 'success' | 'warning' | 'error'

export type AlertBoxAttrs = {
  variant?: AlertBoxKind
}

export type CollapsiblePanelAttrs = {
  open?: boolean
  title?: string
}

export type AlertPanelSpecExtension = Extension<{
  Nodes: {
    alertBox: AlertBoxAttrs
    collapsiblePanel: CollapsiblePanelAttrs
  }
}>

export type AlertPanelCommandsExtension = Extension<{
  Commands: {
    insertAlertBox: [kind?: AlertBoxKind]
    insertCollapsiblePanel: [title?: string]
  }
}>

export type AlertPanelViewExtension = Extension

export type AlertPanelExtension = Union<
  [AlertPanelSpecExtension, AlertPanelCommandsExtension, AlertPanelViewExtension]
>
