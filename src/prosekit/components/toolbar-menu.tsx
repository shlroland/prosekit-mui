import { ChevronDown } from 'lucide-react'
import { type ReactNode } from 'react'

import { EditorDropdownMenu, EditorDropdownMenuCustomItem } from '../../ui'
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
    <EditorDropdownMenu
      trigger={(
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
    >
      {options.map((option) => {
        const selected = option.key === selectedKey

        return (
          <EditorDropdownMenuCustomItem
            key={option.key}
            disabled={option.disabled}
            selected={selected}
            icon={option.icon}
            label={option.label}
            extra={option.shortcutKey?.length ? getShortcutKeyText(option.shortcutKey) : null}
            onSelect={() => handleSelect(option.key)}
          />
        )
      })}
    </EditorDropdownMenu>
  )
}
