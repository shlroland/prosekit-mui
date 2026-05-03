import { Box, Menu, MenuItem, Typography } from '@mui/material'
import { ChevronDown } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'

import { cn } from '../utils/cn'
import { getShortcutKeyText } from './get-shortcut-key-text'
import { ToolbarItem } from './toolbar-item'
import './toolbar.css'

export type ToolbarMenuOption<Key extends string = string> = {
  key: Key
  label: ReactNode
  icon: ReactNode
  shortcutKey?: string[]
  disabled?: boolean
}

export type ToolbarMenuProps<Key extends string = string> = {
  tip?: string
  options: ToolbarMenuOption<Key>[]
  selectedKey: Key
  active?: boolean
  disabled?: boolean
  className?: string
  triggerContent?: ReactNode
  onSelect: (key: Key) => void
}

export function ToolbarMenu<Key extends string = string>({
  tip,
  options,
  selectedKey,
  active = false,
  disabled = false,
  className,
  triggerContent,
  onSelect,
}: ToolbarMenuProps<Key>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const selectedOption =
    options.find((option) => option.key === selectedKey) ?? options[0]

  const open = Boolean(anchorEl)

  function handleOpen(event: MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleSelect(key: Key) {
    onSelect(key)
    handleClose()
  }

  if (!selectedOption) {
    return null
  }

  return (
    <>
      <ToolbarItem
        tip={tip}
        content={
          triggerContent ?? (
            <Box className="toolbar-menu-trigger">
              <Box component="span" className="toolbar-menu-trigger-icon">
                {selectedOption.icon}
              </Box>
              <ChevronDown className="toolbar-menu-chevron" strokeWidth={1.85} />
            </Box>
          )
        }
        className={cn(active ? 'tool-active' : undefined, className)}
        disabled={disabled}
        onClick={handleOpen}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            className: 'toolbar-menu-paper',
          },
          list: {
            className: 'toolbar-menu-list',
          },
        }}
      >
        {options.map((option) => {
          const selected = option.key === selectedKey

          return (
            <MenuItem
              key={option.key}
              selected={selected}
              disabled={option.disabled}
              className="toolbar-menu-item"
              onClick={() => handleSelect(option.key)}
            >
              <Box component="span" className="toolbar-menu-item-icon">
                {option.icon}
              </Box>
              <Typography component="span" className="toolbar-menu-item-label">
                {option.label}
              </Typography>
              {option.shortcutKey?.length ? (
                <Typography component="span" className="toolbar-menu-item-shortcut">
                  {getShortcutKeyText(option.shortcutKey)}
                </Typography>
              ) : null}
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
