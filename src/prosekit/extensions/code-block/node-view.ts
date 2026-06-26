import { defineReactNodeView } from 'prosekit/react'

import { CodeBlockView } from './view'

export function defineCodeBlockNodeView() {
  return defineReactNodeView({
    name: 'codeBlock',
    component: CodeBlockView,
    as: 'div',
    contentAs: 'code',
    stopEvent: (event) => {
      return event.target instanceof HTMLElement
        ? Boolean(event.target.closest('button, [data-code-block-controls="true"], [data-mermaid-code-block-controls="true"], [data-editor-floating]'))
        : false
    },
  })
}
