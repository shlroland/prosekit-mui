import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'
import { forwardRef, type MouseEvent, type ReactNode } from 'react'

import { getShortcutKeyText } from './get-shortcut-key-text'
import { cn } from '../utils/cn'
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
      <Stack
        alignItems="center"
        direction={customComponent ? 'row' : 'column'}
        justifyContent="center"
        gap={customComponent ? 1 : 0}
      >
        <Box>{tip}</Box>
        {shortcutKeyText ? (
          <Box className="toolbar-item-shortcut">
            {shortcutKeyText}
          </Box>
        ) : null}
      </Stack>
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
        arrow
        title={
          <ToolbarItemTooltipContent
            tip={tip}
            customComponent={customComponent}
            shortcutKeyText={shortcutKeyText}
          />
        }
      >
        <Box>
          <Button
            ref={ref}
            onClick={onClick}
            className={cn('toolbar-item', className)}
            disabled={disabled}
            {...rest}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              className="toolbar-item-content"
            >
              {content ? (
                content
              ) : icon ? (
                <Box component="span" className="toolbar-item-icon">
                  {icon}
                </Box>
              ) : null}
              {!content && text ? (
                <Typography component="span" variant="caption" fontWeight={700}>
                  {text}
                </Typography>
              ) : null}
            </Stack>
          </Button>
        </Box>
      </Tooltip>
    )
  },
)

ToolbarItem.displayName = 'ToolbarItem'
