import { defineNodeView } from 'prosekit/core'
import { TextSelection } from 'prosekit/pm/state'
import type { NodeView } from 'prosekit/pm/view'
import {
  createMathBlockView,
  createMathInlineView,
  type RenderMathBlock,
  type RenderMathInline,
} from 'prosemirror-math'

function focusMathSource(view: Parameters<Parameters<typeof defineNodeView>[0]['constructor']>[1], pos: number) {
  const resolvedPos = view.state.doc.resolve(Math.min(view.state.doc.content.size, pos + 1))
  const tr = view.state.tr.setSelection(TextSelection.near(resolvedPos))
  view.dispatch(tr.scrollIntoView())
  view.focus()
}

function attachDisplayClickHandler(
  nodeView: NodeView,
  view: Parameters<Parameters<typeof defineNodeView>[0]['constructor']>[1],
  getPos: () => number | undefined,
) {
  const display = nodeView.dom.querySelector('.prosemirror-math-display')

  if (!(display instanceof HTMLElement)) {
    return nodeView
  }

  const handleMouseDown = (event: MouseEvent) => {
    if (!view.editable) {
      return
    }

    event.preventDefault()
    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    focusMathSource(view, pos)
  }

  display.addEventListener('mousedown', handleMouseDown)

  return {
    ...nodeView,
    destroy() {
      display.removeEventListener('mousedown', handleMouseDown)
      nodeView.destroy?.()
    },
  } satisfies NodeView
}

export function defineMathNodeView(options: {
  renderMathInline: RenderMathInline
  renderMathBlock: RenderMathBlock
}) {
  return [
    defineNodeView({
      name: 'mathInline',
      constructor: (node, view, getPos, decorations) => {
        const nodeView = createMathInlineView(options.renderMathInline, node, decorations)
        return attachDisplayClickHandler(nodeView, view, getPos)
      },
    }),
    defineNodeView({
      name: 'mathBlock',
      constructor: (node, view, getPos, decorations) => {
        const nodeView = createMathBlockView(options.renderMathBlock, node, decorations)
        return attachDisplayClickHandler(nodeView, view, getPos)
      },
    }),
  ] as const
}
