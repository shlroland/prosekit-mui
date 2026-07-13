import { createEditor, union } from 'prosekit/core'
import { defineDoc } from 'prosekit/extensions/doc'
import { defineParagraph } from 'prosekit/extensions/paragraph'
import { defineText } from 'prosekit/extensions/text'
import { SearchQuery } from 'prosemirror-search'
import { describe, expect, it } from 'vitest'

import { getSearchMatches } from './search-replace-panel'

function createTextEditor() {
  return createEditor({
    extension: union(defineDoc(), defineText(), defineParagraph()),
    defaultContent: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'one two one' }],
        },
      ],
    },
  })
}

describe('getSearchMatches', () => {
  it('returns all non-overlapping matches for a valid query', () => {
    const editor = createTextEditor()
    const query = new SearchQuery({ search: 'one' })

    expect(getSearchMatches(editor.state, query).map((match) => [match.from, match.to])).toEqual([
      [1, 4],
      [9, 12],
    ])
  })
})
