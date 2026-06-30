import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { ArrowDownSLineIcon } from '../../icons/arrow-down-s-line-icon'
import { cn } from '../../utils/cn'
import {
  editorMenuIconClassName,
  editorMenuItemClassName,
  editorMenuQuickActionClassName,
  editorMenuSubmenuTriggerClassName,
  editorMenuSurfaceClassName,
} from './classes'
import type { EditorMenuAction } from './types'

/**
 * Non-floating menu surface.
 *
 * Use this inside an existing floating shell, for example a ProseKit
 * AutocompletePositioner or a custom hover/floating popover. It only supplies
 * the shared menu look; it does not create a Base UI menu root, trigger,
 * portal, focus scope, or outside-click behavior.
 */
export type EditorMenuSurfaceProps = {
  children: ReactNode
  className?: string
}

export function EditorMenuSurface({ children, className }: EditorMenuSurfaceProps) {
  return (
    <div className={cn(editorMenuSurfaceClassName, className)}>
      {children}
    </div>
  )
}

export function EditorMenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="pk:px-2.5 pk:py-1.5 pk:text-[11px] pk:font-medium pk:leading-none pk:text-[var(--editor-muted-foreground)]">
      {children}
    </div>
  )
}

export function EditorMenuDivider() {
  return <div className="pk:my-1 pk:h-px pk:bg-[var(--editor-border)]" />
}

export function EditorMenuCountBadge({ count }: { count: number }) {
  return (
    <span className="pk:flex pk:min-w-5 pk:items-center pk:justify-center pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:px-1 pk:text-[11px] pk:leading-4 pk:text-[var(--editor-muted-foreground)]">
      {count}
    </span>
  )
}

export type EditorMenuItemButtonProps =
  & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>
  & {
    action: EditorMenuAction
  }

/**
 * Plain button version of a menu item.
 *
 * Use this when the parent container already owns keyboard navigation and
 * selection, such as autocomplete content. Use `EditorDropdownMenuItem` or
 * `EditorAnchoredMenuItem` when the parent is a Base UI Menu.
 */
export function EditorMenuItemButton({
  action,
  className,
  onClick,
  onMouseDown,
  ...props
}: EditorMenuItemButtonProps) {
  return (
    <button
      type="button"
      disabled={action.disabled}
      data-selected={action.selected ? '' : undefined}
      data-destructive={action.destructive ? '' : undefined}
      className={cn(editorMenuItemClassName, className)}
      onMouseDown={(event) => {
        event.preventDefault()
        onMouseDown?.(event)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) {
          return
        }
        action.onSelect()
      }}
      {...props}
    >
      <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
        {action.icon}
      </span>
      <span className="pk:min-w-0 pk:truncate">{action.label}</span>
      <span className="pk:flex pk:min-w-4 pk:items-center pk:justify-end pk:text-[11px] pk:text-[var(--editor-muted-foreground)]">
        {action.extra ?? action.shortcut ?? null}
        {!action.extra && !action.shortcut && action.selected ? <span className="pk:h-1.5 pk:w-1.5 pk:rounded-full pk:bg-[var(--editor-primary)]" /> : null}
      </span>
    </button>
  )
}

export function EditorMenuQuickAction({ action }: { action: EditorMenuAction }) {
  return (
    <button
      type="button"
      aria-label={action.label}
      title={action.label}
      disabled={action.disabled}
      className={editorMenuQuickActionClassName}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action.onSelect}
    >
      {action.icon}
    </button>
  )
}

export type EditorMenuSubmenuTriggerButtonProps =
  & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>
  & {
    icon?: ReactNode
    label: string
  }

/**
 * Visual-only submenu trigger row.
 *
 * This is for custom, non-Base-UI submenu implementations. For real Base UI
 * submenus, use `EditorDropdownMenuSubmenu` or `EditorAnchoredMenuSubmenu` so
 * focus, keyboard navigation, and hover stability remain centralized.
 */
export function EditorMenuSubmenuTriggerButton({
  icon,
  label,
  className,
  onPointerDown,
  onMouseDown,
  onClick,
  ...props
}: EditorMenuSubmenuTriggerButtonProps) {
  return (
    <button
      type="button"
      className={cn(editorMenuSubmenuTriggerClassName, className)}
      onPointerDown={(event) => {
        event.preventDefault()
        onPointerDown?.(event)
      }}
      onMouseDown={(event) => {
        event.preventDefault()
        onMouseDown?.(event)
      }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.(event)
      }}
      {...props}
    >
      <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
        {icon}
      </span>
      <span className="pk:min-w-0 pk:truncate">{label}</span>
      <ArrowDownSLineIcon className={cn(editorMenuIconClassName, 'pk:-rotate-90 pk:text-[var(--editor-muted-foreground)]')} />
    </button>
  )
}
