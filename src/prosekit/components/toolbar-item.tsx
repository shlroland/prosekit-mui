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
          'flex items-center justify-center',
          customComponent ? 'flex-row gap-2' : 'flex-col gap-0',
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
          onClick={onClick}
          className={cn('toolbar-item', className)}
          disabled={disabled}
          {...rest}
        >
          <span
            className="toolbar-item-content inline-flex items-center gap-1"
          >
            {content ? (
              content
            ) : icon ? (
              <span className="toolbar-item-icon">
                {icon}
              </span>
            ) : null}
            {!content && text ? (
              <span className="text-xs font-bold">
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
