import { PencilLine } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactMarkViewProps } from 'prosekit/react'

import { Button, EditorFloatingPopover, EditorHoverPopover } from '../../../ui'
import type { EditorFloatingPopoverProps } from '../../../ui'
import { TooltipEditPopover } from './edit-popover'
import { createTooltipId, getTooltipId, getTooltipText, removeTooltipMark, updateTooltipMark } from './utils'

const ALLOWED_TOOLTIP_TAGS = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'CODE',
  'DIV',
  'EM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'I',
  'LI',
  'OL',
  'P',
  'PRE',
  'S',
  'SPAN',
  'STRIKE',
  'STRONG',
  'U',
  'UL',
])

function sanitizeTooltipHtml(value: string) {
  if (typeof document === 'undefined') {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  const template = document.createElement('template')
  template.innerHTML = value

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType !== Node.ELEMENT_NODE) {
        continue
      }

      const element = child as HTMLElement
      if (!ALLOWED_TOOLTIP_TAGS.has(element.tagName)) {
        element.replaceWith(...Array.from(element.childNodes))
        continue
      }

      for (const attr of Array.from(element.attributes)) {
        const name = attr.name.toLowerCase()
        const currentValue = attr.value
        const isAllowedHref = element.tagName === 'A'
          && (name === 'href' || name === 'title' || name === 'target')
          && !currentValue.trim().toLowerCase().startsWith('javascript:')
        const isAllowedStyle = name === 'style'
          && !/url\s*\(|expression\s*\(|javascript:/i.test(currentValue)
        const isAllowedClass = name === 'class'

        if (!isAllowedHref && !isAllowedStyle && !isAllowedClass) {
          element.removeAttribute(attr.name)
        }
      }

      walk(element)
    }
  }

  walk(template.content)
  return template.innerHTML.trim()
}

function isTouchLikeDevice() {
  if (typeof window === 'undefined') {
    return false
  }

  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const touchPoints = navigator.maxTouchPoints > 0

  return coarsePointer || touchPoints
}

