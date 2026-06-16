import { Separator } from '../../src/ui'
import { CommandButton } from './command-button'
import { StatusChip } from './status-chip'

export function EditorToolbarPreview() {
  return (
    <div className="rounded-[1.5rem] border border-black/8 bg-white/72 p-4 shadow-none md:p-5">
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2 rounded-[1.2rem] border border-black/8 bg-stone-100/90 p-3">
          <CommandButton label="H1" />
          <CommandButton label="Bold" active />
          <CommandButton label="Italic" />
          <CommandButton label="Code" />
          <Separator orientation="vertical" className="mx-1 hidden h-11 md:block" />
          <CommandButton label="Comment" tone="ghost" />
          <CommandButton label="Publish" tone="accent" />
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip label="Draft" />
          <StatusChip label="Synced" tone="success" />
          <StatusChip label="2 suggestions" tone="warning" />
        </div>
        <div className="rounded-[1.2rem] border border-black/8 bg-white p-4">
          <h2 className="mb-2 text-lg font-bold text-neutral-950">
            Article intro
          </h2>
          <textarea
            defaultValue="Tailwind should remain the primary surface language for app components, while Material UI provides primitives, accessibility, and theming hooks."
            rows={4}
            className="w-full resize-y rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-900 outline-none focus:ring-2 focus:ring-[var(--editor-ring)]"
          />
        </div>
      </div>
    </div>
  )
}
