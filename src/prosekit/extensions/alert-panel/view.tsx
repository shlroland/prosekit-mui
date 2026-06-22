import type { CSSProperties, ReactNode } from 'react'
import type { ReactNodeViewProps } from 'prosekit/react'

import {
  CheckboxCircleFillIcon,
  CloseCircleFillIcon,
  DeleteLineIcon,
  ErrorWarningFillIcon,
  Information2FillIcon,
  PlayLineIcon,
  ScrollToBottomLineIcon,
  TextIcon,
  UserSmileFillIcon,
} from '../../../icons'
import { Button, EditorHoverPopover, Separator, Tooltip } from '../../../ui'
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
  { value: 'info', label: '提示', icon: <Information2FillIcon className="pk:h-4 pk:w-4 pk:text-[var(--primary)]" /> },
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

export function AlertView({ node, contentRef, selected, view, getPos }: ReactNodeViewProps) {
  const variant = normalizeAlertVariant(node.attrs.variant)
  const type = normalizeAlertType(node.attrs.type)
  const showIcon = type !== 'text'
  const state = alertViewState[variant]
  const Icon = state.icon
  const style = {
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

    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      ...nextAttrs,
    })
    view.dispatch(tr)
    view.focus()
  }

  function deleteAlert() {
    if (!view.editable) {
      return
    }

    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const tr = view.state.tr.delete(pos, pos + node.nodeSize)
    view.dispatch(tr.scrollIntoView())
    view.focus()
  }

  const content = (
    <div
      className={cn(
        'pk:my-4 pk:flex pk:items-start pk:gap-4 pk:rounded-[var(--radius)] pk:border pk:px-4 pk:py-3',
        selected && 'ProseMirror-selectednode',
      )}
      data-node="alert"
      data-variant={variant}
      data-type={type}
      style={style}
    >
      {showIcon ? (
        <div
          className="pk:shrink-0 pk:pt-0.5 pk:leading-none"
          contentEditable={false}
          style={{ color: state.color }}
        >
          <Icon className="pk:h-5 pk:w-5" />
        </div>
      ) : null}
      <div
        ref={contentRef}
        className={cn(
          'pk:min-w-0 pk:flex-1 pk:[&_>_:first-child]:mt-0 pk:[&_>_:last-child]:mb-0',
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
      sideOffset={6}
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
          {alertTypeOptions.map((option) => (
            <AlertToolbarButton
              key={option.value}
              label={option.label}
              icon={option.icon}
              active={option.value === type}
              onClick={() => updateAlertAttrs({ type: option.value })}
            />
          ))}
          <Separator orientation="vertical" className="pk:mx-1 pk:h-4" />
          <AlertToolbarButton
            label="删除提示块"
            icon={<DeleteLineIcon className="pk:h-4 pk:w-4" />}
            onClick={deleteAlert}
          />
        </div>
      )}
    >
      {content}
    </EditorHoverPopover>
  )
}

export function DetailsView({
  node,
  contentRef,
  selected,
  view,
  getPos,
}: ReactNodeViewProps) {
  const open = node.attrs.open !== false

  function toggleOpen() {
    if (!view.editable) {
      return
    }

    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      open: !open,
    })
    view.dispatch(tr)
    view.focus()
  }

  return (
    <details
      className={cn(
        'pk:my-5 pk:flex pk:gap-1 pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:p-2',
        'pk:[&_[data-node=\'details\']]:my-2 pk:[&_[data-node=\'details-content\']>_:last-child]:mb-2',
        'pk:[&_[data-type=\'detailsContent\']]:min-w-0 pk:[&_[data-type=\'detailsContent\']]:flex-1 pk:[&_[data-type=\'detailsContent\']]:flex-col pk:[&_[data-type=\'detailsContent\']]:gap-4',
        'pk:[&_summary]:relative pk:[&_summary]:cursor-text pk:[&_summary]:list-none pk:[&_summary]:font-semibold pk:[&_summary]:outline-none',
        'pk:[&_summary::-webkit-details-marker]:hidden pk:[&_summary[data-empty=true]::before]:pointer-events-none pk:[&_summary[data-empty=true]::before]:absolute pk:[&_summary[data-empty=true]::before]:left-0 pk:[&_summary[data-empty=true]::before]:top-0 pk:[&_summary[data-empty=true]::before]:text-[var(--pk-editor-placeholder)] pk:[&_summary[data-empty=true]::before]:content-[attr(data-placeholder)]',
        !open && 'pk:[&_[data-type=\'detailsContent\']]:hidden',
        selected && 'ProseMirror-selectednode',
      )}
      data-node="details"
      open={open}
    >
      <button
        type="button"
        className="pk:mt-[0.1rem] pk:inline-flex pk:h-6 pk:w-5 pk:shrink-0 pk:items-center pk:justify-center pk:rounded pk:bg-transparent pk:p-0 pk:text-[0.625rem] pk:text-[var(--editor-foreground)] pk:transition-colors pk:hover:bg-[var(--editor-muted)]"
        contentEditable={false}
        aria-label={open ? '收起面板' : '展开面板'}
        onClick={toggleOpen}
      >
        <PlayLineIcon
          className={cn(
            'pk:h-3.5 pk:w-3.5 pk:transition-transform pk:duration-200 pk:ease-in-out',
            open && 'pk:rotate-90',
          )}
        />
      </button>
      <div ref={contentRef} className="pk:flex pk:min-w-0 pk:flex-1 pk:flex-col pk:gap-4" />
    </details>
  )
}

export function DetailsSummaryView({ node, contentRef }: ReactNodeViewProps) {
  const isEmpty = node.content.size === 0

  return (
    <summary
      ref={contentRef}
      data-placeholder="输入面板标题"
      data-empty={isEmpty ? 'true' : 'false'}
      className="pk:relative pk:list-none pk:font-semibold pk:outline-none pk:marker:hidden"
    />
  )
}

export function DetailsContentView({ contentRef }: ReactNodeViewProps) {
  return (
    <div
      ref={contentRef}
      data-type="detailsContent"
      data-node="details-content"
      className="pk:flex pk:min-w-0 pk:flex-1 pk:flex-col pk:gap-4"
    />
  )
}
