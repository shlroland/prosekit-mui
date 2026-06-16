import { Menu } from '@base-ui/react/menu'
import { ChevronDown } from 'lucide-react'
import { type ReactNode } from 'react'

import { cn } from '../../utils/cn'
import { getShortcutKeyText } from '../get-shortcut-key-text'
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
  const selectedOption =
    options.find((option) => option.key === selectedKey) ?? options[0]

  function handleSelect(key: Key) {
    onSelect(key)
  }

  if (!selectedOption) {
    return null
  }

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        disabled={disabled}
        render={(
          <ToolbarItem
            tip={tip}
            content={
              triggerContent ?? (
                <span className="toolbar-menu-trigger">
                  <span className="toolbar-menu-trigger-icon">
                    {selectedOption.icon}
                  </span>
                  <ChevronDown className="toolbar-menu-chevron" strokeWidth={1.85} />
                </span>
              )
            }
            className={cn(active ? 'tool-active' : undefined, className)}
            disabled={disabled}
          />
        )}
      />
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={6}>
          <Menu.Popup className="toolbar-menu-paper">
        {options.map((option) => {
          const selected = option.key === selectedKey

          return (
            <Menu.Item
              key={option.key}
              disabled={option.disabled}
              data-selected={selected ? '' : undefined}
              className="toolbar-menu-item"
              onClick={() => handleSelect(option.key)}
            >
              <span className="toolbar-menu-item-icon">
                {option.icon}
              </span>
              <span className="toolbar-menu-item-label">
                {option.label}
              </span>
              {option.shortcutKey?.length ? (
                <span className="toolbar-menu-item-shortcut">
                  {getShortcutKeyText(option.shortcutKey)}
                </span>
              ) : null}
            </Menu.Item>
          )
        })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
