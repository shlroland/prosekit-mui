import type { Editor } from 'prosekit/core'
import type { EditorSlashMenuGroup, EditorSlashMenuItem } from '../../../ui'

export type SlashCommandItem = EditorSlashMenuItem & {
  command: (editor: Editor) => void
}

export type SlashCommandGroup = EditorSlashMenuGroup<SlashCommandItem>
