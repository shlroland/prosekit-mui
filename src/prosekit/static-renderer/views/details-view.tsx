import type { ReactNode } from 'react'

import { cn } from '../../../utils/cn'
import type { StaticNodeViewProps } from './types'

const detailsClassName = cn(
  'cq-details',
  'pk:my-5 pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)]',
)

const detailsSummaryClassName = cn(
  'cq-details-summary',
  'pk:relative pk:flex pk:cursor-pointer pk:list-none pk:items-start pk:gap-1 pk:px-4 pk:py-3 pk:font-semibold pk:outline-none pk:marker:hidden',
)

const detailsToggleClassName = cn(
  'cq-details-toggle',
  'pk:mt-[0.1rem] pk:inline-flex pk:h-6 pk:w-5 pk:shrink-0 pk:items-center pk:justify-center pk:rounded pk:text-[0.625rem] pk:text-[var(--editor-foreground)]',
  "pk:before:flex pk:before:h-full pk:before:w-full pk:before:items-center pk:before:justify-center pk:before:content-['▶'] pk:before:transition-transform pk:before:duration-200 pk:before:ease-in-out",
  'pk:[details[open]_&]:before:rotate-90',
)

export function StaticDetailsView({ attrs, children }: StaticNodeViewProps) {
  const open = attrs.open !== false

  return (
    <details className={cn(detailsClassName, open && 'is-open')} open={open} data-static-renderer="true">
      {children}
    </details>
  )
}

export function StaticDetailsSummaryView({ children }: { children?: ReactNode }) {
  return (
    <summary className={detailsSummaryClassName}>
      <span className={detailsToggleClassName} aria-hidden="true" />
      <span className="pk:min-h-6 pk:min-w-0 pk:flex-1">
        {children}
      </span>
    </summary>
  )
}

export function StaticDetailsContentView({ children }: { children?: ReactNode }) {
  return (
    <div className="cq-details-content pk:min-h-6 pk:px-4 pk:pb-4" data-type="detailsContent">
      {children}
    </div>
  )
}
