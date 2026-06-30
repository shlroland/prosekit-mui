import type { CSSProperties, ReactNode } from 'react'

/**
 * Data model for ProseKit slash autocomplete content.
 *
 * This file only owns visual rows and popup styles. ProseKit's autocomplete
 * extension owns positioning, active item state, filtering lifecycle, and
 * keyboard selection.
 */
export type EditorSlashMenuItem = {
  id: string
  title: string
  description?: string
  keywords?: string[]
  icon?: ReactNode
  shortcut?: string
}

export type EditorSlashMenuGroup<TItem extends EditorSlashMenuItem = EditorSlashMenuItem> = {
  id: string
  title: string
  items: TItem[]
}

export const editorSlashMenuPopupStyle = {
  width: 'min(340px, calc(100vw - 24px))',
  maxHeight: 'min(420px, var(--available-height, 420px))',
  overflow: 'hidden',
  backgroundColor: 'var(--editor-surface, #ffffff)',
  borderColor: 'var(--editor-border, rgb(15 23 42 / 0.12))',
  color: 'var(--editor-foreground, rgb(15 23 42))',
  boxShadow: '0 18px 48px rgb(15 23 42 / 18%)',
} satisfies CSSProperties

export const editorSlashMenuPopupClassName = 'slash-command-popup pk:z-[1500] pk:box-border pk:origin-[var(--transform-origin,center)] pk:flex pk:min-h-0 pk:flex-col pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:text-[var(--editor-foreground)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)] pk:outline-none'

export const editorSlashMenuItemClassName = 'slash-command-item pk:block pk:cursor-pointer pk:rounded-lg pk:outline-none pk:transition pk:hover:bg-[var(--editor-muted)] data-[highlighted]:pk:bg-[var(--editor-muted)]'

export const editorSlashMenuEmptyClassName = 'slash-command-empty pk:flex pk:items-center pk:gap-2 pk:rounded-lg pk:px-3 pk:py-3 pk:text-sm pk:text-[var(--editor-muted-foreground)]'

export type EditorSlashMenuProps<TItem extends EditorSlashMenuItem = EditorSlashMenuItem> = {
  groups: EditorSlashMenuGroup<TItem>[]
}

/**
 * Visual content for slash-command autocomplete.
 *
 * Use with ProseKit's AutocompletePositioner. Do not wrap this in
 * `EditorDropdownMenu` or `EditorAnchoredMenu`, because autocomplete already
 * provides the floating container and keyboard navigation.
 */
export function EditorSlashMenu<TItem extends EditorSlashMenuItem = EditorSlashMenuItem>({
  groups,
}: EditorSlashMenuProps<TItem>) {
  return (
    <div className="pk:max-h-[360px] pk:overflow-y-auto pk:overscroll-contain pk:p-1">
      {groups.map((group) => (
        <div key={group.id} className="pk:py-1 first:pk:pt-0 last:pk:pb-0">
          <div className="pk:px-2 pk:py-1 pk:text-[11px] pk:font-semibold pk:uppercase pk:tracking-[0.08em] pk:text-[var(--editor-muted-foreground)]">
            {group.title}
          </div>
          <div className="pk:grid pk:gap-0.5">
            {group.items.map((item) => (
              <EditorSlashMenuItemView key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function EditorSlashMenuItemView({ item }: { item: EditorSlashMenuItem }) {
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
