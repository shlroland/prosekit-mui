import type { NodeJSON } from 'prosekit/core'
import { describe, expect, it } from 'vitest'

import { createProseKitEditor } from './create-prose-kit-editor'
import { defineRichTextExtension } from './extensions/rich-text'
import { normalizeNodeJSON } from './normalize-node-json'

const legacyListContent = {
  type: 'doc',
  content: [
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Bullet item' }],
            },
          ],
        },
      ],
    },
    {
      type: 'orderedList',
      attrs: { order: 1 },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Ordered item' }],
            },
          ],
        },
      ],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Task item' }],
            },
          ],
        },
      ],
    },
  ],
} satisfies NodeJSON

describe('normalizeNodeJSON', () => {
  it('migrates legacy nested list json to flat-list nodes', () => {
    expect(normalizeNodeJSON(legacyListContent)).toMatchObject({
      type: 'doc',
      content: [
        {
          type: 'list',
          attrs: { kind: 'bullet' },
        },
        {
          type: 'list',
          attrs: { kind: 'ordered' },
        },
        {
          type: 'list',
          attrs: { kind: 'task', checked: true },
        },
      ],
    })
  })

  it('allows legacy list json to initialize the current editor schema', () => {
    const editor = createProseKitEditor({
      extension: defineRichTextExtension(),
      defaultContent: legacyListContent,
    })

    const json = editor.state.doc.toJSON()
    expect(JSON.stringify(json)).not.toContain('listItem')
    expect(JSON.stringify(json)).not.toContain('taskItem')
    expect(json.content?.map((node: NodeJSON) => node.type)).toEqual(['list', 'list', 'list'])
  })
})
