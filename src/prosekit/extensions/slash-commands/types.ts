import type { Editor } from 'prosekit/core'
import type { ReactNode } from 'react'

export type SlashCommandItem = {
  id: string
  title: string
  description?: string
  keywords?: string[]
  icon?: ReactNode
  shortcut?: string
  command: (editor: Editor) => void
}

export type SlashCommandGroup = {
  id: string
  title: string
  items: SlashCommandItem[]
}
