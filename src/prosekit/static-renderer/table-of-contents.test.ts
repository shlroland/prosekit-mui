import { describe, expect, it } from 'vitest'
import type { NodeJSON } from 'prosekit/core'

import { getStaticHeadings, getStaticTableOfContents } from './table-of-contents'

const content = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Intro' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Body' }],
    },
    {
      type: 'heading',
      attrs: { level: 2, id: 'Custom Heading', tocId: 'toc-custom' },
      content: [{ type: 'text', text: 'Custom Heading' }],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Intro' }],
    },
  ],
} satisfies NodeJSON

describe('static table of contents', () => {
  it('extracts headings from static content', () => {
    expect(getStaticHeadings(content)).toEqual([
      {
        id: 'intro',
        tocId: 'toc-0-1',
        level: 1,
        text: 'Intro',
        pos: 0,
      },
      {
        id: 'custom-heading',
        tocId: 'toc-custom',
        level: 2,
        text: 'Custom Heading',
        pos: 13,
      },
      {
        id: 'intro-2',
        tocId: 'toc-t-3',
        level: 3,
        text: 'Intro',
        pos: 29,
      },
    ])
  })

  it('filters headings by level while preserving generated ids', () => {
    expect(getStaticHeadings(content, { minLevel: 2, maxLevel: 2 })).toEqual([
      {
        id: 'custom-heading',
        tocId: 'toc-custom',
        level: 2,
        text: 'Custom Heading',
        pos: 13,
      },
    ])
  })

  it('exposes a table-of-contents alias', () => {
    expect(getStaticTableOfContents(content)).toEqual(getStaticHeadings(content))
  })
})
