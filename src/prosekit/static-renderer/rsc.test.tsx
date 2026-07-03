import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { NodeJSON } from 'prosekit/core'

import { renderProseKitRSC } from './rsc'

const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Plain ' },
        {
          type: 'text',
          text: 'tooltip',
          marks: [{ type: 'tooltip', attrs: { id: 'tip-1', text: 'Tooltip text' } }],
        },
      ],
    },
  ],
} satisfies NodeJSON

describe('RSC static renderer', () => {
  it('renders server-safe static React views by default', () => {
    const markup = renderToStaticMarkup(renderProseKitRSC(content))

    expect(markup).toContain('class="ProseMirror prosekit-static-renderer"')
    expect(markup).toContain('Plain')
    expect(markup).toContain('data-tooltip-text="Tooltip text"')
  })

  it('allows callers to provide client islands through mapping overrides', () => {
    function TooltipIsland({
      text,
      children,
    }: {
      text: string
      children: React.ReactNode
    }) {
      return <span data-client-tooltip={text}>{children}</span>
    }

    const markup = renderToStaticMarkup(renderProseKitRSC(content, {
      markMapping: {
        tooltip: ({ mark, children }) => (
          <TooltipIsland text={String(mark.attrs.text ?? '')}>
            {children}
          </TooltipIsland>
        ),
      },
    }))

    expect(markup).toContain('data-client-tooltip="Tooltip text"')
    expect(markup).not.toContain('data-tooltip-text="Tooltip text"')
  })
})
