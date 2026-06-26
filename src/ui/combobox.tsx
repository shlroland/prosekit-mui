import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { useRef, type ComponentProps, type ComponentPropsWithRef } from 'react'

import { ArrowDownSLineIcon } from '../icons/arrow-down-s-line-icon'
import { CheckboxCircleLineIcon } from '../icons/checkbox-circle-line-icon'
import { CloseCircleFillIcon } from '../icons/close-circle-fill-icon'
import { cn } from '../utils/cn'

export const Combobox = BaseCombobox.Root

export type ComboboxValueProps = ComponentProps<typeof BaseCombobox.Value>

export function ComboboxValue(props: ComboboxValueProps) {
  return <BaseCombobox.Value data-slot="combobox-value" {...props} />
}

export type ComboboxTriggerProps = ComponentProps<typeof BaseCombobox.Trigger> & {
  showIcon?: boolean
}

export function ComboboxTrigger({
  className,
  children,
  showIcon = true,
  ...props
}: ComboboxTriggerProps) {
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      className={cn(
        'pk:inline-flex pk:items-center pk:justify-center pk:gap-1.5 pk:outline-none [&_svg]:pk:pointer-events-none [&_svg]:pk:shrink-0',
        className,
      )}
      {...props}
    >
      {children}
      {showIcon ? (
        <ArrowDownSLineIcon className="pk:h-4 pk:w-4 pk:text-[var(--editor-muted-foreground)]" />
      ) : null}
    </BaseCombobox.Trigger>
  )
}

export type ComboboxClearProps = ComponentProps<typeof BaseCombobox.Clear>

export function ComboboxClear({ className, ...props }: ComboboxClearProps) {
  return (
    <BaseCombobox.Clear
      data-slot="combobox-clear"
      className={cn(
        'pk:inline-flex pk:h-6 pk:w-6 pk:items-center pk:justify-center pk:rounded-md pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]',
        className,
      )}
      {...props}
    >
      <CloseCircleFillIcon className="pk:h-3.5 pk:w-3.5" />
    </BaseCombobox.Clear>
  )
}

export type ComboboxInputProps = ComponentProps<typeof BaseCombobox.Input> & {
  showClear?: boolean
}

export function ComboboxInput({
  className,
  showClear = false,
  ...props
}: ComboboxInputProps) {
  return (
    <div
      data-slot="combobox-input-group"
      className="pk:flex pk:h-8 pk:items-center pk:gap-1 pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-2 pk:focus-within:ring-2 pk:focus-within:ring-[var(--editor-ring)]"
    >
      <BaseCombobox.Input
        data-slot="combobox-input"
        className={cn(
          'pk:min-w-0 pk:flex-1 pk:bg-transparent pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:placeholder:text-[var(--editor-muted-foreground)]',
          className,
        )}
        {...props}
      />
      {showClear ? <ComboboxClear /> : null}
    </div>
  )
}

type ComboboxPositionerProps = ComponentProps<typeof BaseCombobox.Positioner>
export type ComboboxContentProps = ComponentProps<typeof BaseCombobox.Popup>
  & Pick<
    ComboboxPositionerProps,
    'align' | 'alignOffset' | 'anchor' | 'side' | 'sideOffset'
  > & {
    positionerClassName?: string
  }

export function ComboboxContent({
  className,
  positionerClassName,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        anchor={anchor}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn('pk:isolate pk:z-[1305] pk:outline-none', positionerClassName)}
      >
        <BaseCombobox.Popup
          data-slot="combobox-content"
          className={cn(
            'pk:relative pk:max-h-[var(--available-height)] pk:w-[var(--anchor-width)] pk:min-w-[240px] pk:max-w-[var(--available-width)] pk:origin-[var(--transform-origin)] pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:text-[var(--editor-foreground)] pk:shadow-[0_12px_32px_rgba(15,23,42,0.16)] pk:outline-none',
            'pk:transition-[opacity,transform] pk:duration-100 data-[ending-style]:pk:scale-[0.98] data-[ending-style]:pk:opacity-0 data-[starting-style]:pk:scale-[0.98] data-[starting-style]:pk:opacity-0',
            className,
          )}
          {...props}
        />
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  )
}

export type ComboboxListProps = ComponentProps<typeof BaseCombobox.List>

export function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <BaseCombobox.List
      data-slot="combobox-list"
      className={cn(
        'pk:max-h-[280px] pk:scroll-py-1 pk:overflow-y-auto pk:overscroll-contain pk:p-1 data-[empty]:pk:p-0',
        className,
      )}
      {...props}
    />
  )
}

export type ComboboxItemProps = ComponentProps<typeof BaseCombobox.Item> & {
  showIndicator?: boolean
}

