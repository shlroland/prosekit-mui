import { Menu as BaseMenu } from '@base-ui/react/menu'
import type { ComponentProps, ReactElement, ReactNode } from 'react'

import { ArrowDownSLineIcon } from '../../icons/arrow-down-s-line-icon'
import { cn } from '../../utils/cn'
import {
  editorMenuIconClassName,
  editorMenuItemClassName,
  editorMenuSubmenuTriggerClassName,
  editorMenuSurfaceClassName,
} from './classes'
import { EditorMenuDivider, EditorMenuSectionLabel } from './content'
import type { EditorMenuAction } from './types'

type MenuRootProps = ComponentProps<typeof BaseMenu.Root<unknown>>
type MenuTriggerProps = ComponentProps<typeof BaseMenu.Trigger<unknown>>
type MenuPositionerProps = ComponentProps<typeof BaseMenu.Positioner>
type MenuPopupProps = ComponentProps<typeof BaseMenu.Popup>

export type EditorDropdownMenuProps = {
  trigger: ReactElement
  children: ReactNode
  open?: MenuRootProps['open']
  defaultOpen?: MenuRootProps['defaultOpen']
  modal?: MenuRootProps['modal']
  side?: MenuPositionerProps['side']
  align?: MenuPositionerProps['align']
  sideOffset?: MenuPositionerProps['sideOffset']
  alignOffset?: MenuPositionerProps['alignOffset']
  popupClassName?: string
  positionerClassName?: string
  finalFocus?: MenuPopupProps['finalFocus']
  onOpenChange?: MenuRootProps['onOpenChange']
}

export type EditorDropdownMenuCustomItemProps = {
  label: ReactNode
  icon?: ReactNode
  extra?: ReactNode
  disabled?: boolean
  selected?: boolean
  destructive?: boolean
  onSelect: () => void
}

export function EditorDropdownMenu({
  trigger,
  children,
  open,
  defaultOpen,
  modal = false,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  alignOffset = 0,
  popupClassName,
  positionerClassName,
  finalFocus,
  onOpenChange,
}: EditorDropdownMenuProps) {
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen && eventDetails.reason === 'sibling-open') {
          return
        }

        onOpenChange?.(nextOpen, eventDetails)
      }}
    >
      <BaseMenu.Trigger render={trigger as MenuTriggerProps['render']} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn('pk:isolate pk:z-[1500] pk:outline-none', positionerClassName)}
        >
          <BaseMenu.Popup
            finalFocus={finalFocus}
            className={cn(
              editorMenuSurfaceClassName,
              'pk:origin-[var(--transform-origin)] pk:transition-[opacity,transform] pk:duration-100 data-[ending-style]:pk:scale-[0.98] data-[ending-style]:pk:opacity-0 data-[starting-style]:pk:scale-[0.98] data-[starting-style]:pk:opacity-0',
              popupClassName,
            )}
            data-editor-floating
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  )
}

export function EditorDropdownMenuCustomItem({
  label,
  icon,
  extra,
  disabled,
  selected,
  destructive,
  onSelect,
}: EditorDropdownMenuCustomItemProps) {
  return (
    <BaseMenu.Item
      disabled={disabled}
      closeOnClick
      data-selected={selected ? '' : undefined}
      data-destructive={destructive ? '' : undefined}
      className={editorMenuItemClassName}
      onClick={onSelect}
    >
      <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
        {icon}
      </span>
      <span className="pk:min-w-0 pk:truncate">{label}</span>
      <span className="pk:flex pk:min-w-4 pk:items-center pk:justify-end pk:text-[11px] pk:text-[var(--editor-muted-foreground)]">
        {extra}
        {!extra && selected ? <span className="pk:h-1.5 pk:w-1.5 pk:rounded-full pk:bg-[var(--editor-primary)]" /> : null}
      </span>
    </BaseMenu.Item>
  )
}

export function EditorDropdownMenuItem({ action }: { action: EditorMenuAction }) {
  return (
    <BaseMenu.Item
      disabled={action.disabled}
      closeOnClick
      label={action.label}
      data-selected={action.selected ? '' : undefined}
      data-destructive={action.destructive ? '' : undefined}
      className={editorMenuItemClassName}
      onClick={action.onSelect}
    >
      <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
        {action.icon}
      </span>
      <span className="pk:min-w-0 pk:truncate">{action.label}</span>
      <span className="pk:flex pk:min-w-4 pk:items-center pk:justify-end pk:text-[11px] pk:text-[var(--editor-muted-foreground)]">
        {action.extra ?? action.shortcut ?? null}
        {!action.extra && !action.shortcut && action.selected ? <span className="pk:h-1.5 pk:w-1.5 pk:rounded-full pk:bg-[var(--editor-primary)]" /> : null}
      </span>
    </BaseMenu.Item>
  )
}

export function EditorDropdownMenuSubmenu({
  icon,
  label,
  children,
  disabled,
}: {
  icon?: ReactNode
  label: string
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <BaseMenu.SubmenuRoot>
      <BaseMenu.SubmenuTrigger
        disabled={disabled}
        label={label}
        openOnHover
        className={editorMenuSubmenuTriggerClassName}
      >
        <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
          {icon}
        </span>
        <span className="pk:min-w-0 pk:truncate">{label}</span>
        <ArrowDownSLineIcon className={cn(editorMenuIconClassName, 'pk:-rotate-90 pk:text-[var(--editor-muted-foreground)]')} />
      </BaseMenu.SubmenuTrigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          side="right"
          align="start"
          sideOffset={8}
          className="pk:isolate pk:z-[1501] pk:outline-none"
        >
          <BaseMenu.Popup className={editorMenuSurfaceClassName}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.SubmenuRoot>
  )
}

export {
  EditorMenuDivider as EditorDropdownMenuDivider,
  EditorMenuSectionLabel as EditorDropdownMenuSectionLabel,
}
