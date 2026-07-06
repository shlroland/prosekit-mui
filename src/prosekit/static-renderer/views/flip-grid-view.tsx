import type { StaticNodeViewProps } from './types'
import { normalizeNumber, normalizeText } from './utils'

export function StaticFlipGridView({
  attrs,
  children,
  columnWidths,
}: StaticNodeViewProps & {
  columnWidths?: number[]
}) {
  const gap = normalizeText(attrs.gap) || '1rem'

  return (
    <div
      className="node-flipGrid flip-grid pk:relative pk:my-4 pk:grid pk:w-full"
      data-type="flip-grid"
      data-gap={gap}
      style={{
        gap,
        gridTemplateColumns: columnWidths?.length
          ? columnWidths.map((width) => `minmax(0, ${width}fr)`).join(' ')
          : undefined,
      }}
    >
      {children}
    </div>
  )
}

export function StaticFlipGridColumnView({ attrs, children }: StaticNodeViewProps) {
  const width = normalizeNumber(attrs.width) ?? 50

  return (
    <div
      className="flip-grid-column pk:min-w-0"
      data-type="flip-grid-column"
      data-width={width}
      style={{ width: `${width}%`, flex: `0 0 ${width}%`, minWidth: 0 }}
    >
      {children}
    </div>
  )
}
