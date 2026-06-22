import { TextSelection } from 'prosekit/pm/state'
import type { Mark, Node as ProseMirrorNode } from 'prosekit/pm/model'
import type { EditorView } from 'prosekit/pm/view'

type TooltipRange = {
  from: number
  to: number
  mark?: Mark
}

function getTooltipType(view: EditorView) {
  return view.state.schema.marks.tooltip
}

export function createTooltipId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `tooltip-${crypto.randomUUID()}`
  }

  return `tooltip-${Math.random().toString(36).slice(2, 10)}`
}

export function getTooltipText(attrs: { text?: unknown, tooltip?: unknown }) {
  if (typeof attrs.text === 'string') {
    return attrs.text.trim()
  }

  return typeof attrs.tooltip === 'string' ? attrs.tooltip.trim() : ''
}

export function getTooltipId(attrs: { id?: unknown }) {
  return typeof attrs.id === 'string' && attrs.id ? attrs.id : null
}

export function findTooltipRange(doc: ProseMirrorNode, id: string): TooltipRange | null {
  let from: number | null = null
  let to: number | null = null
  let matchedMark: Mark | undefined

  doc.descendants((node, pos) => {
    if (!node.isText) {
      return true
    }

    const mark = node.marks.find((candidate) => {
      return candidate.type.name === 'tooltip' && candidate.attrs.id === id
    })

    if (!mark) {
      return true
    }

    if (from === null) {
      from = pos
      matchedMark = mark
    }
    to = pos + node.nodeSize
    return true
  })

  if (from === null || to === null || from >= to) {
    return null
  }

  return { from, to, mark: matchedMark }
}

export function getTooltipRange(view: EditorView, element: HTMLElement): TooltipRange | null {
  const tooltipId = element.dataset.tooltipId
  if (tooltipId) {
    const range = findTooltipRange(view.state.doc, tooltipId)
    if (range) {
      return range
    }
  }

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
  text: string,
) {
  const markType = getTooltipType(view)
  const range = getTooltipRange(view, element)

  if (!markType || !range) {
    return false
  }

  const nextText = text.trim()
  const id = element.dataset.tooltipId || range.mark?.attrs.id || createTooltipId()
  const tr = view.state.tr

  tr.setSelection(TextSelection.create(view.state.doc, range.from, range.to))
  tr.removeMark(range.from, range.to, markType)

  if (nextText) {
    tr.addMark(range.from, range.to, markType.create({ id, text: nextText, tooltip: nextText }))
  }

  view.dispatch(tr)
  view.focus()
  return true
}
