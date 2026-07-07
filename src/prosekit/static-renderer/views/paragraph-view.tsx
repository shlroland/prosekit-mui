import type { CSSProperties, ReactNode } from 'react'

import type { StaticNodeViewProps } from './types'
import { normalizeText } from './utils'

function getParagraphStyle(attrs: Record<string, unknown>): CSSProperties | undefined {
  const textAlign = normalizeText(attrs.textAlign)

  return textAlign ? { textAlign } : undefined
}

export function StaticParagraphView({ attrs, children }: StaticNodeViewProps) {
  return (
    <p style={getParagraphStyle(attrs)}>
      {children || <br className="ProseMirror-trailingBreak" />}
    </p>
  )
}

export function StaticParagraphTrailingBreak(): ReactNode {
  return <br className="ProseMirror-trailingBreak" />
}