export function ComboboxItem({
  className,
  children,
  showIndicator = true,
  ...props
}: ComboboxItemProps) {
  return (
    <BaseCombobox.Item
      data-slot="combobox-item"
      className={cn(
        'pk:relative pk:flex pk:min-h-8 pk:w-full pk:cursor-default pk:items-center pk:gap-2 pk:rounded-lg pk:px-2.5 pk:py-1.5 pk:text-left pk:text-[13px] pk:text-[var(--editor-foreground)] pk:outline-none pk:select-none',
        'pk:hover:bg-[var(--editor-muted)] data-[highlighted]:pk:bg-[var(--editor-muted)]',
        'data-[selected]:pk:bg-[var(--editor-primary-soft)] data-[selected]:pk:text-[var(--editor-primary)] data-[selected][data-highlighted]:pk:bg-[var(--editor-primary-soft)]',
        'data-[disabled]:pk:pointer-events-none data-[disabled]:pk:opacity-45',
        className,
      )}
      {...props}
    >
      {children}
      {showIndicator ? (
        <BaseCombobox.ItemIndicator
          data-slot="combobox-item-indicator"
          className="pk:pointer-events-none pk:absolute pk:left-2.5 pk:flex pk:h-4 pk:w-4 pk:items-center pk:justify-center"
        >
          <CheckboxCircleLineIcon className="pk:h-4 pk:w-4" />
        </BaseCombobox.ItemIndicator>
      ) : null}
    </BaseCombobox.Item>
  )
}

export type ComboboxGroupProps = ComponentProps<typeof BaseCombobox.Group>

export function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return (
    <BaseCombobox.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

export type ComboboxLabelProps = ComponentProps<typeof BaseCombobox.GroupLabel>

export function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  return (
    <BaseCombobox.GroupLabel
      data-slot="combobox-label"
      className={cn('pk:px-2 pk:py-1.5 pk:text-xs pk:text-[var(--editor-muted-foreground)]', className)}
      {...props}
    />
  )
}

export type ComboboxCollectionProps = ComponentProps<typeof BaseCombobox.Collection>

export function ComboboxCollection(props: ComboboxCollectionProps) {
  return <BaseCombobox.Collection data-slot="combobox-collection" {...props} />
}

export type ComboboxEmptyProps = ComponentProps<typeof BaseCombobox.Empty>

export function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <BaseCombobox.Empty
      data-slot="combobox-empty"
      className={cn(
        'pk:hidden pk:w-full pk:justify-center pk:px-2.5 pk:py-6 pk:text-center pk:text-sm pk:text-[var(--editor-muted-foreground)] data-[empty]:pk:flex',
        className,
      )}
      {...props}
    />
  )
}

export type ComboboxSeparatorProps = ComponentProps<typeof BaseCombobox.Separator>

export function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <BaseCombobox.Separator
      data-slot="combobox-separator"
      className={cn('pk:-mx-1 pk:my-1 pk:h-px pk:bg-[var(--editor-border)]', className)}
      {...props}
    />
  )
}

export type ComboboxChipsProps = ComponentPropsWithRef<typeof BaseCombobox.Chips>

export function ComboboxChips({ className, ...props }: ComboboxChipsProps) {
  return (
    <BaseCombobox.Chips
      data-slot="combobox-chips"
      className={cn(
        'pk:flex pk:min-h-8 pk:flex-wrap pk:items-center pk:gap-1 pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-transparent pk:px-2.5 pk:py-1 pk:text-sm pk:transition-colors pk:focus-within:ring-2 pk:focus-within:ring-[var(--editor-ring)]',
        className,
      )}
      {...props}
    />
  )
}

export type ComboboxChipProps = ComponentProps<typeof BaseCombobox.Chip> & {
  showRemove?: boolean
}

export function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxChipProps) {
  return (
    <BaseCombobox.Chip
      data-slot="combobox-chip"
      className={cn(
        'pk:flex pk:h-5 pk:w-fit pk:items-center pk:justify-center pk:gap-1 pk:rounded-sm pk:bg-[var(--editor-muted)] pk:px-1.5 pk:text-xs pk:font-medium pk:whitespace-nowrap pk:text-[var(--editor-foreground)]',
        className,
      )}
      {...props}
    >
      {children}
      {showRemove ? (
        <BaseCombobox.ChipRemove
          data-slot="combobox-chip-remove"
          className="pk:-mr-1 pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:rounded-sm pk:opacity-50 pk:hover:opacity-100"
        >
          <CloseCircleFillIcon className="pk:h-3 pk:w-3" />
        </BaseCombobox.ChipRemove>
      ) : null}
    </BaseCombobox.Chip>
  )
}

export type ComboboxChipsInputProps = ComponentProps<typeof BaseCombobox.Input>

export function ComboboxChipsInput({
  className,
  ...props
}: ComboboxChipsInputProps) {
  return (
    <BaseCombobox.Input
      data-slot="combobox-chip-input"
      className={cn('pk:min-w-16 pk:flex-1 pk:bg-transparent pk:outline-none', className)}
      {...props}
    />
  )
}

export function useComboboxAnchor() {
  return useRef<HTMLDivElement | null>(null)
}
