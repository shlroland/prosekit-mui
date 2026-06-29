import {
  EditorSlashMenu,
  EditorSlashMenuItemView,
  type EditorSlashMenuProps,
} from '../../../ui'
import type { SlashCommandGroup, SlashCommandItem } from './types'

export type SlashCommandMenuProps = Omit<EditorSlashMenuProps<SlashCommandItem>, 'groups'> & {
  groups: SlashCommandGroup[]
}

export function SlashCommandMenu({ groups }: SlashCommandMenuProps) {
  return <EditorSlashMenu groups={groups} />
}

export function SlashCommandMenuItem({ item }: { item: SlashCommandItem }) {
  return <EditorSlashMenuItemView item={item} />
}
