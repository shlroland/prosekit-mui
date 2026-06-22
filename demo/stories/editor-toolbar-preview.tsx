import { Separator } from '../../src/ui'
import { CommandButton } from './command-button'
import { StatusChip } from './status-chip'

export function EditorToolbarPreview() {
  return (
    <div className="pk:rounded-[1.5rem] pk:border pk:border-black/8 pk:bg-white/72 pk:p-4 pk:shadow-none pk:md:p-5">
      <div className="pk:grid pk:gap-4">
        <div className="pk:flex pk:flex-wrap pk:gap-2 pk:rounded-[1.2rem] pk:border pk:border-black/8 pk:bg-stone-100/90 pk:p-3">
          <CommandButton label="H1" />
          <CommandButton label="Bold" active />
          <CommandButton label="Italic" />
          <CommandButton label="Code" />
          <Separator orientation="vertical" className="pk:mx-1 pk:hidden pk:h-11 pk:md:block" />
          <CommandButton label="Comment" tone="ghost" />
          <CommandButton label="Publish" tone="accent" />
        </div>
        <div className="pk:flex pk:flex-wrap pk:gap-2">
          <StatusChip label="Draft" />
          <StatusChip label="Synced" tone="success" />
          <StatusChip label="2 suggestions" tone="warning" />
        </div>
        <div className="pk:rounded-[1.2rem] pk:border pk:border-black/8 pk:bg-white pk:p-4">
          <h2 className="pk:mb-2 pk:text-lg pk:font-bold pk:text-neutral-950">
            Article intro
          </h2>
          <textarea
            defaultValue="Tailwind should remain the primary surface language for app components, while Material UI provides primitives, accessibility, and theming hooks."
            rows={4}
            className="pk:w-full pk:resize-y pk:rounded-2xl pk:border pk:border-black/10 pk:bg-white pk:px-3 pk:py-2 pk:text-sm pk:leading-6 pk:text-neutral-900 pk:outline-none pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
          />
        </div>
      </div>
    </div>
  )
}
