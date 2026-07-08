import { createEditor, union, type NodeJSON } from 'prosekit/core'
import { defineBasicExtension } from 'prosekit/basic'
import { describe, expect, it } from 'vitest'

import {
  defineCharacterCountExtension,
  getCharacterCountState,
} from '../extensions/character-count'
import {
  countStaticCharacters,
  countStaticWords,
  getStaticCharacterCountState,
  getStaticCharacterCountText,
} from './character-count'

const content: NodeJSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world' },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Next line' }],
    },
  ],
}

describe('static renderer character count', () => {
  it('counts static NodeJSON characters and words', () => {
    expect(countStaticCharacters(content)).toBe(20)
    expect(countStaticWords(content)).toBe(4)
  })

  it('returns the same text shape used for word counting', () => {
    expect(getStaticCharacterCountText(content, ' ')).toBe('Hello world Next line')
  })

  it('does not count empty text containers as leaf atoms', () => {
    expect(countStaticCharacters({
      type: 'doc',
      content: [
        { type: 'paragraph' },
      ],
    })).toBe(0)
  })

  it('supports custom counters and limit state', () => {
    const state = getStaticCharacterCountState(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '你好世界' }],
          },
        ],
      },
      {
        limit: 3,
        textCounter: (text) => [...text].length,
        wordCounter: (text) => text.split(/\p{Script=Han}/u).length - 1,
      },
    )

    expect(state).toMatchObject({
      characters: 4,
      words: 4,
      limit: 3,
      remaining: -1,
      isAtLimit: true,
      isOverLimit: true,
    })
  })

  it('matches the editor plugin count for the same NodeJSON', () => {
    const extension = union(
      defineBasicExtension(),
      defineCharacterCountExtension({
        limit: 20,
        textCounter: (text) => [...text].length,
      }),
    )
    const editor = createEditor({
      extension,
      defaultContent: content,
    })
    const options = {
      limit: 20,
      textCounter: (text: string) => [...text].length,
    }

    expect(getStaticCharacterCountState(content, options)).toEqual(
      getCharacterCountState(editor.state),
    )
  })
})
