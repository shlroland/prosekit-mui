import {
  MenuItem,
  MenuPopup,
  MenuPositioner,
  MenuSubmenuRoot,
  MenuSubmenuTrigger,
} from 'prosekit/react/menu'
import { type ReactNode } from 'react'

import {
  AlignBottomIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignVerticallyIcon,
  ArrowDownSLineIcon,
  BrushLineIcon,
} from '../../icons'
import { cn } from '../../utils/cn'
import type { TableCellTextAlign, TableCellVerticalAlign } from './table-utils'

type ColorPreset = {
  key: string
  label: string
  value: string
}

const textColorPresets: ColorPreset[] = [
  { key: 'foreground', label: '默认文字', value: 'var(--editor-foreground)' },
  { key: 'blue', label: '蓝色', value: '#2563eb' },
  { key: 'green', label: '绿色', value: '#16a34a' },
  { key: 'amber', label: '琥珀色', value: '#d97706' },
  { key: 'red', label: '红色', value: '#dc2626' },
  { key: 'purple', label: '紫色', value: '#7c3aed' },
]

const backgroundColorPresets: ColorPreset[] = [
  { key: 'transparent', label: '透明背景', value: 'transparent' },
  { key: 'blue-tint', label: '浅蓝', value: '#dbeafe' },
  { key: 'green-tint', label: '浅绿', value: '#dcfce7' },
  { key: 'amber-tint', label: '浅黄', value: '#fef3c7' },
  { key: 'red-tint', label: '浅红', value: '#fee2e2' },
  { key: 'purple-tint', label: '浅紫', value: '#ede9fe' },
]

type TableMenuActionItemProps = {
  label: string
  icon: ReactNode
  onSelect: () => void
  disabled?: boolean
  selected?: boolean
  closeOnSelect?: boolean
  className?: string
}

export function TableMenuActionItem({
  label,
  icon,
  onSelect,
  disabled = false,
  selected = false,
  closeOnSelect = true,
  className,
}: TableMenuActionItemProps) {
  return (
    <MenuItem
      value={label}
      disabled={disabled}
      closeOnSelect={closeOnSelect}
      className={cn(
        'pk:grid pk:min-h-8 pk:grid-cols-[1rem_minmax(0,1fr)_auto] pk:items-center pk:gap-2 pk:rounded-lg pk:px-2.5 pk:py-1.5 pk:text-[13px] pk:leading-none pk:text-[var(--editor-foreground)] pk:outline-none',
        'pk:hover:bg-[var(--editor-muted)]',
        'data-[highlighted]:bg-[var(--editor-muted)]',
        disabled && 'pk:pointer-events-none pk:opacity-40',
        selected && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)]',
        className,
      )}
      onSelect={() => {
        onSelect()
      }}
    >
      <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
        {icon}
      </span>
      <span className="pk:min-w-0 pk:truncate">{label}</span>
      <span />
    </MenuItem>
  )
}

export function TableMenuDivider() {
  return <div className="pk:my-1 pk:h-px pk:bg-[var(--editor-border)]" />
}

export function TableMenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="pk:px-2.5 pk:py-1 pk:text-[11px] pk:font-medium pk:leading-none pk:text-[var(--editor-muted-foreground)]">
      {children}
    </div>
  )
}

type TableSubmenuProps = {
  icon: ReactNode
  label: string
  children: ReactNode
}

function TableSubmenu({ icon, label, children }: TableSubmenuProps) {
  return (
    <MenuSubmenuRoot>
      <MenuSubmenuTrigger
        value={label}
        className={cn(
          'pk:grid pk:min-h-8 pk:grid-cols-[1rem_minmax(0,1fr)_auto] pk:items-center pk:gap-2 pk:rounded-lg pk:px-2.5 pk:py-1.5 pk:text-[13px] pk:leading-none pk:text-[var(--editor-foreground)] pk:outline-none',
          'pk:hover:bg-[var(--editor-muted)]',
          'data-[highlighted]:bg-[var(--editor-muted)]',
        )}
      >
        <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
          {icon}
        </span>
        <span className="pk:min-w-0 pk:truncate">{label}</span>
        <ArrowDownSLineIcon className="pk:h-4 pk:w-4 pk:rotate-[-90deg] pk:text-[var(--editor-muted-foreground)]" />
      </MenuSubmenuTrigger>
      <MenuPositioner placement="right-start" offset={8} strategy="fixed" hoist>
        <MenuPopup
          className="pk:z-[1406] pk:min-w-[220px] pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:shadow-[0_12px_32px_rgba(15,23,42,0.16)] pk:outline-none"
          data-editor-floating
        >
          {children}
        </MenuPopup>
      </MenuPositioner>
    </MenuSubmenuRoot>
  )
}

