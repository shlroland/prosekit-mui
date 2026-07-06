import type { StaticNodeViewProps } from './types'
import { getStaticTextContent, normalizeText } from './utils'
import { StaticMermaidView } from './mermaid-view'
import { renderHighlightedCodeBlockHTML } from './shiki-highlight'

export function StaticCodeBlockView({ attrs, children }: StaticNodeViewProps) {
  const language = normalizeText(attrs.language) || 'text'
  const source = getStaticTextContent(children)

  if (language === 'mermaid') {
    return <StaticMermaidView attrs={attrs}>{source}</StaticMermaidView>
  }

  return <div dangerouslySetInnerHTML={{ __html: renderHighlightedCodeBlockHTML(source, language) }} />
}
