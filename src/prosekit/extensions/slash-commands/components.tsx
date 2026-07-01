import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from 'prosekit/react/autocomplete'
import { useEditor } from 'prosekit/react'
import { useMemo, useState } from 'react'

import {
  EditorSlashMenuItemView,
  editorSlashMenuEmptyClassName,
  editorSlashMenuItemClassName,
  editorSlashMenuPopupClassName,
  editorSlashMenuPopupStyle,
} from '../../../ui'
import { defaultSlashCommandGroups } from './commands'
import './slash-command.css'
import type { SlashCommandGroup, SlashCommandItem } from './types'

const SLASH_COMMAND_REGEX = /(?<!\S)\/([\p{L}\p{N}_-]*)$/u

export type SlashCommandAutocompleteProps = {
  groups?: SlashCommandGroup[]
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function itemSearchText(item: SlashCommandItem) {
  return [
    item.id,
    item.title,
    item.description,
    ...(item.keywords ?? []),
  ].filter(Boolean).join(' ').toLowerCase()
}

function filterGroups(groups: SlashCommandGroup[], query: string) {
  const normalizedQuery = normalizeSearchValue(query)

  if (!normalizedQuery) {
    return groups
  }

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => itemSearchText(item).includes(normalizedQuery)),
    }))
    .filter((group) => group.items.length > 0)
}

function flattenGroups(groups: SlashCommandGroup[]) {
  return groups.flatMap((group) => group.items)
}

export function SlashCommandAutocomplete({
  groups = defaultSlashCommandGroups,
}: SlashCommandAutocompleteProps) {
  const editor = useEditor<any>()
  const [query, setQuery] = useState('')
  const filteredGroups = useMemo(() => filterGroups(groups, query), [groups, query])
  const filteredItems = useMemo(() => flattenGroups(filteredGroups), [filteredGroups])

  return (
    <AutocompleteRoot
      editor={editor}
      regex={SLASH_COMMAND_REGEX}
      filter={() => true}
      onQueryChange={(event) => {
        setQuery(event.detail)
      }}
    >
      <AutocompletePositioner
        className="slash-command-positioner"
        placement="bottom-start"
        offset={{ mainAxis: 8, crossAxis: 0 }}
        overflowPadding={12}
      >
        <AutocompletePopup
          className={editorSlashMenuPopupClassName}
          style={editorSlashMenuPopupStyle}
        >
          {filteredItems.map((item) => (
            <AutocompleteItem
              key={item.id}
              value={item.id}
              className={editorSlashMenuItemClassName}
              onSelect={() => {
                item.command(editor)
              }}
            >
              <EditorSlashMenuItemView item={item} />
            </AutocompleteItem>
          ))}
          <AutocompleteEmpty className={editorSlashMenuEmptyClassName}>
            没有找到匹配的命令
          </AutocompleteEmpty>
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}
