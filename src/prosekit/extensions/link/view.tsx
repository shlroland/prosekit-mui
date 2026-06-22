import { useEffect, useMemo, useRef, useState } from 'react'
import { NodeSelection } from 'prosekit/pm/state'
import type { ReactNodeViewProps } from 'prosekit/react'

import { ChromeIcon, LinkIcon } from '../../../icons'
import { EditorFloatingPopover, EditorHoverPopover } from '../../../ui'
import { cn } from '../../../utils/cn'
import { LinkActionBar } from '../../components/link-action-bar'
import { LinkEditorPanel } from '../../components/link-editor-popover'
import type { LinkAttrs, LinkDisplayType, LinkTarget } from './types'
import { getLinkRel, getLinkTitle, normalizeInlineLinkType, normalizeLinkTarget, toLinkAttrs } from './utils'

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
    <span
      className={cn(
        'pk:inline-flex pk:shrink-0 pk:items-center pk:justify-center pk:self-center pk:overflow-hidden pk:rounded-full pk:bg-white',
        isBlock ? 'pk:h-8 pk:w-8' : 'pk:h-4 pk:w-4',
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
          className="pk:h-full pk:w-full pk:object-cover"
        />
      ) : (
        <ChromeIcon
          className="pk:cursor-grab pk:text-[var(--editor-primary)] pk:active:cursor-grabbing"
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
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const attrs = useMemo(() => getNodeAttrs(node), [node])

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

  function handleChangeDisplay(nextType: LinkDisplayType) {
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

  const content = (
    <span
      ref={anchorRef}
      className={cn(
        'pk:inline-flex pk:max-w-full pk:items-center pk:gap-1 pk:align-baseline',
        isBlock && 'pk:block',
      )}
      data-drag-handle={isBlock ? 'true' : undefined}
    >
      {!attrs.href && isEditable ? (
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className={`pk:inline-flex pk:cursor-pointer pk:items-center pk:gap-2 pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-muted)] pk:px-3 pk:text-sm pk:text-[var(--editor-muted-foreground)] ${isBlock ? 'pk:w-full pk:py-3' : 'pk:py-1.5'}`}
        >
          <LinkIcon className="pk:shrink-0 pk:text-base" />
          <span>{attrs.title ? `添加“${attrs.title}”链接` : '添加链接'}</span>
        </button>
      ) : (
        <a
          href={attrs.href}
          target={attrs.target ?? '_blank'}
          rel={getLinkRel(attrs.target ?? '_blank', attrs.rel) ?? undefined}
          className={cn(
            'pk:inline-flex pk:max-w-full pk:items-baseline pk:gap-1 pk:rounded-[var(--radius-md)] pk:text-[var(--editor-primary)] pk:no-underline pk:transition-colors pk:hover:underline',
            isBlock && [
              'pk:flex pk:w-full pk:cursor-pointer pk:items-center pk:gap-4 pk:rounded-[var(--radius-md)] pk:border pk:border-[var(--editor-border)] pk:p-4 pk:text-left pk:text-[inherit] pk:no-underline pk:hover:border-[var(--editor-primary)] pk:hover:no-underline',
              selected && 'pk:border-[var(--editor-primary)] pk:bg-[color-mix(in_srgb,var(--editor-primary)_6%,var(--editor-surface))]',
            ],
          )}
          title={attrs.title ?? undefined}
          download={attrs.download ?? undefined}
        >
          {isBlock || displayType === 'icon' ? (
            <LinkFavicon src={favicon} isBlock={isBlock} />
          ) : null}
          <span className="pk:min-w-0">
            {isBlock ? (
              <span className="pk:flex pk:min-w-0 pk:flex-col pk:gap-[0.15rem]">
                <span className="pk:overflow-hidden pk:text-ellipsis pk:whitespace-nowrap pk:text-sm pk:font-bold">
                  {label}
                </span>
                <span className="pk:overflow-hidden pk:text-ellipsis pk:whitespace-nowrap pk:text-xs pk:text-[var(--editor-muted-foreground)]">
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
      <>
        <EditorHoverPopover
          disabled={editOpen}
          hoverDelay={500}
          closeDelay={300}
          side="top"
          align="start"
          sideOffset={6}
          popupClassName="pk:max-w-[min(420px,calc(100vw-2rem))] pk:rounded-lg pk:border pk:border-[rgb(15_23_42_/_24%)] pk:bg-[var(--editor-surface)] pk:text-xs pk:shadow-[0_24px_64px_rgb(15_23_42_/_24%),0_8px_20px_rgb(15_23_42_/_16%),inset_0_0_0_1px_rgb(255_255_255_/_80%)]"
          content={actionBar}
        >
          {content}
        </EditorHoverPopover>
        <EditorFloatingPopover
          anchor={anchorRef}
          open={editOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              handleEditClose()
            }
          }}
          side="top"
          align="start"
          sideOffset={6}
          popupClassName="pk:max-w-[min(420px,calc(100vw-2rem))] pk:rounded-lg pk:border pk:border-[rgb(15_23_42_/_24%)] pk:bg-[var(--editor-surface)] pk:shadow-[0_28px_72px_rgb(15_23_42_/_26%),0_10px_24px_rgb(15_23_42_/_16%),inset_0_0_0_1px_rgb(255_255_255_/_80%)]"
          content={(
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
          )}
        />
      </>
    )
  }

  return isEditable ? (
    <>
      <EditorHoverPopover
        disabled={editOpen}
        hoverDelay={500}
        closeDelay={300}
        side="top"
        align="start"
        sideOffset={6}
        popupClassName="pk:max-w-[min(420px,calc(100vw-2rem))] pk:rounded-lg pk:border pk:border-[rgb(15_23_42_/_24%)] pk:bg-[var(--editor-surface)] pk:text-xs pk:shadow-[0_24px_64px_rgb(15_23_42_/_24%),0_8px_20px_rgb(15_23_42_/_16%),inset_0_0_0_1px_rgb(255_255_255_/_80%)]"
        content={actionBar}
      >
        {content}
      </EditorHoverPopover>
      <EditorFloatingPopover
        anchor={anchorRef}
        open={editOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleEditClose()
          }
        }}
        side="bottom"
        align="start"
        sideOffset={6}
        popupClassName="pk:max-w-[min(420px,calc(100vw-2rem))] pk:rounded-lg pk:border pk:border-[rgb(15_23_42_/_24%)] pk:bg-[var(--editor-surface)] pk:shadow-[0_28px_72px_rgb(15_23_42_/_26%),0_10px_24px_rgb(15_23_42_/_16%),inset_0_0_0_1px_rgb(255_255_255_/_80%)]"
        content={(
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
        )}
      />
    </>
  ) : content
}
