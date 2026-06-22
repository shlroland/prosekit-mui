import type { CSSProperties } from 'react'
import type { ReactNodeViewProps } from 'prosekit/react'

import {
  CheckboxCircleFillIcon,
  CloseCircleFillIcon,
  ErrorWarningFillIcon,
  Information2FillIcon,
  PlayLineIcon,
  UserSmileFillIcon,
} from '../../../icons'
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

export function AlertView({ node, contentRef, selected }: ReactNodeViewProps) {
  const variant = normalizeAlertVariant(node.attrs.variant)
  const type = normalizeAlertType(node.attrs.type)
  const showIcon = type !== 'text'
  const state = alertViewState[variant]
  const Icon = state.icon
  const style = {
    borderColor: state.borderColor,
    background: state.background,
  } satisfies CSSProperties

  return (
    <div
      className={cn(
        'my-4 flex items-start gap-4 rounded-[var(--radius)] border px-4 py-3',
        selected && 'ProseMirror-selectednode',
      )}
      data-node="alert"
      data-variant={variant}
      data-type={type}
      style={style}
    >
      {showIcon ? (
        <div
          className="shrink-0 pt-0.5 leading-none"
          contentEditable={false}
          style={{ color: state.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div
        ref={contentRef}
        className={cn(
          'min-w-0 flex-1 [&_>_:first-child]:mt-0 [&_>_:last-child]:mb-0',
          variant !== 'default' && '[&_code]:border-[color-mix(in_srgb,var(--pk-alert-color)_30%,transparent)] [&_code]:bg-[color-mix(in_srgb,var(--pk-alert-color)_10%,transparent)]',
        )}
        style={{ '--pk-alert-color': state.color } as CSSProperties}
      />
    </div>
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
        'my-5 flex gap-1 rounded-[var(--radius)] border border-[var(--editor-border)] p-2',
        '[&_[data-node=\'details\']]:my-2 [&_[data-node=\'details-content\']>_:last-child]:mb-2',
        '[&_[data-type=\'detailsContent\']]:min-w-0 [&_[data-type=\'detailsContent\']]:flex-1 [&_[data-type=\'detailsContent\']]:flex-col [&_[data-type=\'detailsContent\']]:gap-4',
        '[&_summary]:relative [&_summary]:cursor-text [&_summary]:list-none [&_summary]:font-semibold [&_summary]:outline-none',
        '[&_summary::-webkit-details-marker]:hidden [&_summary[data-empty=true]::before]:pointer-events-none [&_summary[data-empty=true]::before]:absolute [&_summary[data-empty=true]::before]:left-0 [&_summary[data-empty=true]::before]:top-0 [&_summary[data-empty=true]::before]:text-[var(--pk-editor-placeholder)] [&_summary[data-empty=true]::before]:content-[attr(data-placeholder)]',
        !open && '[&_[data-type=\'detailsContent\']]:hidden',
        selected && 'ProseMirror-selectednode',
      )}
      data-node="details"
      open={open}
    >
      <button
        type="button"
        className="mt-[0.1rem] inline-flex h-6 w-5 shrink-0 items-center justify-center rounded bg-transparent p-0 text-[0.625rem] text-[var(--editor-foreground)] transition-colors hover:bg-[var(--editor-muted)]"
        contentEditable={false}
        aria-label={open ? '收起面板' : '展开面板'}
        onClick={toggleOpen}
      >
        <PlayLineIcon
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200 ease-in-out',
            open && 'rotate-90',
          )}
        />
      </button>
      <div ref={contentRef} className="flex min-w-0 flex-1 flex-col gap-4" />
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
      className="relative list-none font-semibold outline-none marker:hidden"
    />
  )
}

export function DetailsContentView({ contentRef }: ReactNodeViewProps) {
  return (
    <div
      ref={contentRef}
      data-type="detailsContent"
      data-node="details-content"
      className="flex min-w-0 flex-1 flex-col gap-4"
    />
  )
}
