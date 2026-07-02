import {
  InlinePopoverPopup,
  InlinePopoverPositioner,
  InlinePopoverRoot,
} from 'prosekit/react/inline-popover'
import {
  type ComponentProps,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
} from 'react'

import { cn } from '../../utils/cn'
import { EditorMenuButton } from './editor-menu-button'
import './inline-menu.css'

type InlinePopoverRootProps = ComponentProps<typeof InlinePopoverRoot>
type InlinePopoverPositionerProps = ComponentProps<typeof InlinePopoverPositioner>

export type InlineMenuProps = PropsWithChildren<{
  className?: string
  positionerClassName?: string
  placement?: InlinePopoverPositionerProps['placement']
  offset?: InlinePopoverPositionerProps['offset']
  defaultOpen?: InlinePopoverRootProps['defaultOpen']
  open?: InlinePopoverRootProps['open']
  disabled?: InlinePopoverRootProps['disabled']
  dismissOnEscape?: InlinePopoverRootProps['dismissOnEscape']
  onOpenChange?: InlinePopoverRootProps['onOpenChange']
}>

export type InlineMenuGroupProps = PropsWithChildren<{
  className?: string
}>

export type InlineMenuButtonProps = {
  active?: boolean
  disabled?: boolean
  title: string
  onClick?: () => void
  children: ReactNode
}

export type InlineMenuDividerProps = {
  className?: string
}

export type InlineMenuPanelProps = PropsWithChildren<{
  className?: string
}>

export function InlineMenu({
  children,
  className,
  positionerClassName,
  placement = 'top',
  offset = 10,
  defaultOpen,
  open,
  disabled,
  dismissOnEscape,
  onOpenChange,
}: InlineMenuProps) {
  return (
    <InlinePopoverRoot
      className="prosekit-inline-menu-root"
      defaultOpen={defaultOpen}
      open={open}
      disabled={disabled}
      dismissOnEscape={dismissOnEscape}
      onOpenChange={onOpenChange}
    >
      <InlinePopoverPositioner
        className={cn(
          'prosekit-inline-menu-positioner pk:z-[1305]',
          positionerClassName,
        )}
        placement={placement}
        offset={offset}
      >
        <InlinePopoverPopup
          className={cn(
            'prosekit-inline-menu-popup pk:inline-flex pk:items-center pk:gap-0.5 pk:whitespace-nowrap pk:rounded-xl pk:border pk:border-[color:color-mix(in_srgb,var(--editor-border)_80%,transparent)] pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_92%,var(--editor-surface-muted))] pk:p-0.5 pk:text-[var(--editor-muted-foreground)] pk:shadow-[0_14px_36px_rgb(15_23_42_/_14%),0_3px_10px_rgb(15_23_42_/_8%)] pk:outline-none pk:backdrop-blur-md',
            className,
          )}
        >
          {children}
        </InlinePopoverPopup>
      </InlinePopoverPositioner>
    </InlinePopoverRoot>
  )
}

export function InlineMenuGroup({ className, children }: InlineMenuGroupProps) {
  return (
    <div
      className={cn('prosekit-inline-menu-group pk:flex pk:items-center pk:gap-0.5', className)}
    >
      {children}
    </div>
  )
}

export const InlineMenuButton = forwardRef<HTMLButtonElement, InlineMenuButtonProps>(
  ({
    active = false,
    disabled = false,
    title,
    onClick,
    children,
  }, ref) => {
    return (
      <EditorMenuButton
        ref={ref}
        surface="inline"
        label={title}
        active={active}
        disabled={disabled}
        icon={children}
        onClick={onClick}
      />
    )
  },
)

InlineMenuButton.displayName = 'InlineMenuButton'

export function InlineMenuDivider({ className }: InlineMenuDividerProps) {
  return <div className={cn('prosekit-inline-menu-divider pk:mx-1 pk:h-4 pk:w-px pk:shrink-0 pk:bg-[color:color-mix(in_srgb,var(--editor-border)_70%,transparent)]', className)} />
}

export function InlineMenuPanel({ className, children }: InlineMenuPanelProps) {
  return (
    <div className={cn('prosekit-inline-menu-panel pk:inline-flex pk:items-center pk:gap-1.5 pk:rounded-lg pk:border pk:border-[color:color-mix(in_srgb,var(--editor-border)_80%,transparent)] pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_92%,var(--editor-surface-muted))] pk:px-2 pk:py-1 pk:text-xs pk:text-[var(--editor-muted-foreground)] pk:shadow-[0_10px_28px_rgb(15_23_42_/_12%)] pk:backdrop-blur-md', className)}>
      {children}
    </div>
  )
}
