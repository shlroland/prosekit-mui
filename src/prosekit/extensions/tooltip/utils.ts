import { TextSelection } from 'prosekit/pm/state'
import type { EditorView } from 'prosekit/pm/view'

type TooltipRange = {
  from: number
  to: number
}

function getTooltipType(view: EditorView) {
  return view.state.schema.marks.tooltip
}

export function getTooltipRange(view: EditorView, element: HTMLElement): TooltipRange | null {
  try {
    const from = view.posAtDOM(element, 0)
    const to = view.posAtDOM(element, element.childNodes.length)

    if (from >= to) {
      return null
    }

    return { from, to }
  } catch {
    return null
  }
}

export function updateTooltipMark(
  view: EditorView,
  element: HTMLElement,
  tooltip: string,
) {
  const markType = getTooltipType(view)
  const range = getTooltipRange(view, element)

  if (!markType || !range) {
    return false
  }

  const nextTooltip = tooltip.trim()
  const tr = view.state.tr

  tr.setSelection(TextSelection.create(view.state.doc, range.from, range.to))
  tr.removeMark(range.from, range.to, markType)

  if (nextTooltip) {
    tr.addMark(range.from, range.to, markType.create({ tooltip: nextTooltip }))
  }

  view.dispatch(tr)
  view.focus()
  return true
}
