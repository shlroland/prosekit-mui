import { Tabs } from '@base-ui/react/tabs'
import { useMemo, useState, type ReactNode } from 'react'

import { cn } from '../../../utils/cn'
import { emojiCategories, searchEmojis, type EmojiItem } from './data'

type EmojiPickerBodyProps = {
  query: string
  items: EmojiItem[]
  activeCategory: string
  onActiveCategoryChange: (value: string) => void
  renderItem: (item: EmojiItem) => ReactNode
  className?: string
  gridClassName?: string
  emptyContent?: ReactNode
}

type EmojiEditorCommands = {
  insertEmoji: (attrs: { name: string }) => void
}

export type EmojiPickerPanelProps = {
  onSelect: (item: EmojiItem) => void
  onEscape?: () => void
}

export function insertEmojiCommand(editor: any, name: string) {
  (editor.commands as EmojiEditorCommands).insertEmoji({ name })
}

export function getEmojiPickerItems(query: string, activeCategory: string) {
  if (query.trim()) {
    return searchEmojis(query, 160)
  }

  return emojiCategories.find((category) => category.id === activeCategory)?.items.slice(0, 160) ?? []
}

function EmojiPickerEmpty({ className }: { className?: string }) {
  return (
    <div className={cn(
      'pk:flex pk:flex-col pk:items-center pk:justify-center pk:gap-2 pk:px-4 pk:py-8 pk:text-sm pk:text-[var(--editor-muted-foreground)]',
      className,
    )}
    >
      <span className="pk:text-4xl">😕</span>
      <span>未找到匹配的 emoji</span>
    </div>
  )
}

export function EmojiPickerBody({
  query,
  items,
  activeCategory,
  onActiveCategoryChange,
  renderItem,
  className,
  gridClassName,
  emptyContent,
}: EmojiPickerBodyProps) {
  return (
    <div className={cn('pk:flex pk:flex-col pk:bg-[var(--editor-surface)]', className)} contentEditable={false}>
      {!query.trim() ? (
        <Tabs.Root value={activeCategory} onValueChange={(value) => onActiveCategoryChange(String(value))}>
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
      <div className={cn('pk:grid pk:max-h-[280px] pk:grid-cols-8 pk:gap-1 pk:overflow-y-auto pk:p-2', gridClassName)}>
        {items.length ? items.map(renderItem) : emptyContent ?? <EmojiPickerEmpty className="pk:col-span-8" />}
      </div>
    </div>
  )
}

export function EmojiPickerPanel({ onSelect, onEscape }: EmojiPickerPanelProps) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(emojiCategories[0]?.id ?? '')
  const items = useMemo(() => getEmojiPickerItems(query, activeCategory), [activeCategory, query])

  return (
    <div className="pk:flex pk:w-[320px] pk:max-w-[calc(100vw-2rem)] pk:flex-col pk:bg-[var(--editor-surface)]" contentEditable={false}>
      <div className="pk:border-b pk:border-[var(--editor-border)] pk:p-2">
        <input
          value={query}
          placeholder="搜索 emoji..."
          className="pk:h-9 pk:w-full pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-muted)] pk:px-3 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:placeholder:text-[var(--editor-muted-foreground)] pk:focus:border-[var(--editor-primary)] pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onEscape?.()
            }
          }}
        />
      </div>
      <EmojiPickerBody
        query={query}
        items={items}
        activeCategory={activeCategory}
        onActiveCategoryChange={setActiveCategory}
        gridClassName="pk:max-h-[280px]"
        renderItem={(item) => (
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
        )}
      />
    </div>
  )
}
