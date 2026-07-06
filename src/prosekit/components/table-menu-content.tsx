import { type ReactNode } from 'react'

import {
  AlignBottomIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignVerticallyIcon,
  BrushLineIcon,
} from '../../icons'
import {
  EditorAnchoredMenuDivider,
  EditorAnchoredMenuItem,
  EditorAnchoredMenuSectionLabel,
  EditorAnchoredMenuSubmenu,
} from '../../ui'
import {
  backgroundColorPresets,
  getPresetSwatchColor,
  textColorPresets,
} from './color-presets'
import type { TableCellTextAlign, TableCellVerticalAlign } from './table-utils'

type TableMenuActionItemProps = {
  label: string
  icon: ReactNode
  onSelect: () => void
  disabled?: boolean
  selected?: boolean
}

export function TableMenuActionItem({
  label,
  icon,
  onSelect,
  disabled = false,
  selected = false,
}: TableMenuActionItemProps) {
  return (
    <EditorAnchoredMenuItem
      action={{
        key: label,
        label,
        icon,
        disabled,
        selected,
        onSelect,
      }}
    />
  )
}

export const TableMenuDivider = EditorAnchoredMenuDivider

export const TableMenuSectionLabel = EditorAnchoredMenuSectionLabel

type TableSubmenuProps = {
  icon: ReactNode
  label: string
  children: ReactNode
}

function TableSubmenu({ icon, label, children }: TableSubmenuProps) {
  return (
    <EditorAnchoredMenuSubmenu icon={icon} label={label}>
      {children}
    </EditorAnchoredMenuSubmenu>
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
              style={{ backgroundColor: getPresetSwatchColor(preset, 'var(--editor-foreground)') }}
            />
          )}
          onSelect={() => onApplyTextColor(preset.value ?? 'var(--editor-foreground)')}
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
              style={{ backgroundColor: getPresetSwatchColor(preset, 'transparent') }}
            />
          )}
          onSelect={() => onApplyBackgroundColor(preset.value ?? 'transparent')}
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
