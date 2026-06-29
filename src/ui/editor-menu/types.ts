import type { ReactNode } from 'react'

export type EditorMenuAction = {
  key: string
  label: string
  icon?: ReactNode
  shortcut?: string
  extra?: ReactNode
  selected?: boolean
  disabled?: boolean
  destructive?: boolean
  onSelect: () => void
}

export type EditorMenuOption = {
  id: string
  label: string
  description?: string
  keywords?: string[]
  icon?: ReactNode
  meta?: ReactNode
  selected?: boolean
  disabled?: boolean
  destructive?: boolean
}
