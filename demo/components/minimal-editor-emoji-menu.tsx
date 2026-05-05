import { Smile } from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from 'prosekit/react/autocomplete'
import { useEffect, useState } from 'react'

import {
  defaultEmojiSuggestions,
  emojiAutocompleteRegex,
  searchEmojis,
  type EmojiSearchItem,
} from '../../src/prosekit/extensions'
import type { MinimalEditorExtension } from './minimal-editor-extension'

const maxEmojiResults = 8

function replaceCurrentEmojiQuery(
  editor: Editor<MinimalEditorExtension>,
  emoji: string,
) {
  const { state, view } = editor
  const { empty, $from } = state.selection

  if (!empty) {
    return
  }

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
  const match = emojiAutocompleteRegex.exec(textBefore)

  if (!match) {
    return
  }

  const from = $from.pos - match[0].length
  const to = $from.pos
  const tr = state.tr.replaceWith(from, to, state.schema.text(`${emoji} `))

  view.dispatch(tr.scrollIntoView())
  editor.focus()
}

function getEmojiAutocompleteEnabled(editor: Editor<MinimalEditorExtension>) {
  return !editor.marks.code.isActive() && !editor.nodes.codeBlock.isActive()
}

export function MinimalEditorEmojiMenu() {
  const editor = useEditor<MinimalEditorExtension>()
  const enabled = useEditorDerivedValue(getEmojiAutocompleteEnabled)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<EmojiSearchItem[]>(
    defaultEmojiSuggestions.slice(0, maxEmojiResults),
  )

  useEffect(() => {
    let cancelled = false

    void searchEmojis(query, maxEmojiResults).then((result) => {
      if (!cancelled) {
        setItems(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <AutocompleteRoot
      regex={enabled ? emojiAutocompleteRegex : null}
      onQueryChange={(event) => setQuery(event.detail)}
    >
      <AutocompletePositioner
        placement="bottom-start"
        offset={{
          mainAxis: 10,
          crossAxis: 0,
        }}
      >
        <AutocompletePopup className="emoji-autocomplete-popup">
          <div className="emoji-autocomplete-surface">
            {items.map(({ id, shortcodes, emoji }) => (
              <AutocompleteItem
                key={id}
                value={shortcodes[0]}
                className="emoji-autocomplete-item"
                onSelect={() => replaceCurrentEmojiQuery(editor, emoji)}
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className="truncate font-medium">:{shortcodes[0]}:</span>
              </AutocompleteItem>
            ))}
            <AutocompleteEmpty className="emoji-autocomplete-empty">
              <Smile className="h-4 w-4 shrink-0" strokeWidth={1.9} />
              <span>没有匹配的 emoji</span>
            </AutocompleteEmpty>
          </div>
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}
