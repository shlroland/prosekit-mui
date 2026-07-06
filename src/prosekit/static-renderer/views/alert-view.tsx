import type { CSSProperties } from 'react'

import {
  CheckboxCircleFillIcon,
  CloseCircleFillIcon,
  ErrorWarningFillIcon,
  Information2FillIcon,
  UserSmileFillIcon,
} from '../../../icons'
import { cn } from '../../../utils/cn'
import type { AlertType, AlertVariant } from '../../extensions/alert'
import type { StaticNodeViewProps } from './types'
import { normalizeNumber, normalizeText } from './utils'

function normalizeAlertVariant(value: unknown): AlertVariant {
  return value === 'info' || value === 'success' || value === 'warning' || value === 'error' || value === 'default'
    ? value
    : 'default'
}

function normalizeAlertType(value: unknown): AlertType {
  return value === 'text' ? 'text' : 'icon'
}

const alertViewState = {
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
} satisfies Record<AlertVariant, {
  icon: typeof Information2FillIcon
  color: string
  borderColor: string
  background: string
}>

export function StaticAlertView({ attrs, children }: StaticNodeViewProps) {
  const variant = normalizeAlertVariant(attrs.variant)
  const type = normalizeAlertType(attrs.type)
  const state = alertViewState[variant]
  const Icon = state.icon
  const indent = normalizeNumber(attrs.indent)
  const style = {
    marginLeft: indent && indent > 0 ? `${indent * 32}px` : undefined,
    borderColor: state.borderColor,
    background: state.background,
  } satisfies CSSProperties

  return (
    <div
      className="alert-wrapper pk:my-4 pk:flex pk:items-start pk:gap-4 pk:rounded-[var(--radius)] pk:border pk:px-4 pk:py-3"
      data-node="alert"
      data-id={normalizeText(attrs.id) || undefined}
      data-variant={variant}
      data-type={type}
      data-static-renderer="true"
      style={style}
    >
      {type !== 'text' ? (
        <div
          className="pk:flex pk:h-5 pk:w-5 pk:shrink-0 pk:self-center pk:items-center pk:justify-center pk:leading-none"
          aria-hidden="true"
          style={{ color: state.color }}
        >
          <Icon className="pk:h-5 pk:w-5" />
        </div>
      ) : null}
      <div
        className={cn(
          'pk:min-w-0 pk:w-0 pk:flex-1 pk:[&_>_:first-child]:mt-0 pk:[&_>_:last-child]:mb-0',
          variant !== 'default' && 'pk:[&_code]:border-[color-mix(in_srgb,var(--pk-alert-color)_30%,transparent)] pk:[&_code]:bg-[color-mix(in_srgb,var(--pk-alert-color)_10%,transparent)]',
        )}
        style={{ '--pk-alert-color': state.color } as CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}