type TableColorSubmenuProps = {
  onApplyTextColor: (color: string) => void
  onApplyBackgroundColor: (color: string) => void
}

export function TableColorSubmenu({
  onApplyTextColor,
  onApplyBackgroundColor,
}: TableColorSubmenuProps) {
  return (
    <TableSubmenu
      icon={<BrushLineIcon className="pk:h-4 pk:w-4" />}
      label="颜色"
    >
      <TableMenuSectionLabel>文字颜色</TableMenuSectionLabel>
      {textColorPresets.map((preset) => (
        <TableMenuActionItem
          key={preset.key}
          label={preset.label}
          icon={(
            <span
              className="pk:inline-block pk:h-3.5 pk:w-3.5 pk:rounded-full pk:border pk:border-black/10"
              style={{ backgroundColor: preset.value }}
            />
          )}
          onSelect={() => onApplyTextColor(preset.value)}
        />
      ))}
      <TableMenuDivider />
      <TableMenuSectionLabel>背景颜色</TableMenuSectionLabel>
      {backgroundColorPresets.map((preset) => (
        <TableMenuActionItem
          key={preset.key}
          label={preset.label}
          icon={(
            <span
              className="pk:inline-block pk:h-3.5 pk:w-3.5 pk:rounded-full pk:border pk:border-black/10"
              style={{ backgroundColor: preset.value }}
            />
          )}
          onSelect={() => onApplyBackgroundColor(preset.value)}
        />
      ))}
    </TableSubmenu>
  )
}

type TableAlignSubmenuProps = {
  selectedTextAlign: TableCellTextAlign | null
  selectedVerticalAlign: TableCellVerticalAlign | null
  onApplyTextAlign: (value: TableCellTextAlign) => void
  onApplyVerticalAlign: (value: TableCellVerticalAlign) => void
}

export function TableAlignSubmenu({
  selectedTextAlign,
  selectedVerticalAlign,
  onApplyTextAlign,
  onApplyVerticalAlign,
}: TableAlignSubmenuProps) {
  return (
    <TableSubmenu
      icon={<AlignLeftIcon className="pk:h-4 pk:w-4" />}
      label="对齐方式"
    >
      <TableMenuSectionLabel>水平对齐</TableMenuSectionLabel>
      <TableMenuActionItem
        label="左对齐"
        icon={<AlignLeftIcon className="pk:h-4 pk:w-4" />}
        selected={selectedTextAlign === 'left'}
        onSelect={() => onApplyTextAlign('left')}
      />
      <TableMenuActionItem
        label="居中对齐"
        icon={<AlignCenterIcon className="pk:h-4 pk:w-4" />}
        selected={selectedTextAlign === 'center'}
        onSelect={() => onApplyTextAlign('center')}
      />
      <TableMenuActionItem
        label="右对齐"
        icon={<AlignRightIcon className="pk:h-4 pk:w-4" />}
        selected={selectedTextAlign === 'right'}
        onSelect={() => onApplyTextAlign('right')}
      />
      <TableMenuActionItem
        label="两端对齐"
        icon={<AlignJustifyIcon className="pk:h-4 pk:w-4" />}
        selected={selectedTextAlign === 'justify'}
        onSelect={() => onApplyTextAlign('justify')}
      />
      <TableMenuDivider />
      <TableMenuSectionLabel>垂直对齐</TableMenuSectionLabel>
      <TableMenuActionItem
        label="顶部对齐"
        icon={<AlignTopIcon className="pk:h-4 pk:w-4" />}
        selected={selectedVerticalAlign === 'top'}
        onSelect={() => onApplyVerticalAlign('top')}
      />
      <TableMenuActionItem
        label="垂直居中"
        icon={<AlignVerticallyIcon className="pk:h-4 pk:w-4" />}
        selected={selectedVerticalAlign === 'middle'}
        onSelect={() => onApplyVerticalAlign('middle')}
      />
      <TableMenuActionItem
        label="底部对齐"
        icon={<AlignBottomIcon className="pk:h-4 pk:w-4" />}
        selected={selectedVerticalAlign === 'bottom'}
        onSelect={() => onApplyVerticalAlign('bottom')}
      />
    </TableSubmenu>
  )
}
