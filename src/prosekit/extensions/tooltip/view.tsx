import { PencilLine } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactMarkViewProps } from 'prosekit/react'

import { Button, EditorFloatingPopover, EditorHoverPopover } from '../../../ui'
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
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

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

  const popupContent = tooltip ? (
    <div className="pk:flex pk:max-w-[20rem] pk:items-center pk:gap-1.5 pk:px-2.5 pk:py-1.5 pk:text-[12px] pk:leading-5 pk:text-[var(--editor-muted-foreground)]">
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
  ) : null

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
      {!isTouchReadonly && tooltip ? (
        <EditorHoverPopover
          disabled={editOpen}
          hoverDelay={150}
          closeDelay={150}
          side="top"
          align="center"
          sideOffset={8}
          popupClassName="prosekit-tooltip-mark-popup"
          content={popupContent}
        >
          <span
            ref={anchorRef}
            className="prosekit-tooltip-mark"
            onFocus={handleOpen}
            onBlur={handleClose}
          >
            <span
              ref={contentRef}
              className="prosekit-tooltip-mark-content"
            />
          </span>
        </EditorHoverPopover>
      ) : (
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
          popupClassName="prosekit-tooltip-mark-popup"
          content={popupContent}
        />
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
