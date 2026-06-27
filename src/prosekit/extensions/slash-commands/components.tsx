import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from 'prosekit/react/autocomplete'
import { useEditor } from 'prosekit/react'
import { useMemo, useState, type CSSProperties } from 'react'

import { SlashCommandMenuItem } from './menu'
import { defaultSlashCommandGroups } from './commands'
import type { SlashCommandGroup, SlashCommandItem } from './types'

import './view.css'

const SLASH_COMMAND_REGEX = /(?<!\S)\/([\p{L}\p{N}_-]*)$/u

const slashCommandPopupStyle = {
  display: 'block',
  background: 'var(--editor-surface, #ffffff)',
  backgroundColor: 'var(--editor-surface, #ffffff)',
  borderColor: 'var(--editor-border, rgb(15 23 42 / 0.12))',
  color: 'var(--editor-foreground, rgb(15 23 42))',
  boxShadow: '0 18px 48px rgb(15 23 42 / 18%)',
} satisfies CSSProperties

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
  const itemMap = useMemo(() => new Map(filteredItems.map((item) => [item.id, item])), [filteredItems])

  return (
    <AutocompleteRoot
      editor={editor}
      regex={SLASH_COMMAND_REGEX}
      filter={() => true}
      onQueryChange={(event) => {
        setQuery(event.detail)
      }}
      onValueChange={(event) => {
        const item = typeof event.detail === 'string' ? itemMap.get(event.detail) : null
        if (!item) {
          return
        }

        item.command(editor)
      }}
    >
      <AutocompletePositioner
        className="slash-command-positioner"
        placement="bottom-start"
        offset={{ mainAxis: 8, crossAxis: 0 }}
        overflowPadding={12}
      >
        <AutocompletePopup
          className="slash-command-popup pk:z-[1500] pk:w-[340px] pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:text-[var(--editor-foreground)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)] pk:outline-none"
          style={slashCommandPopupStyle}
        >
          {filteredItems.map((item) => (
            <AutocompleteItem
              key={item.id}
              value={item.id}
              className="slash-command-item pk:block pk:cursor-pointer pk:rounded-lg pk:outline-none data-[highlighted]:pk:bg-[var(--editor-muted)]"
            >
              <SlashCommandMenuItem item={item} />
            </AutocompleteItem>
          ))}
          <AutocompleteEmpty className="slash-command-empty pk:flex pk:items-center pk:gap-2 pk:rounded-lg pk:px-3 pk:py-3 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
            没有找到匹配的命令
          </AutocompleteEmpty>
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}
