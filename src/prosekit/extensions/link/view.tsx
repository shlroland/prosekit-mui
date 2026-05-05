import { Avatar, Box, Tooltip } from '@mui/material'
import { ExternalLink, Globe } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNodeViewProps } from 'prosekit/react'

import { LinkActionBar } from '../../components/link-action-bar'
import { LinkEditorPopover } from '../../components/link-editor-popover'
import type { LinkAttrs } from './types'
import { getLinkTitle, toLinkAttrs } from './utils'
import './view.css'

function getNodeAttrs(node: ReactNodeViewProps['node']): LinkAttrs {
  return {
    href: typeof node.attrs.href === 'string' ? node.attrs.href : '',
    target: typeof node.attrs.target === 'string' ? node.attrs.target : '_blank',
    rel: typeof node.attrs.rel === 'string' ? node.attrs.rel : null,
    class: typeof node.attrs.class === 'string' ? node.attrs.class : null,
    title: typeof node.attrs.title === 'string' ? node.attrs.title : null,
    type: typeof node.attrs.type === 'string' ? node.attrs.type : 'icon',
    download: typeof node.attrs.download === 'string' ? node.attrs.download : null,
  }
}

export function LinkView({
  node,
  selected,
  getPos,
  view,
}: ReactNodeViewProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const attrs = useMemo(() => getNodeAttrs(node), [node])
  const [href, setHref] = useState(attrs.href)
  const [title, setTitle] = useState(attrs.title ?? '')
  const [target, setTarget] = useState(attrs.target ?? '_blank')
  const [type, setType] = useState(attrs.type ?? 'icon')

  useEffect(() => {
    setHref(attrs.href)
    setTitle(attrs.title ?? '')
    setTarget(attrs.target ?? '_blank')
    setType(attrs.type ?? 'icon')
  }, [attrs.href, attrs.target, attrs.title, attrs.type])

  useEffect(() => {
    if (view.editable && !attrs.href && !editOpen) {
      setEditOpen(true)
    }
  }, [attrs.href, editOpen, view.editable])

  const isEditable = view.editable
  const isBlock = node.type.name === 'blockLink' || type === 'block'
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

    const nextNode = targetNodeType.create(nextAttrs)
    const tr = view.state.tr.replaceWith(pos, pos + node.nodeSize, nextNode)
    view.dispatch(tr)
    view.focus()
  }

  function handleSaveWithValue(nextValue: {
    href: string
    title: string
    type: 'text' | 'icon' | 'block'
    target: '_blank' | '_self'
  }) {
    const nextAttrs = toLinkAttrs(nextValue.href, {
      ...attrs,
      title: nextValue.title || null,
      target: nextValue.target,
      type: nextValue.type,
    })

    if (!nextAttrs) {
      return
    }

    if (nextValue.type === 'block') {
      replaceNode('blockLink', { ...nextAttrs, type: 'block' })
    } else if (node.type.name === 'blockLink') {
      replaceNode('inlineLink', { ...nextAttrs, type: nextValue.type })
    } else {
      replaceNode('inlineLink', {
        ...nextAttrs,
        type: nextValue.type,
      })
    }
    setEditOpen(false)
  }

  const actionBar = (
    <LinkActionBar
      href={attrs.href}
      isBlock={isBlock}
      onEdit={handleEditOpen}
      onCopy={handleCopy}
      onRemove={handleRemove}
      onToggleDisplay={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setType((current) => current === 'block' ? 'icon' : 'block')
      }}
    />
  )

  const content = (
    <Box
      ref={anchorRef}
      component={isBlock ? 'div' : 'span'}
      className={`prosekit-link-node ${isBlock ? 'block' : ''} ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle={isBlock ? 'true' : undefined}
    >
      {!attrs.href && isEditable ? (
        <Box
          component="button"
          type="button"
          onClick={() => setEditOpen(true)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: isBlock ? 1.5 : 0.75,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            color: 'text.secondary',
            cursor: 'pointer',
            width: isBlock ? '100%' : 'auto',
          }}
        >
          <Globe className="prosekit-link-node-icon" />
          <Box component="span">{title ? `添加“${title}”链接` : '添加链接'}</Box>
        </Box>
      ) : (
      <Box
        component="a"
        href={attrs.href}
        target={attrs.target ?? '_blank'}
        rel={attrs.rel ?? undefined}
        className={`prosekit-link-node-anchor ${isBlock ? 'block' : ''}`}
        title={attrs.title ?? undefined}
        download={attrs.download ?? undefined}
      >
        <Avatar
          src={favicon}
          className={`prosekit-link-node-avatar ${isBlock ? 'block' : ''}`}
        >
          <Globe className="prosekit-link-node-icon" />
        </Avatar>
        <Box component="span" className="prosekit-link-node-content">
          {isBlock ? (
            <Box component="span" className="prosekit-link-node-meta">
              <Box component="span" className="prosekit-link-node-title">
                {label}
              </Box>
              <Box component="span" className="prosekit-link-node-href">
                {attrs.href}
              </Box>
            </Box>
          ) : (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
              {attrs.type !== 'text' ? <ExternalLink className="prosekit-link-node-icon" /> : null}
              <Box component="span">{label}</Box>
            </Box>
          )}
        </Box>
      </Box>
      )}
    </Box>
  )

  return (
    <>
      {isEditable && attrs.href ? (
        <Tooltip
          arrow
          title={actionBar}
          placement="top"
          slotProps={{
            tooltip: {
              className: 'prosekit-link-node-popup',
            },
            arrow: {
              className: 'prosekit-link-node-arrow',
            },
          }}
        >
          {content}
        </Tooltip>
      ) : content}
      {isEditable ? (
        <LinkEditorPopover
          open={editOpen}
          anchorEl={anchorRef.current}
          initialHref={href}
          initialTitle={title}
          initialType={type as 'text' | 'icon' | 'block'}
          initialTarget={target as '_blank' | '_self'}
          showAdvancedOptions
          onClose={handleEditClose}
          onSubmit={(value) => {
            setHref(value.href)
            setTitle(value.title)
            setType(value.type)
            setTarget(value.target)
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
      ) : null}
    </>
  )
}
