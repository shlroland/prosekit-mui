import katex from 'katex'

import type { StaticNodeViewProps } from './types'
import { getStaticTextContent, normalizeText } from './utils'

function renderKatexMarkup(latex: string, displayMode: boolean) {
  if (!latex.trim()) {
    return ''
  }

  try {
    return katex.renderToString(latex, {
      displayMode,
      errorColor: '#b91c1c',
      output: 'htmlAndMathml',
      strict: 'ignore',
      throwOnError: false,
    })
  } catch {
    return ''
  }
}

export function StaticMathInlineView({ children }: StaticNodeViewProps) {
  const latex = getStaticTextContent(children)
  const markup = renderKatexMarkup(latex, false)

  return (
    <span className="prosemirror-math-inline" data-static-renderer="true" data-math-empty={latex.trim() ? 'false' : 'true'}>
      <span
        className="prosemirror-math-display"
        dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
      >
        {markup ? undefined : latex}
      </span>
    </span>
  )
}

export function StaticMathBlockView({ attrs, children }: StaticNodeViewProps) {
  const latex = getStaticTextContent(children)
  const language = normalizeText(attrs.language) || 'tex'
  const markup = renderKatexMarkup(latex, true)

  return (
    <div
      className="prosemirror-math-block"
      data-static-renderer="true"
      data-language={language}
      data-math-empty={latex.trim() ? 'false' : 'true'}
    >
      <div
        className="prosemirror-math-display"
        dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
      >
        {markup ? undefined : latex}
      </div>
    </div>
  )
}
