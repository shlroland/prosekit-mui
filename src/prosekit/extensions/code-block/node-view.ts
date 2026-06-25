import { defineReactNodeView } from 'prosekit/react'

import { MermaidCodeBlockView } from '../mermaid'

export function defineCodeBlockNodeView() {
  return defineReactNodeView({
    name: 'codeBlock',
    component: MermaidCodeBlockView,
    as: 'div',
    contentAs: 'code',
    stopEvent: (event) => {
      return event.target instanceof HTMLElement
        ? Boolean(event.target.closest('button, [data-code-block-controls="true"], [data-mermaid-code-block-controls="true"], [data-editor-floating]'))
        : false
    },
  })
}
