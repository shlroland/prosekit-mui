import { PencilLine } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactMarkViewProps } from 'prosekit/react'

import { Button } from '../../../ui'
import { TooltipEditPopover } from './edit-popover'
import { updateTooltipMark } from './utils'
import './tooltip-view.css'

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
  const popupRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const tooltip = useMemo(() => {
    const value = mark.attrs.tooltip
    return typeof value === 'string' ? value.trim() : ''
  }, [mark.attrs.tooltip])

  const isEditable = view.editable
  const isTouchReadonly = !isEditable && isTouchDevice

  useEffect(() => {
    setIsTouchDevice(isTouchLikeDevice())
  }, [])

  useEffect(() => {
    if (isEditable && tooltip === '') {
      setEditOpen(true)
    }
  }, [isEditable, tooltip])

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      return
    }

    const rect = anchorRef.current.getBoundingClientRect()
    setPosition({
      top: Math.max(8, rect.top - 8),
      left: rect.left + rect.width / 2,
    })
  }, [open, tooltip])

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
    setOpen(false)
    setEditOpen(true)
  }

  function handleCloseEdit() {
    setEditOpen(false)
  }

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

    updateTooltipMark(view, anchorRef.current, '')
  }

  return (
    <>
      <span
        ref={anchorRef}
        className="prosekit-tooltip-mark"
        onClick={isTouchReadonly ? handleToggle : undefined}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        <span
          ref={contentRef}
          className="prosekit-tooltip-mark-content"
        />
      </span>
      {tooltip && open ? (
        <div
          ref={popupRef}
          className="prosekit-tooltip-mark-popup"
          style={{
            top: position.top,
            left: position.left,
          }}
          data-editor-floating
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          <span className="prosekit-tooltip-mark-text">
            {tooltip}
          </span>
          {isEditable ? (
            <Button
              variant="ghost"
              size="icon"
              className="prosekit-tooltip-mark-edit-button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                handleOpenEdit()
              }}
            >
              <PencilLine className="prosekit-tooltip-mark-edit-icon" />
            </Button>
          ) : null}
        </div>
      ) : null}
      <TooltipEditPopover
        anchorEl={anchorRef.current}
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
