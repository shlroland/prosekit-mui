import { Popover as BasePopover } from '@base-ui/react/popover'
import { type ComponentProps, type ReactElement, type ReactNode } from 'react'

import { cn } from '../utils/cn'

type BasePopoverRootProps = ComponentProps<typeof BasePopover.Root>
type BasePopoverPositionerProps = ComponentProps<typeof BasePopover.Positioner>
type BasePopoverPopupProps = ComponentProps<typeof BasePopover.Popup>
type BasePopoverTriggerProps = ComponentProps<typeof BasePopover.Trigger>

export type EditorFloatingPopoverProps = {
  children?: ReactElement
  content?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  anchor?: BasePopoverPositionerProps['anchor']
  modal?: BasePopoverRootProps['modal']
  nativeButton?: BasePopoverTriggerProps['nativeButton']
  side?: BasePopoverPositionerProps['side']
  align?: BasePopoverPositionerProps['align']
  sideOffset?: BasePopoverPositionerProps['sideOffset']
  alignOffset?: BasePopoverPositionerProps['alignOffset']
  positionMethod?: BasePopoverPositionerProps['positionMethod']
  collisionBoundary?: BasePopoverPositionerProps['collisionBoundary']
  collisionPadding?: BasePopoverPositionerProps['collisionPadding']
  collisionAvoidance?: BasePopoverPositionerProps['collisionAvoidance']
  sticky?: BasePopoverPositionerProps['sticky']
  disableAnchorTracking?: BasePopoverPositionerProps['disableAnchorTracking']
  initialFocus?: BasePopoverPopupProps['initialFocus']
  finalFocus?: BasePopoverPopupProps['finalFocus']
  triggerId?: BasePopoverRootProps['triggerId']
  defaultTriggerId?: BasePopoverRootProps['defaultTriggerId']
  popupClassName?: string
  positionerClassName?: string
  onOpenChange?: BasePopoverRootProps['onOpenChange']
}

export function EditorFloatingPopover({
  children,
  content,
  open,
  defaultOpen,
  disabled = false,
  anchor,
  modal = false,
  nativeButton = false,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset = 0,
  positionMethod = 'fixed',
  collisionBoundary,
  collisionPadding = 8,
  collisionAvoidance,
  sticky = false,
  disableAnchorTracking = false,
  initialFocus = false,
  finalFocus = false,
  triggerId,
  defaultTriggerId,
  popupClassName,
  positionerClassName,
  onOpenChange,
}: EditorFloatingPopoverProps) {
  if (!content || disabled) {
    return children ?? null
  }

  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      modal={modal}
      triggerId={triggerId}
      defaultTriggerId={defaultTriggerId}
      onOpenChange={onOpenChange}
    >
      {children ? (
        <BasePopover.Trigger nativeButton={nativeButton} render={children} />
      ) : null}
      <BasePopover.Portal>
        <BasePopover.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          positionMethod={positionMethod}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          collisionAvoidance={collisionAvoidance}
          sticky={sticky}
          disableAnchorTracking={disableAnchorTracking}
          className={positionerClassName}
        >
          <BasePopover.Popup
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={cn('pk:z-[1305] pk:outline-none', popupClassName)}
            data-editor-floating
          >
            {content}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}
