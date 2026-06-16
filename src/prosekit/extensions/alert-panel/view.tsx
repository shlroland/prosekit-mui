import type { ReactNodeViewProps } from 'prosekit/react'

import type { AlertBoxKind } from './types'

import './view.css'

function normalizeAlertKind(value: unknown): AlertBoxKind {
  return value === 'success' || value === 'warning' || value === 'error'
    ? value
    : 'info'
}

export function AlertBoxView({ node, contentRef, selected }: ReactNodeViewProps) {
  const variant = normalizeAlertKind(node.attrs.variant)

  return (
    <div
      className={`node-alert ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-type="alert-box"
      data-variant={variant}
    >
      <div ref={contentRef} className="node-alert-content" />
    </div>
  )
}

export function CollapsiblePanelView({
  node,
  contentRef,
  selected,
  view,
  getPos,
}: ReactNodeViewProps) {
  const open = node.attrs.open !== false
  const title = typeof node.attrs.title === 'string' && node.attrs.title.trim()
    ? node.attrs.title
    : '折叠面板'

  function toggleOpen() {
    if (!view.editable) {
      return
    }

    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      open: !open,
    })
    view.dispatch(tr)
    view.focus()
  }

  return (
    <div
      className={`cq-details ${open ? 'is-open' : ''} ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-type="collapsible-panel"
      data-open={open ? 'true' : 'false'}
      data-title={title}
    >
      <button
        type="button"
        className="cq-details-toggle"
        contentEditable={false}
        aria-label={open ? '收起面板' : '展开面板'}
        onClick={toggleOpen}
      />
      <div className="cq-details-body">
        <summary contentEditable={false}>{title}</summary>
        <div
          ref={contentRef}
          data-type="detailsContent"
          data-open={open ? 'true' : 'false'}
        />
      </div>
    </div>
  )
}
