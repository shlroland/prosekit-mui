import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'
import 'prosekit/extensions/list/style.css'

import type { NodeJSON } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useEffect, useMemo } from 'react'

import {
  EditorContent,
  EditorShell,
  ProseKitProvider,
  createProseKitEditor,
  defineRichTextExtension,
  getDiffState,
} from '../../src'
import { Button } from '../../src/ui'
import { ClientOnlyStoryFrame } from './client-only-story-frame'

const baselineContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2, textAlign: null },
      content: [{ type: 'text', text: 'Launch checklist' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: 'left' },
      content: [
        {
          type: 'text',
          text: 'Ship the editor demo with link cards and code previews.',
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Add details panels' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Render Mermaid diagrams' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Verify uploads' }],
            },
          ],
        },
      ],
    },
    {
      type: 'blockLink',
      attrs: {
        href: 'https://example.com/spec',
        target: '_blank',
        rel: 'noopener noreferrer',
        class: null,
        title: 'Original implementation brief',
        type: 'block',
        download: null,
      },
    },
  ],
} satisfies NodeJSON

const currentContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2, textAlign: null },
      content: [{ type: 'text', text: 'Launch checklist' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: 'center' },
      content: [
        {
          type: 'text',
          text: 'Ship the polished editor demo with link cards, diff mode, and code previews.',
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Add details panels' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Render Mermaid diagrams with source toggles' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Publish static renderer docs' }],
            },
          ],
        },
      ],
    },
    {
      type: 'blockLink',
      attrs: {
        href: 'https://github.com/prosekit/prosekit',
        target: '_blank',
        rel: 'noopener noreferrer',
        class: null,
        title: 'Updated ProseKit implementation brief',
        type: 'block',
        download: null,
      },
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [
        {
          type: 'text',
          text: 'New release note: static rendering now mirrors editor node views.',
        },
      ],
    },
  ],
} satisfies NodeJSON

function DiffToolbar({ baseline }: { baseline: NodeJSON }) {
  const editor = useEditor<any>() as any
  const snapshot = useEditorDerivedValue<any, string>((currentEditor) => {
    const state = getDiffState(currentEditor.state)
    return JSON.stringify({
      isActive: state.isActive,
      diffCount: state.diffCount,
    })
  })
  const diffState = useMemo(() => JSON.parse(snapshot) as { isActive: boolean; diffCount: number }, [snapshot])

  return (
    <div className="pk:flex pk:flex-wrap pk:items-center pk:justify-between pk:gap-3 pk:border-b pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface-muted)] pk:px-4 pk:py-3">
      <div className="pk:flex pk:flex-wrap pk:items-center pk:gap-2 pk:text-xs pk:text-[var(--editor-muted-foreground)]">
        <span className="pk:inline-flex pk:items-center pk:gap-1">
          <span className="pk:h-2.5 pk:w-2.5 pk:rounded-sm pk:bg-[var(--editor-success,#16a34a)]" />
          Insert
        </span>
        <span className="pk:inline-flex pk:items-center pk:gap-1">
          <span className="pk:h-2.5 pk:w-2.5 pk:rounded-sm pk:bg-[var(--editor-danger,#dc2626)]" />
          Delete
        </span>
        <span className="pk:inline-flex pk:items-center pk:gap-1">
          <span className="pk:h-2.5 pk:w-2.5 pk:rounded-sm pk:bg-[var(--editor-warning,#d97706)]" />
          Modify
        </span>
      </div>
      <div className="pk:flex pk:items-center pk:gap-2">
        <span className="pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)]">
          {diffState.isActive ? `${diffState.diffCount} changes` : 'Diff hidden'}
        </span>
        <Button
          size="sm"
          variant={diffState.isActive ? 'outline' : 'default'}
          onClick={() => {
            ;(editor.commands as any).toggleDiff?.(baseline)
          }}
        >
          {diffState.isActive ? 'Hide diff' : 'Show diff'}
        </Button>
      </div>
    </div>
  )
}

function DiffAutoOpen({ baseline }: { baseline: NodeJSON }) {
  const editor = useEditor<any>() as any

  useEffect(() => {
    ;(editor.commands as any).showDiff?.(baseline)
  }, [baseline, editor])

  return null
}

function DiffDemoSurface() {
  const extension = useMemo(() => defineRichTextExtension({
    placeholder: 'Edit the current document to update the diff.',
  }), [])
  const editor = useMemo(() => createProseKitEditor({
    extension,
    defaultContent: currentContent,
  }), [extension])

  return (
    <ProseKitProvider editor={editor}>
      <div className="pk-mui-theme pk-demo-page">
        <div className="pk:grid pk:gap-4">
          <div className="pk:grid pk:gap-3 pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4 pk:text-sm pk:leading-6 pk:text-[var(--editor-muted-foreground)]">
            <p className="pk:m-0">
              Baseline: shorter paragraph, old block link, and a removed upload checklist item.
            </p>
            <p className="pk:m-0">
              Current: centered paragraph, updated link metadata, inserted release note, and revised checklist items.
            </p>
          </div>
          <EditorShell
            toolbar={<DiffToolbar baseline={baselineContent} />}
            content={<EditorContent className="prosekit-astrobook-editor-content" />}
          />
        </div>
        <DiffAutoOpen baseline={baselineContent} />
      </div>
    </ProseKitProvider>
  )
}

function DiffDemoStory() {
  return (
    <ClientOnlyStoryFrame
      eyebrow="Diff"
      title="Document comparison"
      copy="A focused demo of the ProseKit diff extension comparing the current document against a saved baseline."
      loadingLabel="Loading diff demo..."
    >
      <DiffDemoSurface />
    </ClientOnlyStoryFrame>
  )
}

export default {
  component: DiffDemoStory,
}

export const Default = {}
