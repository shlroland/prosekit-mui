import { createEditor, union } from 'prosekit/core'
import { describe, expect, it } from 'vitest'

import { defineBasicExtension } from '../basic'
import {
  countCharacters,
  countWords,
  defineCharacterCountExtension,
  getCharacterCountState,
  getWordCount,
} from './extension'

function createTextEditor(limit?: number) {
  return createEditor({
    extension: union(
      defineBasicExtension(),
      defineCharacterCountExtension({ limit }),
    ),
    defaultContent: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    },
  })
}

describe('character count extension', () => {
  it('counts characters and words from the document', () => {
    const editor = createTextEditor()

    expect(countCharacters(editor.state.doc)).toBe(11)
    expect(countWords(editor.state.doc)).toBe(2)
    expect(getWordCount(editor.state)).toBe(2)
  })

  it('supports custom text and word counters', () => {
    const editor = createEditor({
      extension: union(
        defineBasicExtension(),
        defineCharacterCountExtension({
          textCounter: (text) => [...text].length,
          wordCounter: (text) => text.split(/\p{Script=Han}/u).length - 1,
        }),
      ),
      defaultContent: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '你好世界' }],
          },
        ],
      },
    })

    expect(getCharacterCountState(editor.state)).toMatchObject({
      characters: 4,
      words: 4,
    })
  })

  it('tracks the configured limit', () => {
    const editor = createTextEditor(11)

    expect(getCharacterCountState(editor.state)).toMatchObject({
      characters: 11,
      limit: 11,
      remaining: 0,
      isAtLimit: true,
      isOverLimit: false,
    })
  })

  it('rejects transactions that would exceed the limit', () => {
    const editor = createTextEditor(11)

    editor.commands.insertContent('!')

    expect(editor.state.doc.textContent).toBe('Hello world')
  })

  it('allows edits that reduce an already oversized document', () => {
    const editor = createTextEditor(5)

    expect(getCharacterCountState(editor.state)).toMatchObject({
      characters: 11,
      isOverLimit: true,
    })

    editor.commands.insertContent('', { from: 11, to: 12 })

    expect(editor.state.doc.textContent).toBe('Hello worl')
  })
})
