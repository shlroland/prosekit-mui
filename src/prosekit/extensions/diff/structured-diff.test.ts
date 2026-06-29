import { describe, expect, it } from 'vitest'
import type { NodeJSON } from 'prosekit/core'

import { compareDocuments } from './structured-diff'
import type { DiffItem } from './types'

function doc(content: NodeJSON[]): NodeJSON {
  return {
    type: 'doc',
    content,
  }
}

function paragraph(text: string, marks?: NodeJSON['marks']): NodeJSON {
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text,
        ...(marks ? { marks } : {}),
      },
    ],
  }
}

function getTextDiffs(diffs: DiffItem[]) {
  return diffs.filter((diff) => diff.textDiff).map((diff) => ({
    type: diff.type,
    text: diff.textDiff?.text,
    offset: diff.textDiff?.offset,
  }))
}

describe('compareDocuments', () => {
  it('creates character-level insert diffs inside inline containers', () => {
    const comparison = compareDocuments(
      doc([paragraph('Hello world')]),
      doc([paragraph('Hello brave world')]),
    )

    expect(comparison.hasChanges).toBe(true)
    expect(getTextDiffs(comparison.diffs)).toEqual([
      { type: 'insert', text: 'brave ', offset: 6 },
    ])
  })

  it('creates character-level delete diffs anchored in the new text', () => {
    const comparison = compareDocuments(
      doc([paragraph('Hello brave world')]),
      doc([paragraph('Hello world')]),
    )

    expect(getTextDiffs(comparison.diffs)).toEqual([
      { type: 'delete', text: 'brave ', offset: 6 },
    ])
  })

  it('creates mark modify ranges for unchanged text', () => {
    const comparison = compareDocuments(
      doc([paragraph('Hello', [{ type: 'bold' }])]),
      doc([paragraph('Hello', [{ type: 'italic' }])]),
    )

    expect(comparison.diffs).toEqual([
      expect.objectContaining({
        type: 'modify',
        path: [0],
        attrChange: expect.objectContaining({
          key: 'marks',
          fromOffset: 0,
          toOffset: 5,
        }),
      }),
    ])
  })
})
