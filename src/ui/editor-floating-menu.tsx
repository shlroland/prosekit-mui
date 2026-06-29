import type { ReactNode } from 'react'

import {
  EditorComboboxMenu,
  type EditorComboboxMenuProps,
  type EditorMenuOption,
} from './editor-menu'

export type EditorFloatingMenuOption = EditorMenuOption

export type EditorFloatingMenuProps = Omit<
  EditorComboboxMenuProps,
  'getOptionIcon' | 'getOptionMeta' | 'onSelect' | 'options' | 'renderOptionLabel'
> & {
  options: EditorFloatingMenuOption[]
  onSelect: (option: EditorFloatingMenuOption) => void
  getOptionIcon?: (option: EditorFloatingMenuOption, active: boolean) => ReactNode
  getOptionMeta?: (option: EditorFloatingMenuOption) => ReactNode
  renderOptionLabel?: (option: EditorFloatingMenuOption) => ReactNode
}

export function EditorFloatingMenu({
  getOptionIcon,
  getOptionMeta,
  onSelect,
  renderOptionLabel,
  ...props
}: EditorFloatingMenuProps) {
  return (
    <EditorComboboxMenu
      {...props}
      getOptionIcon={getOptionIcon}
      getOptionMeta={getOptionMeta}
      onSelect={onSelect}
      renderOptionLabel={renderOptionLabel}
    />
  )
}
