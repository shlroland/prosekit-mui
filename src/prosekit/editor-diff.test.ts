// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import type { NodeJSON } from 'prosekit/core'

import { editorDiff, normalizeEditorDiffInput } from './editor-diff'

const baseline = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { textAlign: 'left' },
      content: [{ type: 'text', text: 'Hello world' }],
    },
  ],
} satisfies NodeJSON

const current = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { textAlign: 'center' },
      content: [{ type: 'text', text: 'Hello brave world' }],
    },
  ],
} satisfies NodeJSON

describe('editorDiff', () => {
  it('compares two NodeJSON documents', () => {
    const result = editorDiff(baseline, current)

    expect(result.baseline).toEqual(baseline)
    expect(result.current).toEqual(current)
    expect(result.hasChanges).toBe(true)
    expect(result.diffs.some((diff) => diff.type === 'insert' && diff.textDiff?.text === 'brave ')).toBe(true)
  })

  it('compares two HTML documents', () => {
    const result = editorDiff(
      '<p>Hello world</p>',
      '<p>Hello brave world</p>',
    )

    expect(result.hasChanges).toBe(true)
    expect(result.diffs.some((diff) => diff.textDiff?.text === 'brave ')).toBe(true)
  })

  it('normalizes HTML input into NodeJSON', () => {
    expect(normalizeEditorDiffInput('<p>From HTML</p>')).toMatchObject({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'From HTML' }],
        },
      ],
    })
  })
})
