import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from 'prosekit/react/autocomplete'
import { useEditor, useKeymap } from 'prosekit/react'
import { Priority } from 'prosekit/core'
import { useMemo, useRef, useState, type CSSProperties, type ReactElement } from 'react'

import { EditorEmojiMenuButton } from '../../components/editor-popover-buttons'
import { emojiCategories } from './data'
import { EmojiPickerBody, getEmojiPickerItems, insertEmojiCommand } from './picker'

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

export type EmojiPickerPopoverProps = {
  children: ReactElement
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
  return <EditorEmojiMenuButton icon={children} />
}
