import type { Extension, Union } from 'prosekit/core'

export const MIN_WIDTH = 5
export const MAX_COLUMNS = 10
export const DEFAULT_GAP = '16px'

export type FlipGridAttrs = {
  gap?: string
}

export type FlipGridColumnAttrs = {
  width?: number
}

export type FlipGridSpecExtension = Extension<{
  Nodes: {
    flipGrid: FlipGridAttrs
    flipGridColumn: FlipGridColumnAttrs
  }
}>

export type FlipGridCommandsExtension = Extension<{
  Commands: {
    setFlipGrid: [columns?: number]
  }
}>

export type FlipGridViewExtension = Extension

export type FlipGridExtension = Union<
  [FlipGridSpecExtension, FlipGridCommandsExtension, FlipGridViewExtension]
>