export function TooltipView({ contentRef, mark, view }: ReactMarkViewProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const [editAnchor, setEditAnchor] = useState<EditorFloatingPopoverProps['anchor']>(null)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const tooltip = useMemo(() => getTooltipText(mark.attrs), [mark.attrs])
  const tooltipId = useMemo(() => getTooltipId(mark.attrs) ?? createTooltipId(), [mark.attrs])
  const tooltipHtml = useMemo(() => sanitizeTooltipHtml(tooltip), [tooltip])

  const isEditable = view.editable
  const isTouchReadonly = !isEditable && isTouchDevice

  function setEditAnchorFromRect(rect: DOMRect | DOMRectReadOnly, element?: Element | null) {
    const anchorRect = new DOMRect(rect.x, rect.y, rect.width, rect.height)
    setEditAnchor(element
      ? {
          contextElement: element,
          getBoundingClientRect: () => anchorRect,
        }
      : {
          getBoundingClientRect: () => anchorRect,
        })
  }

  function setEditAnchorFromSelection() {
    const { from } = view.state.selection
    const coords = view.coordsAtPos(from)
    const selectionRect = new DOMRect(
      coords.left,
      coords.top,
      Math.max(coords.right - coords.left, 1),
      Math.max(coords.bottom - coords.top, 1),
    )

    setEditAnchorFromRect(selectionRect, view.dom)
  }

  function captureEditAnchor() {
    const element = anchorRef.current
    const rect = element?.getBoundingClientRect()

    if (!rect || (rect.width === 0 && rect.height === 0) || (rect.left === 0 && rect.top === 0)) {
      setEditAnchorFromSelection()
      return
    }

    setEditAnchorFromRect(rect, element)
  }

  useEffect(() => {
    setIsTouchDevice(isTouchLikeDevice())
  }, [])

  function handleToggle() {
    if (isTouchReadonly) {
      setOpen((value) => !value)
    }
  }

  function handleOpen() {
    if (!isTouchReadonly) {
      setOpen(true)
    }
  }

  function handleClose() {
    setOpen(false)
  }

  function handleOpenEdit() {
    captureEditAnchor()
    setOpen(false)
    setEditOpen(true)
  }

  function handleCloseEdit() {
    setEditOpen(false)
    setEditAnchor(null)
  }

  const popupContent = (
    <div className="pk:flex pk:max-w-[20rem] pk:items-center pk:gap-1.5 pk:px-2.5 pk:py-1.5 pk:text-[12px] pk:leading-5 pk:text-[var(--editor-muted-foreground)]">
      <span
        className="pk:min-w-2 pk:whitespace-pre-wrap pk:break-words"
        dangerouslySetInnerHTML={{ __html: tooltipHtml }}
      />
      {isEditable ? (
        <Button
          variant="ghost"
          size="icon"
          className="pk:h-5 pk:w-5 pk:shrink-0 pk:rounded-md pk:p-0 pk:text-neutral-500 pk:hover:bg-neutral-100 pk:hover:text-neutral-800"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            handleOpenEdit()
          }}
        >
          <PencilLine className="pk:h-3 pk:w-3 [stroke-width:1.9]" />
        </Button>
      ) : null}
    </div>
  )

  function handleSubmit(value: string) {
    if (!anchorRef.current) {
      return
    }

    updateTooltipMark(view, anchorRef.current, value)
  }

  function handleRemove() {
    if (!anchorRef.current) {
      return
    }

    removeTooltipMark(view, anchorRef.current)
  }

  return (
    <>
      {!isTouchReadonly ? (
        <EditorHoverPopover
          disabled={editOpen}
          hoverDelay={150}
          closeDelay={150}
          side="top"
          align="center"
          sideOffset={8}
          popupClassName="pk:z-[1500] pk:flex pk:max-w-[20rem] pk:items-center pk:gap-1.5 pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-2.5 pk:py-1.5 pk:text-[12px] pk:leading-5 pk:text-[var(--editor-muted-foreground)] pk:shadow-md pk:outline-none"
          content={popupContent}
        >
          <span
            ref={anchorRef}
            className="pk:inline pk:cursor-help pk:border-b pk:border-dotted pk:border-neutral-400 pk:transition-colors pk:hover:border-neutral-600"
            data-tooltip-id={tooltipId}
            onFocus={handleOpen}
            onBlur={handleClose}
          >
            <span
              ref={contentRef}
              className="pk:inline"
            />
          </span>
        </EditorHoverPopover>
      ) : (
        <span
          ref={anchorRef}
          className="pk:inline pk:cursor-help pk:border-b pk:border-dotted pk:border-neutral-400 pk:transition-colors pk:hover:border-neutral-600"
          data-tooltip-id={tooltipId}
          onClick={isTouchReadonly ? handleToggle : undefined}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          onFocus={handleOpen}
          onBlur={handleClose}
        >
          <span
            ref={contentRef}
            className="pk:inline"
          />
        </span>
      )}
      {isTouchReadonly && anchorRef.current ? (
        <EditorFloatingPopover
          anchor={anchorRef}
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              handleClose()
            }
          }}
          side="top"
          align="center"
          sideOffset={8}
          popupClassName="pk:z-[1500] pk:flex pk:max-w-[20rem] pk:items-center pk:gap-1.5 pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-2.5 pk:py-1.5 pk:text-[12px] pk:leading-5 pk:text-[var(--editor-muted-foreground)] pk:shadow-md pk:outline-none"
          content={popupContent}
        />
      ) : null}
      <TooltipEditPopover
        anchor={editAnchor}
        open={editOpen}
        initialValue={tooltip}
        focusRef={anchorRef}
        onClose={handleCloseEdit}
        onSubmit={handleSubmit}
        onRemove={handleRemove}
      />
    </>
  )
}
