import { Tabs } from '@base-ui/react/tabs'
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from 'prosekit/react/autocomplete'
import { useEditor, useKeymap } from 'prosekit/react'
import { Priority } from 'prosekit/core'
import { useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { EditorFloatingPopover } from '../../../ui'
import { cn } from '../../../utils/cn'
import { EditorMenuButton } from '../../components/editor-menu-button'
import { emojiCategories, searchEmojis, type EmojiItem } from './data'

const EMOJI_AUTOCOMPLETE_REGEX = /(?<!\S):([a-zA-Z0-9_+-]*)$/u

const emojiAutocompletePopupStyle = {
  display: 'block',
  backgroundColor: 'var(--editor-surface, #ffffff)',
  borderColor: 'var(--editor-border, rgb(15 23 42 / 0.12))',
  color: 'var(--editor-foreground, rgb(15 23 42))',
  boxShadow: '0 18px 48px rgb(15 23 42 / 18%)',
} satisfies CSSProperties

const emojiAutocompleteItemStyle = {
  backgroundColor: 'var(--editor-surface, #ffffff)',
} satisfies CSSProperties

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

export type EmojiPickerPopoverProps = {
  children: ReactElement
}

function insertEmojiCommand(editor: ReturnType<typeof useEditor<any>>, name: string) {
  (editor.commands as EmojiEditorCommands).insertEmoji({ name })
}

function getEmojiPickerItems(query: string, activeCategory: string) {
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

function EmojiPickerBody({
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

export function EmojiAutocomplete() {
  const editor = useEditor<any>()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(emojiCategories[0]?.id ?? '')
  const openRef = useRef(false)
  const queryRef = useRef('')
  const activeCategoryRef = useRef(activeCategory)

  const items = useMemo(() => getEmojiPickerItems(query, activeCategory), [activeCategory, query])
  const keymap = useMemo(() => {
    function changeCategory(direction: 1 | -1) {
      if (!openRef.current || queryRef.current.trim()) {
        return false
      }

      const currentIndex = emojiCategories.findIndex((category) => category.id === activeCategoryRef.current)
      if (currentIndex < 0) {
        return false
      }

      const nextIndex = (currentIndex + direction + emojiCategories.length) % emojiCategories.length
      const nextCategory = emojiCategories[nextIndex]
      if (!nextCategory) {
        return false
      }

      activeCategoryRef.current = nextCategory.id
      setActiveCategory(nextCategory.id)
      return true
    }

    return {
      ArrowRight: () => changeCategory(1),
      ArrowLeft: () => changeCategory(-1),
    }
  }, [])

  useKeymap(keymap, { editor, priority: Priority.highest })

  return (
    <AutocompleteRoot
      editor={editor}
      regex={EMOJI_AUTOCOMPLETE_REGEX}
      filter={() => true}
      onOpenChange={(event) => {
        openRef.current = event.detail
      }}
      onQueryChange={(event) => {
        queryRef.current = event.detail
        setQuery(event.detail)
      }}
    >
      <AutocompletePositioner
        className="emoji-autocomplete-positioner"
        placement="bottom-start"
        offset={{ mainAxis: 6, crossAxis: 0 }}
      >
        <AutocompletePopup
          className="emoji-autocomplete-popup pk:z-[1500] pk:w-[320px] pk:max-w-[calc(100vw-2rem)] pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:text-[var(--editor-foreground)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)] pk:outline-none"
          style={emojiAutocompletePopupStyle}
        >
          <EmojiPickerBody
            query={query}
            items={items}
            activeCategory={activeCategory}
            onActiveCategoryChange={(value) => {
              activeCategoryRef.current = value
              setActiveCategory(value)
            }}
            renderItem={(item) => (
              <AutocompleteItem
                key={item.id}
                value={item.id}
                className="emoji-autocomplete-item pk:flex pk:aspect-square pk:min-h-8 pk:cursor-pointer pk:items-center pk:justify-center pk:rounded-md pk:text-xl pk:leading-none pk:outline-none pk:transition pk:hover:scale-110 pk:hover:bg-[var(--editor-muted)] data-[highlighted]:pk:bg-[var(--editor-muted)]"
                style={emojiAutocompleteItemStyle}
                title={`:${item.id}: ${item.name}`}
                onSelect={() => {
                  insertEmojiCommand(editor, item.id)
                }}
              >
                {item.native}
              </AutocompleteItem>
            )}
            emptyContent={(
              <AutocompleteEmpty className="emoji-autocomplete-empty pk:col-span-8 pk:flex pk:flex-col pk:items-center pk:justify-center pk:gap-2 pk:px-4 pk:py-8 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
                <span className="pk:text-4xl">😕</span>
                <span>未找到匹配的 emoji</span>
              </AutocompleteEmpty>
            )}
          />
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}

export function EmojiPickerPopover({ children }: EmojiPickerPopoverProps) {
  const editor = useEditor<any>()
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(emojiCategories[0]?.id ?? '')

  const items = useMemo(() => getEmojiPickerItems(query, activeCategory), [activeCategory, query])

  function insertEmoji(item: EmojiItem) {
    editor.focus()
    insertEmojiCommand(editor, item.id)
    close()
  }

  function close() {
    setOpen(false)
    setAnchorEl(null)
  }

  return (
    <>
      <EditorMenuButton
        surface="toolbar"
        label="Emoji"
        active={open}
        icon={children}
        onClick={(event) => {
          editor.focus()
          setAnchorEl(event.currentTarget)
          setOpen((current) => !current)
        }}
      />
      <EditorFloatingPopover
        anchor={anchorEl}
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            close()
            return
          }

          setOpen(nextOpen)
        }}
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
                    close()
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
                  onClick={() => insertEmoji(item)}
                >
                  {item.native}
                </button>
              )}
            />
          </div>
        )}
      />
    </>
  )
}
