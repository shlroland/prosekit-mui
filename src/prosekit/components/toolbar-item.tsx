import { forwardRef, type MouseEvent, type ReactNode } from 'react'

import { Button, Tooltip } from '../../ui'
import { cn } from '../../utils/cn'
import { getShortcutKeyText } from '../get-shortcut-key-text'
import './toolbar.css'

export type ToolbarItemProps = {
  tip?: string
  customComponent?: ReactNode
  content?: ReactNode
  text?: ReactNode
  shortcutKey?: string[]
  icon?: ReactNode
  className?: string
  disabled?: boolean
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

function ToolbarItemTooltipContent({
  tip,
  customComponent,
  shortcutKeyText,
}: {
  tip?: string
  customComponent?: ReactNode
  shortcutKeyText?: string
}) {
  if (!tip) {
    return null
  }

  return (
    <>
      <span
        className={cn(
          'pk:flex pk:items-center pk:justify-center',
          customComponent ? 'pk:flex-row pk:gap-2' : 'pk:flex-col pk:gap-0',
        )}
      >
        <span>{tip}</span>
        {shortcutKeyText ? (
          <span className="toolbar-item-shortcut">
            {shortcutKeyText}
          </span>
        ) : null}
      </span>
      {customComponent}
    </>
  )
}

export const ToolbarItem = forwardRef<HTMLButtonElement, ToolbarItemProps>(
  (
    {
      tip,
      customComponent,
      content,
      shortcutKey = [],
      icon,
      text,
      onClick,
      onMouseDown,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const shortcutKeyText = getShortcutKeyText(shortcutKey)

    return (
      <Tooltip
        content={
          <ToolbarItemTooltipContent
            tip={tip}
            customComponent={customComponent}
            shortcutKeyText={shortcutKeyText}
          />
        }
        disabled={!tip}
      >
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onMouseDown={(event) => {
            event.preventDefault()
            onMouseDown?.(event)
          }}
          onClick={onClick}
          className={cn('toolbar-item', className)}
          disabled={disabled}
          {...rest}
        >
          <span
            className="toolbar-item-content pk:inline-flex pk:items-center pk:gap-1"
          >
            {content ? (
              content
            ) : icon ? (
              <span className="toolbar-item-icon">
                {icon}
              </span>
            ) : null}
            {!content && text ? (
              <span className="pk:text-xs pk:font-bold">
                {text}
              </span>
            ) : null}
          </span>
        </Button>
      </Tooltip>
    )
  },
)

ToolbarItem.displayName = 'ToolbarItem'
