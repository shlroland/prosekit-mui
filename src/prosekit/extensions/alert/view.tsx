import { type CSSProperties, type ReactNode } from 'react'
import type { ReactNodeViewProps } from 'prosekit/react'

import {
  CheckboxCircleFillIcon,
  CloseCircleFillIcon,
  ErrorWarningFillIcon,
  Information2FillIcon,
  ScrollToBottomLineIcon,
  TextIcon,
  UserSmileFillIcon,
} from '../../../icons'
import { Button, EditorDropdownMenu, EditorDropdownMenuCustomItem, EditorHoverPopover, Separator, Tooltip } from '../../../ui'
import { cn } from '../../../utils/cn'
import type { AlertType, AlertVariant } from './types'

function normalizeAlertVariant(value: unknown): AlertVariant {
  return value === 'success' || value === 'warning' || value === 'error' || value === 'default'
    ? value
    : 'info'
}

function normalizeAlertType(value: unknown): AlertType {
  return value === 'text' ? 'text' : 'icon'
}

type AlertViewState = {
  icon: typeof Information2FillIcon
  color: string
  borderColor: string
  background: string
}

const alertViewState: Record<AlertVariant, AlertViewState> = {
  info: {
    icon: Information2FillIcon,
    color: 'var(--primary)',
    borderColor: 'var(--primary)',
    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
  },
  warning: {
    icon: ErrorWarningFillIcon,
    color: '#ed6c02',
    borderColor: '#ed6c02',
    background: 'color-mix(in srgb, #ed6c02 10%, transparent)',
  },
  error: {
    icon: CloseCircleFillIcon,
    color: 'var(--destructive)',
    borderColor: 'var(--destructive)',
    background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
  },
  success: {
    icon: CheckboxCircleFillIcon,
    color: '#2e7d32',
    borderColor: '#2e7d32',
    background: 'color-mix(in srgb, #2e7d32 10%, transparent)',
  },
  default: {
    icon: UserSmileFillIcon,
    color: 'var(--editor-muted-foreground)',
    borderColor: 'var(--editor-border)',
    background: 'var(--editor-surface-muted)',
  },
}

type AlertVariantOption = {
  value: AlertVariant
  label: string
  icon: ReactNode
}

type AlertTypeOption = {
  value: AlertType
  label: string
  icon: ReactNode
}

const alertVariantOptions: AlertVariantOption[] = [
  { value: 'info', label: '信息', icon: <Information2FillIcon className="pk:h-4 pk:w-4 pk:text-[var(--primary)]" /> },
  { value: 'success', label: '成功', icon: <CheckboxCircleFillIcon className="pk:h-4 pk:w-4 pk:text-[#2e7d32]" /> },
  { value: 'warning', label: '警告', icon: <ErrorWarningFillIcon className="pk:h-4 pk:w-4 pk:text-[#ed6c02]" /> },
  { value: 'error', label: '错误', icon: <CloseCircleFillIcon className="pk:h-4 pk:w-4 pk:text-[var(--destructive)]" /> },
  { value: 'default', label: '默认', icon: <UserSmileFillIcon className="pk:h-4 pk:w-4 pk:text-[var(--editor-muted-foreground)]" /> },
]

const alertTypeOptions: AlertTypeOption[] = [
  { value: 'text', label: '纯文字', icon: <TextIcon className="pk:h-4 pk:w-4" /> },
  { value: 'icon', label: '图标文字', icon: <ScrollToBottomLineIcon className="pk:h-4 pk:w-4 pk:rotate-90" /> },
]

function AlertToolbarButton({
  active = false,
  label,
  icon,
  onClick,
}: {
  active?: boolean
  label: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <Tooltip content={label}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        className={cn(
          'pk:h-7 pk:w-7 pk:rounded-md pk:text-[var(--editor-muted-foreground)] pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]',
          active && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)]',
        )}
        onClick={onClick}
      >
        {icon}
      </Button>
    </Tooltip>
  )
}

