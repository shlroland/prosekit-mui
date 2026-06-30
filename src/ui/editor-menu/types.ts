import type { ReactNode } from 'react'

/**
 * Command-shaped menu row.
 *
 * Use this when choosing an item should immediately run an editor command.
 * `selected` is only visual state; command availability still belongs in
 * `disabled` and the caller's `onSelect`.
 */
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

/**
 * Value-shaped menu row.
 *
 * Use this for combobox/select-like menus where the menu represents a current
 * value and can be searched by id, label, description, or keywords.
 */
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
