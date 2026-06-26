import type { ComponentProps, ReactElement, ReactNode } from 'react'

import { CheckboxCircleLineIcon } from '../icons/checkbox-circle-line-icon'
import { cn } from '../utils/cn'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from './combobox'

type ComboboxRootProps = ComponentProps<typeof Combobox<EditorFloatingMenuOption>>
type ComboboxContentProps = ComponentProps<typeof ComboboxContent>
type ComboboxTriggerProps = ComponentProps<typeof ComboboxTrigger>

export type EditorFloatingMenuOption = {
  id: string
  label: string
  description?: string
  keywords?: string[]
  disabled?: boolean
}

export type EditorFloatingMenuProps = {
  children?: ReactElement
  options: EditorFloatingMenuOption[]
  value?: string
  open?: boolean
  defaultOpen?: boolean
  searchable?: boolean
  searchLabel?: string
  searchPlaceholder?: string
  emptyText?: string
  nativeButton?: ComboboxTriggerProps['nativeButton']
  anchor?: ComboboxContentProps['anchor']
  side?: ComboboxContentProps['side']
  align?: ComboboxContentProps['align']
  sideOffset?: ComboboxContentProps['sideOffset']
  alignOffset?: ComboboxContentProps['alignOffset']
  popupClassName?: string
  positionerClassName?: string
  menuClassName?: string
  listClassName?: string
  closeOnSelect?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect: (option: EditorFloatingMenuOption) => void
  onClose?: () => void
  getOptionIcon?: (option: EditorFloatingMenuOption, active: boolean) => ReactNode
  getOptionMeta?: (option: EditorFloatingMenuOption) => ReactNode
  renderOptionLabel?: (option: EditorFloatingMenuOption) => ReactNode
}

function getSelectedOption(options: EditorFloatingMenuOption[], value?: string) {
  return options.find((option) => option.id === value) ?? null
}

function itemToStringLabel(option: EditorFloatingMenuOption | null) {
  return option?.label ?? ''
}

function itemToStringValue(option: EditorFloatingMenuOption | null) {
  return option?.id ?? ''
}

function isItemEqualToValue(
  itemValue: EditorFloatingMenuOption,
  value: EditorFloatingMenuOption,
) {
  return itemValue.id === value.id
}

function filterOption(option: EditorFloatingMenuOption, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return [
    option.id,
    option.label,
    option.description,
    ...(option.keywords ?? []),
  ].some((value) => value?.toLowerCase().includes(normalizedQuery))
}

export function EditorFloatingMenu({
  children,
  options,
  value,
  open,
  defaultOpen,
  searchable = true,
  searchLabel = '搜索选项',
  searchPlaceholder = '搜索...',
  emptyText = '没有匹配项',
  nativeButton = false,
  anchor,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset,
  popupClassName,
  positionerClassName,
  menuClassName,
  listClassName,
  closeOnSelect = true,
  onOpenChange,
  onSelect,
  onClose,
  getOptionIcon,
  getOptionMeta,
  renderOptionLabel,
}: EditorFloatingMenuProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onClose?.()
    }

    onOpenChange?.(nextOpen)
  }

  function handleValueChange(nextValue: EditorFloatingMenuOption | null) {
    if (!nextValue) {
      return
    }

    onSelect(nextValue)

    if (closeOnSelect) {
      onOpenChange?.(false)
      onClose?.()
    }
  }

  const selectedOption = getSelectedOption(options, value)
  const rootProps: ComboboxRootProps = {
    items: options,
    value: selectedOption,
    open,
    defaultOpen,
    autoHighlight: true,
    itemToStringLabel,
    itemToStringValue,
    isItemEqualToValue,
    filter: filterOption,
    onOpenChange: handleOpenChange,
    onValueChange: handleValueChange,
  }

  return (
    <Combobox {...rootProps}>
      {children ? (
        <ComboboxTrigger
          nativeButton={nativeButton}
          render={children}
          showIcon={false}
        />
      ) : null}
      <ComboboxContent
        anchor={anchor}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        positionerClassName={positionerClassName}
        className={cn('pk:w-[240px]', popupClassName, menuClassName)}
        data-editor-floating
      >
        {searchable ? (
          <div className="pk:p-1">
            <ComboboxInput
              aria-label={searchLabel}
              placeholder={searchPlaceholder}
            />
          </div>
        ) : null}

        <ComboboxEmpty>{emptyText}</ComboboxEmpty>

        <ComboboxList className={listClassName}>
          {(option: EditorFloatingMenuOption, index: number) => {
            const active = option.id === value
            const icon = getOptionIcon?.(option, active)
              ?? (active ? <CheckboxCircleLineIcon className="pk:h-4 pk:w-4" /> : null)
            const meta = getOptionMeta?.(option) ?? option.description ?? option.id

            return (
              <ComboboxItem
                key={option.id}
                value={option}
                index={index}
                disabled={option.disabled}
                className={cn(
                  'pk:grid pk:grid-cols-[1rem_minmax(0,1fr)_auto] pk:pr-2.5',
                  active && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)]',
                )}
                data-active={active ? 'true' : undefined}
                showIndicator={false}
              >
                <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center">
                  {icon}
                </span>
                <span className="pk:truncate">{renderOptionLabel?.(option) ?? option.label}</span>
                {meta ? (
                  <span className="pk:text-[11px] pk:text-[var(--editor-muted-foreground)]">
                    {meta}
                  </span>
                ) : null}
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
