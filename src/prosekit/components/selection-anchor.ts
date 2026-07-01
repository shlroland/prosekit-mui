import type { EditorFloatingPopoverProps } from '../../ui'

export function createSelectionAnchor(editor: any): EditorFloatingPopoverProps['anchor'] {
  const { view } = editor
  const selection = window.getSelection()
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  const rangeRect = range?.getBoundingClientRect()

  if (
    range
    && rangeRect
    && (rangeRect.width > 0 || rangeRect.height > 0)
    && view.dom.contains(range.commonAncestorContainer)
  ) {
    const anchorRect = new DOMRect(
      rangeRect.x,
      rangeRect.y,
      Math.max(rangeRect.width, 1),
      Math.max(rangeRect.height, 1),
    )

    return {
      contextElement: view.dom,
      getBoundingClientRect: () => anchorRect,
    }
  }

  const { from, to } = view.state.selection
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right, left + 1)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom, top + 1)
  const anchorRect = new DOMRect(left, top, right - left, bottom - top)

  return {
    contextElement: view.dom,
    getBoundingClientRect: () => anchorRect,
  }
}
