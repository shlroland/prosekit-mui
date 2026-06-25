import { useMemo, useState } from 'react'

import { demoContent } from '../components/prosekit-astrobook-demo'
import { MarkdownSourceEditor, renderProseKitMarkdown } from '../../src'
import { PlaygroundShell } from './playground-shell'

function MarkdownSourceEditorStory() {
  const initialMarkdown = useMemo(() => renderProseKitMarkdown(demoContent), [])
  const [value, setValue] = useState(initialMarkdown)

  return (
    <PlaygroundShell
      eyebrow="Markdown"
      title="Source editor"
      copy="CodeMirror markdown source editor seeded from the editor demo JSON."
    >
      <div className="pk:grid pk:gap-4 pk:lg:grid-cols-[minmax(0,1fr)_280px]">
        <MarkdownSourceEditor value={value} onChange={setValue} minHeight={560} />
        <aside className="pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-white pk:p-4 pk:text-sm pk:text-[var(--editor-muted-foreground)] pk:shadow-sm">
          <div className="pk:grid pk:gap-3">
            <div>
              <div className="pk:text-xs pk:font-semibold pk:uppercase pk:tracking-wide">Characters</div>
              <div className="pk:mt-1 pk:text-2xl pk:font-bold pk:text-[var(--editor-foreground)]">{value.length}</div>
            </div>
            <div>
              <div className="pk:text-xs pk:font-semibold pk:uppercase pk:tracking-wide">Lines</div>
              <div className="pk:mt-1 pk:text-2xl pk:font-bold pk:text-[var(--editor-foreground)]">{value.split('\n').length}</div>
            </div>
            <div className="pk:rounded-lg pk:bg-[var(--editor-surface-muted)] pk:p-3 pk:leading-6">
              Edits stay local to this source editor preview. This is a CodeMirror surface, not a ProseMirror editor instance.
            </div>
          </div>
        </aside>
      </div>
    </PlaygroundShell>
  )
}

export default {
  component: MarkdownSourceEditorStory,
}

export const DemoMarkdown = {}

