import type { StaticNodeViewProps } from './types'
import { normalizeText } from './utils'

export function StaticTooltipView({ attrs, children }: StaticNodeViewProps) {
  const text = normalizeText(attrs.text) || normalizeText(attrs.tooltip)
  const id = normalizeText(attrs.id)

  return (
    <span
      data-tooltip-id={id || undefined}
      data-tooltip-text={text}
      data-tooltip={text}
      title={text || undefined}
    >
      {children}
    </span>
  )
}
