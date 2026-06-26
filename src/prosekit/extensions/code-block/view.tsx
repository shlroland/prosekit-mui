import type { ReactNodeViewProps } from 'prosekit/react'

import { MermaidCodeBlockView } from '../mermaid'

export function CodeBlockView(props: ReactNodeViewProps) {
  const { node, contentRef } = props
  const language = typeof node.attrs.language === 'string' && node.attrs.language
    ? node.attrs.language
    : 'text'

  if (language === 'mermaid') {
    return <MermaidCodeBlockView {...props} />
  }

  return (
    <pre ref={contentRef} data-language={language || undefined} />
  )
}
