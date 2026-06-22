import type { Extension, Union } from 'prosekit/core'

export type TooltipAttrs = {
  id?: string | null
  text?: string | null
  tooltip?: string
}

export type AddTooltipOptions = {
  id: string
  text: string
}

export type UpdateTooltipOptions = {
  id: string
  text: string
}

export type TooltipSpecExtension = Extension<{
  Marks: {
    tooltip: TooltipAttrs
  }
}>

export type TooltipCommandsExtension = Extension<{
  Commands: {
    addTooltip: [options: AddTooltipOptions]
    updateTooltip: [options: UpdateTooltipOptions]
    removeTooltip: [id: string]
    setTooltip: [string]
    toggleTooltip: [string?]
    unsetTooltip: []
  }
}>

export type TooltipViewExtension = Extension

export type TooltipExtension = Union<
  [TooltipSpecExtension, TooltipCommandsExtension, TooltipViewExtension]
>
