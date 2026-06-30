import { cn } from '../../utils/cn'

/**
 * Shared editor menu class contracts.
 *
 * Keep floating shell styling here so Base UI menu, combobox menu, table menu,
 * block-handle menu, and non-floating menu content do not drift. These classes
 * intentionally use editor CSS variables instead of app-level shadcn variables,
 * because editor popups often render through portals outside local theme scope.
 */
export const editorMenuSurfaceClassName = cn(
  'pk:z-[1500] pk:min-w-[216px] pk:rounded-xl pk:border pk:border-[var(--editor-border)]',
  'pk:bg-[var(--editor-surface)] pk:p-1 pk:text-[var(--editor-foreground)]',
  'pk:max-h-[min(620px,var(--available-height,620px))] pk:overflow-y-auto',
  'pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)] pk:outline-none',
)

export const editorMenuItemClassName = cn(
  'pk:grid pk:min-h-8 pk:w-full pk:grid-cols-[1rem_minmax(0,1fr)_auto] pk:items-center pk:gap-2',
  'pk:rounded-lg pk:px-2.5 pk:py-1.5 pk:text-left pk:text-[13px] pk:leading-none pk:outline-none',
  'pk:text-[var(--editor-foreground)] pk:transition-colors pk:hover:bg-[var(--editor-muted)] pk:focus-visible:bg-[var(--editor-muted)]',
  'data-[highlighted]:pk:bg-[var(--editor-muted)] data-[disabled]:pk:pointer-events-none data-[disabled]:pk:opacity-40',
  'data-[selected]:pk:bg-[var(--editor-primary-soft)] data-[selected]:pk:text-[var(--editor-primary)]',
  'data-[destructive]:pk:text-[var(--editor-danger,#dc2626)]',
)

export const editorMenuSubmenuTriggerClassName = cn(
  editorMenuItemClassName,
  'pk:grid-cols-[1rem_minmax(0,1fr)_1rem]',
)

export const editorMenuQuickActionClassName = cn(
  'pk:flex pk:h-8 pk:w-8 pk:items-center pk:justify-center pk:rounded-lg pk:border-0 pk:bg-transparent pk:p-0',
  'pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors',
  'pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]',
  'pk:focus-visible:bg-[var(--editor-muted)] pk:focus-visible:text-[var(--editor-foreground)]',
  'disabled:pk:pointer-events-none disabled:pk:opacity-40',
)

export const editorMenuIconClassName = 'pk:h-4 pk:w-4'
