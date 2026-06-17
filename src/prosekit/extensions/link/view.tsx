import { useEffect, useMemo, useRef, useState } from 'react'
import { NodeSelection } from 'prosekit/pm/state'
import type { ReactNodeViewProps } from 'prosekit/react'
import { PopoverPopup, PopoverPositioner, PopoverRoot, PopoverTrigger } from 'prosekit/react/popover'

import { ChromeIcon, LinkIcon } from '../../../icons'
import { LinkActionBar } from '../../components/link-action-bar'
import { LinkEditorPanel } from '../../components/link-editor-popover'
import type { LinkAttrs, LinkDisplayType, LinkTarget } from './types'
import { getLinkRel, getLinkTitle, normalizeInlineLinkType, normalizeLinkTarget, toLinkAttrs } from './utils'
import './view.css'

function getNodeAttrs(node: ReactNodeViewProps['node']): LinkAttrs {
  return {
    href: typeof node.attrs.href === 'string' ? node.attrs.href : '',
    target: normalizeLinkTarget(node.attrs.target),
    rel: typeof node.attrs.rel === 'string' ? node.attrs.rel : null,
    class: typeof node.attrs.class === 'string' ? node.attrs.class : null,
    title: typeof node.attrs.title === 'string' ? node.attrs.title : null,
    type: node.type.name === 'blockLink' ? 'block' : normalizeInlineLinkType(node.attrs.type),
    download: typeof node.attrs.download === 'string' ? node.attrs.download : null,
  }
}

function getDisplayType(nodeName: string, attrs: LinkAttrs): LinkDisplayType {
  return nodeName === 'blockLink' ? 'block' : normalizeInlineLinkType(attrs.type)
}

function LinkFavicon({
  src,
  isBlock,
}: {
  src: string
  isBlock: boolean
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <span className={`prosekit-link-node-avatar ${isBlock ? 'block' : ''}`}>
      {showImage ? (
        <img
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ChromeIcon
          className="cursor-grab text-[var(--editor-primary)] active:cursor-grabbing"
          style={{ fontSize: isBlock ? '2rem' : '1rem' }}
        />
      )}
    </span>
  )
}

