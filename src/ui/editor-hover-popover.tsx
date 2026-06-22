import { Popover as BasePopover } from '@base-ui/react/popover'
import { type ComponentProps, type ReactElement, type ReactNode, useMemo, useState } from 'react'

import { cn } from '../utils/cn'

type BasePopoverRootProps = ComponentProps<typeof BasePopover.Root>
type BasePopoverPositionerProps = ComponentProps<typeof BasePopover.Positioner>
type BasePopoverPopupProps = ComponentProps<typeof BasePopover.Popup>
type BasePopoverTriggerProps = ComponentProps<typeof BasePopover.Trigger>

export type EditorHoverPopoverProps = {
  children: ReactElement
  content?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  keepOpen?: boolean
  disabled?: boolean
  modal?: BasePopoverRootProps['modal']
  nativeButton?: BasePopoverTriggerProps['nativeButton']
  hoverDelay?: BasePopoverTriggerProps['delay']
  closeDelay?: BasePopoverTriggerProps['closeDelay']
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

export function EditorHoverPopover({
  children,
  content,
  open,
  defaultOpen = false,
  keepOpen = false,
  disabled = false,
  modal = false,
  nativeButton = false,
  hoverDelay = 500,
  closeDelay = 300,
  side = 'top',
  align = 'center',
  sideOffset = 4,
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
}: EditorHoverPopoverProps) {
  const isControlled = open !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)

  const resolvedOpen = useMemo(() => {
    if (disabled || !content) {
      return false
    }

    if (keepOpen) {
      return true
    }

    return isControlled ? Boolean(open) : uncontrolledOpen
  }, [content, disabled, isControlled, keepOpen, open, uncontrolledOpen])

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails: Parameters<NonNullable<BasePopoverRootProps['onOpenChange']>>[1],
  ) {
    const finalOpen = disabled || !content
      ? false
      : keepOpen && !nextOpen
        ? true
        : nextOpen

    if (!isControlled) {
      setUncontrolledOpen(finalOpen)
    }

    onOpenChange?.(finalOpen, eventDetails)
  }

  if (!content || disabled) {
    return children
  }

  return (
    <BasePopover.Root
      open={resolvedOpen}
      modal={modal}
      triggerId={triggerId}
      defaultTriggerId={defaultTriggerId}
      onOpenChange={handleOpenChange}
    >
      <BasePopover.Trigger
        nativeButton={nativeButton}
        openOnHover
        delay={hoverDelay}
        closeDelay={closeDelay}
        render={children}
      />
      <BasePopover.Portal>
        <BasePopover.Positioner
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
