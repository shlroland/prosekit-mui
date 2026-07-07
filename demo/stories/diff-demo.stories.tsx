import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'
import 'prosekit/extensions/list/style.css'

import type { NodeJSON } from 'prosekit/core'

import { EditorDiffView, StaticEditorDiffView, type EditorDiffInput } from '../../src'
import { ClientOnlyStoryFrame } from './client-only-story-frame'

const baselineContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2, textAlign: null },
      content: [{ type: 'text', text: 'Q3 release plan' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: 'left' },
      content: [{ type: 'text', text: 'Ship the editor demo with link cards and static previews.' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [
        { type: 'text', text: 'Read ' },
        {
          type: 'inlineLink',
          attrs: {
            href: 'https://example.com/original-spec',
            target: '_blank',
            rel: 'noopener noreferrer',
            class: null,
            title: 'Original spec',
            type: 'icon',
            download: null,
          },
        },
        { type: 'text', text: ' before publishing the docs.' },
      ],
    },
    {
      type: 'details',
      attrs: { open: false },
      content: [
        {
          type: 'detailsSummary',
          content: [{ type: 'text', text: 'Implementation notes' }],
        },
        {
          type: 'detailsContent',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Keep details panels collapsed in archived exports.' }],
            },
          ],
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
    {
      type: 'paragraph',
      attrs: { textAlign: null },
    },
  ],
} satisfies NodeJSON

const currentContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2, textAlign: null },
      content: [{ type: 'text', text: 'Q3 release plan' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: 'center' },
      content: [{ type: 'text', text: 'Ship the polished editor demo with link cards, static diffs, and node-view parity.' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [
        { type: 'text', text: 'Read ' },
        {
          type: 'inlineLink',
          attrs: {
            href: 'https://github.com/prosekit/prosekit',
            target: '_blank',
            rel: 'noopener noreferrer',
            class: null,
            title: 'Updated ProseKit spec',
            type: 'icon',
            download: null,
          },
        },
        { type: 'text', text: ' before publishing the docs and examples.' },
      ],
    },
    {
      type: 'details',
      attrs: { open: true },
      content: [
        {
          type: 'detailsSummary',
          content: [{ type: 'text', text: 'Implementation notes and QA' }],
        },
        {
          type: 'detailsContent',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'Keep details panels open in previews so static rendering can be inspected.' }],
            },
          ],
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
      type: 'alert',
      attrs: { id: 'diff-alert', variant: 'info', type: 'icon' },
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: 'Static diff is now projected into a renderable document before React rendering.' }],
        },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: "const mode = 'static-diff'\nconsole.log(mode)" }],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'mermaid' },
      content: [{ type: 'text', text: 'graph TD\n  A[JSON or HTML] --> B[Diff document]\n  B --> C[React renderer]' }],
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
      content: [{ type: 'text', text: 'New release note: static rendering now mirrors editor node views.' }],
    },
  ],
} satisfies NodeJSON

const baselineHTML = `
  <h2>Q3 release plan</h2>
  <p style="text-align: left;">Ship the editor demo with link cards and static previews.</p>
  <p>Read <a href="https://example.com/original-spec" target="_blank" rel="noopener noreferrer" title="Original spec" type="icon">Original spec</a> before publishing the docs.</p>
  <details>
    <summary>Implementation notes</summary>
    <p>Keep details panels collapsed in archived exports.</p>
  </details>
  <ul>
    <li><p>Add details panels</p></li>
    <li><p>Render Mermaid diagrams</p></li>
    <li><p>Verify uploads</p></li>
  </ul>
  <a href="https://example.com/spec" target="_blank" rel="noopener noreferrer" title="Original implementation brief" type="block">Original implementation brief</a>
  <p></p>
`

const currentHTML = `
  <h2>Q3 release plan</h2>
  <p style="text-align: center;">Ship the polished editor demo with link cards, static diffs, and node-view parity.</p>
  <p>Read <a href="https://github.com/prosekit/prosekit" target="_blank" rel="noopener noreferrer" title="Updated ProseKit spec" type="icon">Updated ProseKit spec</a> before publishing the docs and examples.</p>
  <details open>
    <summary>Implementation notes and QA</summary>
    <p>Keep details panels open in previews so static rendering can be inspected.</p>
  </details>
  <ul>
    <li><p>Add details panels</p></li>
    <li><p>Render Mermaid diagrams with source toggles</p></li>
    <li><p>Publish static renderer docs</p></li>
  </ul>
  <div data-node="alert" data-variant="info" data-type="icon">
    <p>Static diff is now projected into a renderable document before React rendering.</p>
  </div>
  <pre><code class="language-typescript">const mode = 'static-diff'
console.log(mode)</code></pre>
  <pre><code class="language-mermaid">graph TD
  A[HTML] --> B[Diff document]
  B --> C[React renderer]</code></pre>
  <a href="https://github.com/prosekit/prosekit" target="_blank" rel="noopener noreferrer" title="Updated ProseKit implementation brief" type="block">Updated ProseKit implementation brief</a>
  <p>New release note: static rendering now mirrors editor node views.</p>
`

type DiffDemoStoryProps = {
  oldContent: EditorDiffInput
  newContent: EditorDiffInput
  description: string
}

function DiffDemoSurface({
  oldContent,
  newContent,
  description,
}: DiffDemoStoryProps) {
  return (
    <div className="pk:grid pk:gap-4">
      <div className="pk:grid pk:gap-3 pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4 pk:text-sm pk:leading-6 pk:text-[var(--editor-muted-foreground)]">
        <p className="pk:m-0 pk:font-medium pk:text-[var(--editor-foreground)]">
          {description}
        </p>
        <p className="pk:m-0">
          Baseline: older copy, original inline/block links, collapsed details, a removed checklist item, and an empty paragraph.
        </p>
        <p className="pk:m-0">
          Current: centered copy, updated links, open details, inserted alert/code/Mermaid blocks, and revised checklist items.
        </p>
      </div>
      <EditorDiffView
        oldContent={oldContent}
        newContent={newContent}
        extensionOptions={{ placeholder: 'Edit the current document to update the diff.' }}
        contentClassName="prosekit-astrobook-editor-content"
      />
      <div className="pk:grid pk:gap-3">
        <div className="pk:text-sm pk:font-medium pk:text-[var(--editor-foreground)]">
          Static renderer diff
        </div>
        <div className="pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4">
          <StaticEditorDiffView
            oldContent={oldContent}
            newContent={newContent}
            className="prosekit-astrobook-editor-content"
          />
        </div>
      </div>
    </div>
  )
}

function DiffDemoStory(args: DiffDemoStoryProps) {
  return (
    <ClientOnlyStoryFrame
      eyebrow="Diff"
      title="Document comparison"
      copy="A focused demo of the ProseKit diff extension comparing the current document against a saved baseline."
      loadingLabel="Loading diff demo..."
    >
      <DiffDemoSurface {...args} />
    </ClientOnlyStoryFrame>
  )
}

export default {
  component: DiffDemoStory,
}

export const JsonInput = {
  args: {
    oldContent: baselineContent,
    newContent: currentContent,
    description: 'editorDiff input: two ProseMirror/ProseKit JSON documents.',
  } satisfies DiffDemoStoryProps,
}

export const HtmlInput = {
  args: {
    oldContent: baselineHTML,
    newContent: currentHTML,
    description: 'editorDiff input: two saved HTML strings parsed with the static renderer schema.',
  } satisfies DiffDemoStoryProps,
}
