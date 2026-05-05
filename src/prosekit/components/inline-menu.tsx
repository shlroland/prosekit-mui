import { Box, IconButton, Paper, Stack } from '@mui/material'
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
import './inline-menu.css'

type InlinePopoverRootProps = ComponentProps<typeof InlinePopoverRoot>
type InlinePopoverPositionerProps = ComponentProps<typeof InlinePopoverPositioner>

export type InlineMenuProps = PropsWithChildren<{
  className?: string
  positionerClassName?: string
  placement?: InlinePopoverPositionerProps['placement']
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
        className={cn('prosekit-inline-menu-positioner', positionerClassName)}
        placement={placement}
      >
        <InlinePopoverPopup className={cn('prosekit-inline-menu-popup', className)}>
          {children}
        </InlinePopoverPopup>
      </InlinePopoverPositioner>
    </InlinePopoverRoot>
  )
}

export function InlineMenuGroup({ className, children }: InlineMenuGroupProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      className={cn('prosekit-inline-menu-group', className)}
    >
      {children}
    </Stack>
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
      <IconButton
        ref={ref}
        size="small"
        aria-label={title}
        title={title}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        className={cn('prosekit-inline-menu-button', active && 'is-active')}
      >
        {children}
      </IconButton>
    )
  },
)

InlineMenuButton.displayName = 'InlineMenuButton'

export function InlineMenuDivider({ className }: InlineMenuDividerProps) {
  return <Box className={cn('prosekit-inline-menu-divider', className)} />
}

export function InlineMenuPanel({ className, children }: InlineMenuPanelProps) {
  return (
    <Paper elevation={0} className={cn('prosekit-inline-menu-panel', className)}>
      {children}
    </Paper>
  )
}
