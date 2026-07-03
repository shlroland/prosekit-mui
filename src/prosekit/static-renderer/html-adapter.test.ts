// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'

import {
  parseProseKitHTMLToNode,
  parseProseKitHTMLToNodeJSON,
  renderProseKitHTMLFromHTML,
} from './html-adapter'

describe('static renderer HTML adapter', () => {
  it('parses ProseKit HTML into normalized NodeJSON', () => {
    const content = parseProseKitHTMLToNodeJSON(`
      <h2 id="intro" data-toc-id="toc-intro">Intro</h2>
      <p>Hello <span data-font-size="20px" style="font-size: 20px;">large</span></p>
      <div data-node="alert" data-id="alert-1" data-variant="warning" data-type="icon">
        <p>Alert body</p>
      </div>
    `)

    expect(content).toMatchObject({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: {
            level: 2,
            id: 'intro',
            tocId: 'toc-intro',
          },
          content: [{ type: 'text', text: 'Intro' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            {
              type: 'text',
              text: 'large',
              marks: [{ type: 'fontSize', attrs: { size: '20px' } }],
            },
          ],
        },
        {
          type: 'alert',
          attrs: {
            id: 'alert-1',
            variant: 'warning',
            type: 'icon',
          },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Alert body' }],
            },
          ],
        },
      ],
    })
  })

  it('parses ProseKit HTML into a ProseMirror document node', () => {
    const node = parseProseKitHTMLToNode('<p>Hello from HTML</p>')

    expect(node.type.name).toBe('doc')
    expect(node.textContent).toBe('Hello from HTML')
  })

  it('renders saved ProseKit HTML through the static HTML renderer', () => {
    const html = renderProseKitHTMLFromHTML(`
      <p>Hello <span data-type="emoji" data-name="grinning" data-emoji="😀">😀</span></p>
    `)

    expect(html).toContain('class="ProseMirror prosekit-static-renderer"')
    expect(html).toContain('Hello')
    expect(html).toContain('😀')
    expect(html).not.toContain('data-type="emoji"')
  })
})
