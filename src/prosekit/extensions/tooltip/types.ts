import type { Extension, Union } from 'prosekit/core'

export type TooltipAttrs = {
  tooltip?: string
}

export type TooltipSpecExtension = Extension<{
  Marks: {
    tooltip: TooltipAttrs
  }
}>

export type TooltipCommandsExtension = Extension<{
  Commands: {
    setTooltip: [string]
    toggleTooltip: [string?]
    unsetTooltip: []
  }
}>

export type TooltipViewExtension = Extension

export type TooltipExtension = Union<
  [TooltipSpecExtension, TooltipCommandsExtension, TooltipViewExtension]
>
