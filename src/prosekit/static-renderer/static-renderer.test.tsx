import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { NodeJSON } from 'prosekit/core'

import { renderProseKitHTML } from './html-renderer'
import { renderProseKitReact } from './react-renderer'

const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'emoji', attrs: { name: 'grinning', native: '😀' } },
        { type: 'text', text: ' font', marks: [{ type: 'fontFamily', attrs: { family: 'Georgia' } }] },
        { type: 'text', text: ' tooltip', marks: [{ type: 'tooltip', attrs: { id: 'tip-1', text: 'Tip text' } }] },
      ],
    },
    {
      type: 'alert',
      attrs: { id: 'alert-1', variant: 'warning', type: 'icon' },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Alert body' }],
        },
      ],
    },
    {
      type: 'details',
      attrs: { open: true },
      content: [
        {
          type: 'detailsSummary',
          content: [{ type: 'text', text: 'More' }],
        },
        {
          type: 'detailsContent',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Details body' }],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'inlineAttachment',
          attrs: { url: '/files/a.pdf', title: 'a.pdf', size: '2048', type: 'icon' },
        },
        { type: 'text', text: ' ' },
        {
          type: 'inlineLink',
          attrs: { href: 'https://example.com/path', target: '_blank', rel: null, title: 'Example', type: 'icon' },
        },
      ],
    },
    {
      type: 'blockAttachment',
      attrs: { url: '/files/b.pdf', title: 'b.pdf', size: '4096', type: 'block', view: '1', height: 320 },
    },
    {
      type: 'blockLink',
      attrs: { href: 'https://example.org', target: '_blank', rel: null, title: 'Example Org', type: 'block' },
    },
    {
      type: 'image',
      attrs: { src: '/images/a.png', title: 'Image A', align: 'center', width: 640, height: 360 },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Math ' },
        { type: 'mathInline', content: [{ type: 'text', text: 'x^2' }] },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: 'const value = 1' }],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'mermaid' },
      content: [{ type: 'text', text: 'graph TD\n  Start --> End' }],
    },
    {
      type: 'mathBlock',
      attrs: { language: 'tex' },
      content: [{ type: 'text', text: '\\\\int_0^1 x dx' }],
    },
    {
      type: 'excalidraw',
    },
    {
      type: 'excalidraw',
      attrs: { src: '/drawings/a.svg', title: 'Drawing A', width: 720, height: 420 },
    },
    {
      type: 'flipGrid',
      attrs: { gap: '24px' },
      content: [
        {
          type: 'flipGridColumn',
          attrs: { width: 35 },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Left' }],
            },
          ],
        },
        {
          type: 'flipGridColumn',
          attrs: { width: 65 },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Right' }],
            },
          ],
        },
      ],
    },
  ],
} satisfies NodeJSON

describe('static renderer', () => {
  it('renders rich text content to React markup', () => {
    const markup = renderToStaticMarkup(renderProseKitReact(content, {
      baseUrl: 'https://cdn.example.com',
    }))

    expect(markup).toContain('class="ProseMirror prosekit-static-renderer"')
    expect(markup).toContain('😀')
    expect(markup).not.toContain('data-type="emoji"')
    expect(markup).toContain('data-font-family="Georgia"')
    expect(markup).toContain('font-family:Georgia')
    expect(markup).toContain('data-tooltip-text="Tip text"')
    expect(markup).toContain('data-node="alert"')
    expect(markup).toContain('data-variant="warning"')
    expect(markup).toContain('<details')
    expect(markup).toContain('cq-details-toggle')
    expect(markup).toContain("pk:before:content-[&#x27;▶&#x27;]")
    expect(markup).toContain('pk:min-h-6')
    expect(markup).toContain('href="https://cdn.example.com/files/a.pdf"')
    expect(markup).toContain('src="https://cdn.example.com/files/b.pdf"')
    expect(markup).toContain('href="https://example.org"')
    expect(markup).toContain('src="https://cdn.example.com/images/a.png"')
    expect(markup).toContain('prosemirror-math-inline')
    expect(markup).toContain('prosemirror-math-block')
    expect(markup).toContain('katex')
    expect(markup).toContain('prosekit-static-code-block')
    expect(markup).toContain('shiki github-light')
    expect(markup).toContain('style="color:#D73A49"')
    expect(markup).toContain('data-language="typescript"')
    expect(markup).toContain('value')
    expect(markup).toContain('prosekit-static-mermaid')
    expect(markup).toContain('data-static-mermaid-source="true"')
    expect(markup).toContain('<details class="prosekit-static-mermaid-source')
    expect(markup).toContain('Mermaid 源码')
    expect(markup).toContain('<svg')
    expect(markup).toContain('data-type="excalidraw"')
    expect(markup).toContain('src="https://cdn.example.com/drawings/a.svg"')
    expect(markup).toContain('Drawing A')
    expect(markup).not.toContain('Excalidraw 绘图')
    expect(markup).toContain('data-type="flip-grid"')
    expect(markup).toContain('grid-template-columns:minmax(0, 35fr) minmax(0, 65fr)')
  })

  it('renders rich text content to an HTML string', () => {
    const html = renderProseKitHTML(content, {
      baseUrl: 'https://cdn.example.com',
    })

    expect(html).toContain('class="ProseMirror prosekit-static-renderer"')
    expect(html).toContain('😀')
    expect(html).not.toContain('data-type="emoji"')
    expect(html).toContain('data-font-family="Georgia"')
    expect(html).toContain('font-family: Georgia')
    expect(html).toContain('data-tooltip-text="Tip text"')
    expect(html).toContain('data-node="alert"')
    expect(html).toContain('data-variant="warning"')
    expect(html).toContain('<details')
    expect(html).toContain('cq-details-toggle')
    expect(html).toContain("pk:before:content-['▶']")
    expect(html).toContain('pk:min-h-6')
    expect(html).toContain('href="https://cdn.example.com/files/a.pdf"')
    expect(html).toContain('src="https://cdn.example.com/files/b.pdf"')
    expect(html).toContain('href="https://example.org"')
    expect(html).toContain('src="https://cdn.example.com/images/a.png"')
    expect(html).toContain('prosemirror-math-inline')
    expect(html).toContain('prosemirror-math-block')
    expect(html).toContain('katex')
    expect(html).toContain('prosekit-static-code-block')
    expect(html).toContain('shiki github-light')
    expect(html).toContain('style="color:#D73A49"')
    expect(html).toContain('data-language="typescript"')
    expect(html).toContain('value')
    expect(html).toContain('prosekit-static-mermaid')
    expect(html).toContain('data-static-mermaid-source="true"')
    expect(html).toContain('<details class="prosekit-static-mermaid-source')
    expect(html).toContain('Mermaid 源码')
    expect(html).toContain('<svg')
    expect(html).toContain('data-type="excalidraw"')
    expect(html).toContain('src="https://cdn.example.com/drawings/a.svg"')
    expect(html).toContain('Drawing A')
    expect(html).not.toContain('Excalidraw 绘图')
    expect(html).toContain('data-type="flip-grid"')
    expect(html).toContain('grid-template-columns: minmax(0, 35fr) minmax(0, 65fr);')
  })

  it('lets callers override builtin React mappings', () => {
    const markup = renderToStaticMarkup(renderProseKitReact(content, {
      nodeMapping: {
        image: ({ node }) => <strong data-custom-image={String(node.attrs.src)}>custom image</strong>,
      },
    }))

    expect(markup).toContain('data-custom-image="/images/a.png"')
    expect(markup).toContain('custom image')
    expect(markup).not.toContain('Image A')
  })
})
