// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import type { NodeJSON } from 'prosekit/core'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { editorDiff, normalizeEditorDiffInput } from './editor-diff'
import { createStaticDiffDocument, renderEditorDiffHTML, StaticEditorDiffView } from './static-renderer'

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

  it('renders a static HTML diff for NodeJSON documents', () => {
    const html = renderEditorDiffHTML(baseline, current)

    expect(html).toContain('data-static-diff-renderer="true"')
    expect(html).toContain('prosekit-diff-insert')
    expect(html).toContain('brave ')
    expect(html).toContain('prosekit-diff-modify-node')
    expect(html).toContain('style="text-align:center"')
  })

  it('renders a static HTML diff for HTML documents', () => {
    const html = renderEditorDiffHTML(
      '<p>Hello world</p><p>Removed paragraph</p>',
      '<p>Hello brave world</p>',
    )

    expect(html).toContain('prosekit-diff-insert')
    expect(html).toContain('brave ')
    expect(html).toContain('prosekit-diff-delete')
    expect(html).toContain('Removed paragraph')
  })

  it('projects a comparison into a static diff document', () => {
    const diffDoc = createStaticDiffDocument(
      '<p>Hello world</p><p>Removed paragraph</p>',
      '<p>Hello brave world</p>',
    )
    const json = JSON.stringify(diffDoc)

    expect(json).toContain('"type":"diffInsert"')
    expect(json).toContain('"type":"diffDeleteBlock"')
  })

  it('renders a React static diff view', () => {
    const markup = renderToStaticMarkup(
      createElement(StaticEditorDiffView, { oldContent: baseline, newContent: current }),
    )

    expect(markup).toContain('prosekit-static-diff-renderer')
    expect(markup).toContain('prosekit-diff-insert')
  })
})
