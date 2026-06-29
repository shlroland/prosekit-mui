export type TableOfContentsHeadingAttrs = {
  level: number
  id?: string | null
  tocId?: string | null
}

export type TableOfContentsItem = {
  id: string
  tocId: string
  level: number
  text: string
  pos: number
}
