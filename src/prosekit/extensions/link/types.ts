import type { Extension, Union } from 'prosekit/core'

export interface LinkAttrs {
  href: string
  target?: string | null
  rel?: string | null
  class?: string | null
  title?: string | null
  type?: string | null
  download?: string | null
}

export type LinkSpecExtension = Extension<{
  Nodes: {
    inlineLink: LinkAttrs
    blockLink: LinkAttrs
  }
}>

export type LinkCommandsExtension = Extension<{
  Commands: {
    setInlineLink: [attrs: LinkAttrs]
    toggleInlineLink: [attrs?: LinkAttrs]
    unsetInlineLink: []
    setBlockLink: [attrs: LinkAttrs]
    addLink: [attrs: LinkAttrs]
    removeLink: []
    toggleLink: [attrs: LinkAttrs]
    expandLink: []
  }
}>

export type LinkViewExtension = Extension

export type LinkExtension = Union<
  [LinkSpecExtension, LinkCommandsExtension, LinkViewExtension]
>