function AlertTypeMenu({
  value,
  onChange,
}: {
  value: AlertType
  onChange: (value: AlertType) => void
}) {
  const selectedOption = alertTypeOptions.find((option) => option.value === value) ?? alertTypeOptions[1]

  if (!selectedOption) {
    return null
  }

  return (
    <EditorDropdownMenu
      trigger={(
        <Button
          variant="ghost"
          size="icon"
          aria-label="展示类型"
          title="展示类型"
          className="pk:h-7 pk:w-7 pk:rounded-md pk:text-[var(--editor-muted-foreground)] pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]"
        >
          {selectedOption.icon}
        </Button>
      )}
      popupClassName="pk:z-[1410] pk:min-w-[136px]"
    >
      {alertTypeOptions.map((option) => (
        <EditorDropdownMenuCustomItem
          key={option.value}
          selected={option.value === value}
          icon={option.icon}
          label={option.label}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </EditorDropdownMenu>
  )
}

export function AlertView({ node, contentRef, selected, view, getPos }: ReactNodeViewProps) {
  const variant = normalizeAlertVariant(node.attrs.variant)
  const type = normalizeAlertType(node.attrs.type)
  const showIcon = type !== 'text'
  const state = alertViewState[variant]
  const Icon = state.icon
  const indent = typeof node.attrs.indent === 'number'
    ? node.attrs.indent
    : typeof node.attrs.indent === 'string'
      ? Number.parseInt(node.attrs.indent, 10)
      : 0
  const style = {
    marginLeft: Number.isFinite(indent) && indent > 0 ? `${indent * 32}px` : undefined,
    borderColor: state.borderColor,
    background: state.background,
  } satisfies CSSProperties

  function updateAlertAttrs(nextAttrs: Partial<{ variant: AlertVariant, type: AlertType }>) {
    if (!view.editable) {
      return
    }

    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const currentNode = view.state.doc.nodeAt(pos)
    if (!currentNode) {
      return
    }

    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
      ...currentNode.attrs,
      ...nextAttrs,
    })
    view.dispatch(tr)
    view.focus()
  }

  const content = (
    <div
      className={cn(
        'alert-wrapper pk:my-4 pk:flex pk:items-start pk:gap-4 pk:rounded-[var(--radius)] pk:border pk:px-4 pk:py-3',
        selected && 'ProseMirror-selectednode',
      )}
      data-drag-handle
      data-node="alert"
      data-id={typeof node.attrs.id === 'string' && node.attrs.id ? node.attrs.id : undefined}
      data-variant={variant}
      data-type={type}
      style={style}
    >
      {showIcon ? (
        <div
          className="pk:flex pk:h-5 pk:w-5 pk:shrink-0 pk:self-center pk:items-center pk:justify-center pk:leading-none"
          contentEditable={false}
          style={{ color: state.color }}
        >
          <Icon className="pk:h-5 pk:w-5" />
        </div>
      ) : null}
      <div
        ref={contentRef}
        className={cn(
          'pk:min-w-0 pk:w-0 pk:flex-1 pk:[&_>_:first-child]:mt-0 pk:[&_>_:last-child]:mb-0',
          variant !== 'default' && 'pk:[&_code]:border-[color-mix(in_srgb,var(--pk-alert-color)_30%,transparent)] pk:[&_code]:bg-[color-mix(in_srgb,var(--pk-alert-color)_10%,transparent)]',
        )}
        style={{ '--pk-alert-color': state.color } as CSSProperties}
      />
    </div>
  )

  if (!view.editable) {
    return content
  }

  return (
    <EditorHoverPopover
      hoverDelay={500}
      closeDelay={300}
      side="top"
      align="start"
      sideOffset={4}
      popupClassName="pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_12px_32px_rgb(15_23_42_/_18%)]"
      content={(
        <div className="pk:flex pk:items-center pk:gap-1 pk:p-1">
          {alertVariantOptions.map((option) => (
            <AlertToolbarButton
              key={option.value}
              label={option.label}
              icon={option.icon}
              active={option.value === variant}
              onClick={() => updateAlertAttrs({ variant: option.value })}
            />
          ))}
          <Separator orientation="vertical" className="pk:mx-1 pk:h-4" />
          <AlertTypeMenu
            value={type}
            onChange={(nextType) => updateAlertAttrs({ type: nextType })}
          />
        </div>
      )}
    >
      {content}
    </EditorHoverPopover>
  )
}