export function LinkView({
  node,
  selected,
  getPos,
  view,
}: ReactNodeViewProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsCloseTimerRef = useRef<number | null>(null)
  const attrs = useMemo(() => getNodeAttrs(node), [node])

  useEffect(() => {
    return () => {
      if (actionsCloseTimerRef.current !== null) {
        window.clearTimeout(actionsCloseTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (view.editable && !attrs.href && !editOpen) {
      setEditOpen(true)
    }
  }, [attrs.href, editOpen, view.editable])

  const isEditable = view.editable
  const isBlock = node.type.name === 'blockLink'
  const displayType = getDisplayType(node.type.name, attrs)
  const label = attrs.title || getLinkTitle(attrs.href)
  const favicon = useMemo(() => {
    try {
      return attrs.href ? `${new URL(attrs.href).origin}/favicon.ico` : ''
    } catch {
      return ''
    }
  }, [attrs.href])

  async function handleCopy(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(attrs.href)
    } catch {
      // Ignore clipboard failures in unsupported environments.
    }
  }

  function handleEditOpen(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setActionsOpen(false)
    setEditOpen(true)
  }

  function handleEditClose() {
    setEditOpen(false)
  }

  function handleRemove(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const text = attrs.title || attrs.href
    const tr = view.state.tr
    if (node.type.name === 'blockLink') {
      const paragraphType = view.state.schema.nodes.paragraph
      const paragraph = paragraphType?.createAndFill(null, text ? view.state.schema.text(text) : undefined)
      if (!paragraph) {
        return
      }
      tr.replaceWith(pos, pos + node.nodeSize, paragraph)
    } else {
      tr.replaceWith(pos, pos + node.nodeSize, view.state.schema.text(text))
    }
    view.dispatch(tr)
  }

  function replaceNode(targetType: 'inlineLink' | 'blockLink', nextAttrs: LinkAttrs) {
    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const targetNodeType = view.state.schema.nodes[targetType]
    if (!targetNodeType) {
      return
    }

    const nextNode = targetNodeType.create({
      ...nextAttrs,
      type: targetType === 'blockLink' ? 'block' : normalizeInlineLinkType(nextAttrs.type),
    })
    const tr = view.state.tr
    if (targetType === 'inlineLink' && node.type.name === 'blockLink') {
      const paragraphType = view.state.schema.nodes.paragraph
      const paragraph = paragraphType?.createAndFill(null, nextNode)
      if (!paragraph) {
        return
      }
      tr.replaceWith(pos, pos + node.nodeSize, paragraph)
      tr.setSelection(NodeSelection.create(tr.doc, pos + 1))
    } else if (targetType === 'blockLink' && node.type.name === 'inlineLink') {
      tr.replaceRangeWith(pos, pos + node.nodeSize, nextNode)
      tr.setSelection(NodeSelection.create(tr.doc, pos))
    } else {
      tr.replaceWith(pos, pos + node.nodeSize, nextNode)
      tr.setSelection(NodeSelection.create(tr.doc, pos))
    }
    view.dispatch(tr)
    view.focus()
  }

  function updateLinkNode(nextAttrs: LinkAttrs) {
    if (nextAttrs.type === 'block') {
      replaceNode('blockLink', { ...nextAttrs, type: 'block' })
      return
    }

    replaceNode('inlineLink', {
      ...nextAttrs,
      type: normalizeInlineLinkType(nextAttrs.type),
    })
  }

  function handleSaveWithValue(nextValue: {
    href: string
    title: string
    type: LinkDisplayType
    target: LinkTarget
  }) {
    const nextAttrs = toLinkAttrs(nextValue.href, {
      ...attrs,
      title: nextValue.title || null,
      target: nextValue.target,
      rel: getLinkRel(nextValue.target, null),
      type: nextValue.type,
    })

    if (!nextAttrs) {
      return
    }

    updateLinkNode(nextAttrs)
    setEditOpen(false)
  }

  function handleChangeDisplay(nextType: LinkDisplayType, event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const nextAttrs = toLinkAttrs(attrs.href, {
      ...attrs,
      type: nextType,
    })
    if (!nextAttrs) {
      return
    }

    updateLinkNode({
      ...nextAttrs,
      type: nextType,
    })
  }

  function keepActionsOpen() {
    if (actionsCloseTimerRef.current !== null) {
      window.clearTimeout(actionsCloseTimerRef.current)
      actionsCloseTimerRef.current = null
    }
    setActionsOpen(true)
  }

  function scheduleActionsClose() {
    if (actionsCloseTimerRef.current !== null) {
      window.clearTimeout(actionsCloseTimerRef.current)
    }
    actionsCloseTimerRef.current = window.setTimeout(() => {
      setActionsOpen(false)
      actionsCloseTimerRef.current = null
    }, 500)
  }

  const actionBar = (
    <LinkActionBar
      href={attrs.href}
      type={displayType}
      onEdit={handleEditOpen}
      onCopy={handleCopy}
      onRemove={handleRemove}
      onChangeDisplay={handleChangeDisplay}
    />
  )

  const contentHoverProps = isEditable
    ? {
        onMouseEnter: keepActionsOpen,
        onMouseLeave: scheduleActionsClose,
        onPointerEnter: keepActionsOpen,
        onPointerLeave: scheduleActionsClose,
        onFocus: keepActionsOpen,
        onBlur: scheduleActionsClose,
      }
    : {}

  const content = (
    <span
      className={`prosekit-link-node ${isBlock ? 'block' : ''} ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle={isBlock ? 'true' : undefined}
      {...contentHoverProps}
    >
      {!attrs.href && isEditable ? (
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--editor-border)] bg-[var(--editor-muted)] px-3 text-sm text-[var(--editor-muted-foreground)] ${isBlock ? 'w-full py-3' : 'py-1.5'}`}
        >
          <LinkIcon className="shrink-0 text-base" />
          <span>{attrs.title ? `添加“${attrs.title}”链接` : '添加链接'}</span>
        </button>
      ) : (
        <a
          href={attrs.href}
          target={attrs.target ?? '_blank'}
          rel={getLinkRel(attrs.target ?? '_blank', attrs.rel) ?? undefined}
          className={`prosekit-link-node-anchor ${isBlock ? 'block' : ''}`}
          title={attrs.title ?? undefined}
          download={attrs.download ?? undefined}
        >
          {isBlock || displayType === 'icon' ? (
            <LinkFavicon src={favicon} isBlock={isBlock} />
          ) : null}
          <span className="prosekit-link-node-content">
            {isBlock ? (
              <span className="prosekit-link-node-meta">
                <span className="prosekit-link-node-title">
                  {label}
                </span>
                <span className="prosekit-link-node-href">
                  {attrs.href}
                </span>
              </span>
            ) : (
              <span>{label}</span>
            )}
          </span>
        </a>
      )}
    </span>
  )

  if (isEditable && isBlock) {
    return (
      <div
        className="prosekit-block-link-shell"
        onMouseEnter={keepActionsOpen}
        onMouseLeave={scheduleActionsClose}
        onPointerEnter={keepActionsOpen}
        onPointerLeave={scheduleActionsClose}
        onFocus={keepActionsOpen}
        onBlur={scheduleActionsClose}
      >
        {content}
        {actionsOpen && !editOpen ? (
          <div
            className="prosekit-block-link-actions"
            contentEditable={false}
            onMouseEnter={keepActionsOpen}
            onMouseLeave={scheduleActionsClose}
            onPointerEnter={keepActionsOpen}
            onPointerLeave={scheduleActionsClose}
          >
            {actionBar}
          </div>
        ) : null}
        {editOpen ? (
          <div
            className="prosekit-block-link-editor"
            contentEditable={false}
            onMouseEnter={keepActionsOpen}
            onMouseLeave={scheduleActionsClose}
            onPointerEnter={keepActionsOpen}
            onPointerLeave={scheduleActionsClose}
          >
            <LinkEditorPanel
              open={editOpen}
              initialHref={attrs.href}
              initialTitle={attrs.title ?? ''}
              initialType={displayType}
              initialTarget={attrs.target ?? '_blank'}
              showAdvancedOptions
              submitLabel={attrs.href ? '修改链接' : '插入链接'}
              onClose={handleEditClose}
              onSubmit={(value) => {
                handleSaveWithValue(value)
              }}
              onRemove={() => {
                const fakeEvent = {
                  preventDefault() {},
                  stopPropagation() {},
                } as React.MouseEvent<HTMLButtonElement>
                handleRemove(fakeEvent)
                handleEditClose()
              }}
            />
          </div>
        ) : null}
      </div>
    )
  }

  const popoverTriggerStyle = {
    display: isBlock ? 'block' : 'inline-flex',
    maxWidth: '100%',
    width: isBlock ? '100%' : undefined,
  }

  const contentWithPopover = isEditable ? (
    <PopoverRoot style={{ display: 'contents' }} open={editOpen || actionsOpen}>
      <PopoverTrigger
        style={popoverTriggerStyle}
        onMouseEnter={keepActionsOpen}
        onMouseLeave={scheduleActionsClose}
      >
        {content}
      </PopoverTrigger>
      <PopoverPositioner
        className="prosekit-link-popover-positioner"
        placement={editOpen ? 'bottom' : 'top'}
        offset={6}
        hoist
        strategy="fixed"
      >
        <PopoverPopup
          className={editOpen ? 'prosekit-link-editor-popover' : 'prosekit-link-node-popup'}
          onMouseEnter={keepActionsOpen}
          onMouseLeave={scheduleActionsClose}
        >
          {editOpen ? (
            <LinkEditorPanel
              open={editOpen}
              initialHref={attrs.href}
              initialTitle={attrs.title ?? ''}
              initialType={displayType}
              initialTarget={attrs.target ?? '_blank'}
              showAdvancedOptions
              submitLabel={attrs.href ? '修改链接' : '插入链接'}
              onClose={handleEditClose}
              onSubmit={(value) => {
                handleSaveWithValue(value)
              }}
              onRemove={() => {
                const fakeEvent = {
                  preventDefault() {},
                  stopPropagation() {},
                } as React.MouseEvent<HTMLButtonElement>
                handleRemove(fakeEvent)
                handleEditClose()
              }}
            />
          ) : (
            actionBar
          )}
        </PopoverPopup>
      </PopoverPositioner>
    </PopoverRoot>
  ) : (
    content
  )

  return contentWithPopover
}
