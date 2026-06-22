import { Tabs } from '@base-ui/react/tabs'
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from 'prosekit/react/autocomplete'
import { useEditor } from 'prosekit/react'
import { useMemo, useState, type ReactElement } from 'react'

import { Button, EditorFloatingPopover } from '../../../ui'
import { cn } from '../../../utils/cn'
import { emojiCategories, searchEmojis, type EmojiItem } from './data'

const EMOJI_AUTOCOMPLETE_REGEX = /(?<!\S):([a-zA-Z0-9_+-]*)$/u

type EmojiGridProps = {
  items: EmojiItem[]
  onSelect: (item: EmojiItem) => void
  compact?: boolean
}

type EmojiEditorCommands = {
  insertEmoji: (attrs: { name: string }) => void
}

export type EmojiPickerPopoverProps = {
  children: ReactElement
}

function insertEmojiCommand(editor: ReturnType<typeof useEditor<any>>, name: string) {
  (editor.commands as EmojiEditorCommands).insertEmoji({ name })
}

function EmojiGrid({ items, onSelect, compact = false }: EmojiGridProps) {
  if (!items.length) {
    return (
      <div className="pk:flex pk:flex-col pk:items-center pk:justify-center pk:gap-2 pk:px-4 pk:py-8 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
        <span className="pk:text-4xl">😕</span>
        <span>未找到匹配的 emoji</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'pk:grid pk:grid-cols-8 pk:gap-1',
      compact ? 'pk:p-1' : 'pk:p-2',
    )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="pk:flex pk:aspect-square pk:min-h-8 pk:items-center pk:justify-center pk:rounded-md pk:text-xl pk:leading-none pk:outline-none pk:transition pk:hover:scale-110 pk:hover:bg-[var(--editor-muted)] pk:focus-visible:ring-2 pk:focus-visible:ring-[var(--editor-ring)]"
          title={`:${item.id}: ${item.name}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
        >
          {item.native}
        </button>
      ))}
    </div>
  )
}

export function EmojiAutocomplete() {
  const editor = useEditor<any>()
  const [query, setQuery] = useState('')
  const items = useMemo(() => searchEmojis(query, query ? 100 : 64), [query])

  return (
    <AutocompleteRoot
      editor={editor}
      regex={EMOJI_AUTOCOMPLETE_REGEX}
      filter={() => true}
      onQueryChange={(event) => {
        setQuery(event.detail)
      }}
      onValueChange={(event) => {
        const name = event.detail
        if (typeof name === 'string' && name) {
          insertEmojiCommand(editor, name)
        }
      }}
    >
      <AutocompletePositioner placement="bottom-start" offset={{ mainAxis: 6, crossAxis: 0 }}>
        <AutocompletePopup className="pk:z-[1500] pk:w-[300px] pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)] pk:outline-none">
          {items.map((item) => (
            <AutocompleteItem
              key={item.id}
              value={item.id}
              className="pk:flex pk:cursor-pointer pk:items-center pk:gap-2 pk:rounded-lg pk:px-2.5 pk:py-2 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:transition data-[highlighted]:bg-[var(--editor-muted)]"
            >
              <span className="pk:flex pk:h-6 pk:w-6 pk:items-center pk:justify-center pk:text-xl pk:leading-none">
                {item.native}
              </span>
              <span className="pk:min-w-0 pk:flex-1 pk:truncate">
                :{item.id}:
              </span>
              <span className="pk:truncate pk:text-xs pk:text-[var(--editor-muted-foreground)]">
                {item.name}
              </span>
            </AutocompleteItem>
          ))}
          <AutocompleteEmpty className="pk:flex pk:items-center pk:gap-2 pk:rounded-lg pk:px-2.5 pk:py-2 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
            <span>😕</span>
            未找到匹配的 emoji
          </AutocompleteEmpty>
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}

export function EmojiPickerPopover({ children }: EmojiPickerPopoverProps) {
  const editor = useEditor<any>()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(emojiCategories[0]?.id ?? '')

  const items = useMemo(() => {
    if (query.trim()) {
      return searchEmojis(query, 160)
    }

    return emojiCategories.find((category) => category.id === activeCategory)?.items.slice(0, 160) ?? []
  }, [activeCategory, query])

  function insertEmoji(item: EmojiItem) {
    editor.focus()
    insertEmojiCommand(editor, item.id)
    setOpen(false)
  }

  return (
    <EditorFloatingPopover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      sideOffset={8}
      popupClassName="pk:z-[1500] pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)]"
      content={(
        <div className="pk:flex pk:w-[320px] pk:max-w-[calc(100vw-2rem)] pk:flex-col pk:bg-[var(--editor-surface)]" contentEditable={false}>
          <div className="pk:border-b pk:border-[var(--editor-border)] pk:p-2">
            <input
              value={query}
              placeholder="搜索 emoji..."
              className="pk:h-9 pk:w-full pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-muted)] pk:px-3 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:placeholder:text-[var(--editor-muted-foreground)] pk:focus:border-[var(--editor-primary)] pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setOpen(false)
                }
              }}
            />
          </div>
          {!query.trim() ? (
            <Tabs.Root value={activeCategory} onValueChange={(value) => setActiveCategory(String(value))}>
              <Tabs.List className="pk:flex pk:min-h-9 pk:overflow-x-auto pk:border-b pk:border-[var(--editor-border)]">
                {emojiCategories.map((category) => (
                  <Tabs.Tab
                    key={category.id}
                    value={category.id}
                    className={cn(
                      'pk:flex pk:h-9 pk:shrink-0 pk:items-center pk:justify-center pk:border-b-2 pk:border-transparent pk:px-3 pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors pk:hover:text-[var(--editor-foreground)] pk:focus-visible:ring-2 pk:focus-visible:ring-[var(--editor-ring)]',
                      activeCategory === category.id && 'pk:border-[var(--editor-primary)] pk:text-[var(--editor-primary)]',
                    )}
                  >
                    {category.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.Root>
          ) : null}
          <div className="pk:max-h-[280px] pk:overflow-y-auto">
            <EmojiGrid items={items} onSelect={insertEmoji} />
          </div>
        </div>
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="toolbar-item"
        onMouseDown={(event) => event.preventDefault()}
        aria-label="Emoji"
      >
        {children}
      </Button>
    </EditorFloatingPopover>
  )
}
