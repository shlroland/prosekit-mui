import type { SlashCommandGroup, SlashCommandItem } from './types'

export type SlashCommandMenuProps = {
  groups: SlashCommandGroup[]
}

export function SlashCommandMenu({ groups }: SlashCommandMenuProps) {
  return (
    <div className="pk:max-h-[360px] pk:overflow-y-auto pk:overscroll-contain pk:p-1">
      {groups.map((group) => (
        <div key={group.id} className="pk:py-1 first:pk:pt-0 last:pk:pb-0">
          <div className="pk:px-2 pk:py-1 pk:text-[11px] pk:font-semibold pk:uppercase pk:tracking-[0.08em] pk:text-[var(--editor-muted-foreground)]">
            {group.title}
          </div>
          <div className="pk:grid pk:gap-0.5">
            {group.items.map((item) => (
              <SlashCommandMenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SlashCommandMenuItem({ item }: { item: SlashCommandItem }) {
  return (
    <div className="pk:flex pk:min-h-11 pk:items-center pk:gap-3 pk:rounded-lg pk:px-2.5 pk:py-2 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:transition">
      <span className="pk:flex pk:h-7 pk:w-7 pk:shrink-0 pk:items-center pk:justify-center pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-muted)] pk:text-[var(--editor-muted-foreground)]">
        {item.icon}
      </span>
      <span className="pk:min-w-0 pk:flex-1">
        <span className="pk:block pk:truncate pk:font-medium pk:leading-5">
          {item.title}
        </span>
        {item.description ? (
          <span className="pk:block pk:truncate pk:text-xs pk:leading-4 pk:text-[var(--editor-muted-foreground)]">
            {item.description}
          </span>
        ) : null}
      </span>
      {item.shortcut ? (
        <span className="pk:shrink-0 pk:rounded pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-1.5 pk:py-0.5 pk:text-[11px] pk:font-medium pk:text-[var(--editor-muted-foreground)]">
          {item.shortcut}
        </span>
      ) : null}
    </div>
  )
}
