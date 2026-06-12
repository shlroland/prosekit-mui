import type { Extension, Union } from 'prosekit/core'

export type InlineLinkDisplayType = 'text' | 'icon'
export type BlockLinkDisplayType = 'block'
export type LinkDisplayType = InlineLinkDisplayType | BlockLinkDisplayType
export type LinkTarget = '_blank' | '_self'

export interface LinkAttrs {
  href: string
  target?: LinkTarget | null
  rel?: string | null
  class?: string | null
  title?: string | null
  type?: LinkDisplayType | null
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
    setLink: [attrs: LinkAttrs]
    updateLink: [attrs: Partial<LinkAttrs>]
    addLink: [attrs: LinkAttrs]
    removeLink: []
    toggleLink: [attrs?: LinkAttrs]
    expandLink: []
  }
}>

export type LinkViewExtension = Extension

export type LinkExtension = Union<
  [LinkSpecExtension, LinkCommandsExtension, LinkViewExtension]
>
