import { forwardRef, type MouseEvent, type ReactNode } from 'react'

import { EditorMenuButton } from './editor-menu-button'

export type ToolbarItemProps = {
  tip?: string
  customComponent?: ReactNode
  content?: ReactNode
  text?: ReactNode
  shortcutKey?: string[]
  icon?: ReactNode
  className?: string
  active?: boolean
  disabled?: boolean
  preventMouseDownDefault?: boolean
  disableMouseDown?: boolean
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
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
      active,
      disabled,
      preventMouseDownDefault,
      disableMouseDown,
    },
    ref,
  ) => {
    return (
      <EditorMenuButton
        ref={ref}
        surface="toolbar"
        label={tip ?? ''}
        tooltip={customComponent}
        shortcutKey={shortcutKey}
        content={content}
        icon={icon}
        text={text}
        active={active}
        onClick={onClick}
        onMouseDown={onMouseDown}
        className={className}
        disabled={disabled}
        preventMouseDownDefault={preventMouseDownDefault}
        disableMouseDown={disableMouseDown}
      />
    )
  },
)

ToolbarItem.displayName = 'ToolbarItem'
