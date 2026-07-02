import {
  forwardRef,
  type MouseEvent,
  type ReactNode,
} from 'react'

import { Button, Tooltip, type ButtonProps } from '../../ui'
import { cn } from '../../utils/cn'
import { getShortcutKeyText } from '../get-shortcut-key-text'
import './inline-menu.css'
import './toolbar.css'

export type EditorMenuButtonSurface = 'toolbar' | 'inline'

export type EditorMenuButtonProps = Omit<
  ButtonProps,
  'aria-label' | 'children' | 'size' | 'title' | 'variant'
> & {
  surface: EditorMenuButtonSurface
  label: string
  tooltip?: ReactNode
  shortcutKey?: string[]
  active?: boolean
  disabled?: boolean
  content?: ReactNode
  icon?: ReactNode
  text?: ReactNode
  preventMouseDownDefault?: boolean
  disableMouseDown?: boolean
}

function EditorMenuButtonTooltipContent({
  label,
  tooltip,
  shortcutKeyText,
}: {
  label: string
  tooltip?: ReactNode
  shortcutKeyText?: string
}) {
  if (!label && !tooltip) {
    return null
  }

  return (
    <>
      <span
        className={cn(
          'pk:flex pk:items-center pk:justify-center',
          tooltip ? 'pk:flex-row pk:gap-2' : 'pk:flex-col pk:gap-0',
        )}
      >
        <span>{label}</span>
        {shortcutKeyText ? (
          <span className="pk:text-xs pk:text-white/70">
            {shortcutKeyText}
          </span>
        ) : null}
      </span>
      {tooltip}
    </>
  )
}

export const EditorMenuButton = forwardRef<HTMLButtonElement, EditorMenuButtonProps>(
  (
    {
      surface,
      label,
      tooltip,
      shortcutKey = [],
      active = false,
      disabled = false,
      content,
      icon,
      text,
      className,
      preventMouseDownDefault = true,
      disableMouseDown = false,
      onMouseDown,
      onClick,
      ...buttonProps
    },
    ref,
  ) => {
    const shortcutKeyText = getShortcutKeyText(shortcutKey)
    const mouseDownHandler = disableMouseDown
      ? undefined
      : preventMouseDownDefault
        ? (event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault()
            onMouseDown?.(event)
          }
        : onMouseDown
    const button = (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label={label}
        title={surface === 'inline' ? label : undefined}
        disabled={disabled}
        onMouseDown={mouseDownHandler}
        onClick={onClick}
        className={cn(
          surface === 'toolbar'
            && 'pk:h-9 pk:min-h-9 pk:min-w-9 pk:rounded-md pk:p-2 pk:normal-case pk:text-[var(--editor-foreground)] pk:hover:bg-[var(--editor-muted)] pk:disabled:text-[var(--editor-muted-foreground)]',
          surface === 'inline'
            && 'prosekit-inline-menu-button pk:h-7 pk:w-7 pk:rounded-md pk:text-[var(--editor-muted-foreground)] pk:transition-colors pk:hover:bg-[color:color-mix(in_srgb,var(--editor-primary)_8%,var(--editor-muted))] pk:hover:text-[var(--editor-foreground)] pk:focus-visible:bg-[color:color-mix(in_srgb,var(--editor-primary)_8%,var(--editor-muted))] pk:focus-visible:text-[var(--editor-foreground)]',
          active && surface === 'toolbar'
            && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)] pk:hover:bg-[var(--editor-primary-soft)]',
          active && surface === 'inline'
            && 'is-active pk:bg-[color:color-mix(in_srgb,var(--editor-primary)_14%,var(--editor-surface))] pk:text-[var(--editor-primary)] pk:hover:bg-[color:color-mix(in_srgb,var(--editor-primary)_18%,var(--editor-surface))] pk:hover:text-[var(--editor-primary)]',
          className,
        )}
        {...buttonProps}
      >
        <span
          className={cn(
            surface === 'toolbar' && 'pk:shrink-0 pk:leading-none',
            'pk:inline-flex pk:items-center pk:gap-1',
          )}
        >
          {content ? (
            content
          ) : icon ? (
            <span
              className={cn(
                surface === 'toolbar'
                  && 'pk:inline-flex pk:h-4 pk:w-4 pk:shrink-0 pk:items-center pk:justify-center pk:[&_svg]:h-full pk:[&_svg]:w-full pk:[&_svg]:stroke-[1.9]',
              )}
            >
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
    )

    if (surface === 'inline') {
      return button
    }

    return (
      <Tooltip
        content={
          <EditorMenuButtonTooltipContent
            label={label}
            tooltip={tooltip}
            shortcutKeyText={shortcutKeyText}
          />
        }
        disabled={!label}
      >
        {button}
      </Tooltip>
    )
  },
)

EditorMenuButton.displayName = 'EditorMenuButton'
