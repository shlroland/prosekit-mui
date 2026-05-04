import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import { PencilLine } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactMarkViewProps } from 'prosekit/react'

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
      <Tooltip
        arrow
        title={
          tooltip ? (
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Box component="span" className="prosekit-tooltip-mark-text">
                {tooltip}
              </Box>
              {isEditable ? (
                <IconButton
                  size="small"
                  className="prosekit-tooltip-mark-edit-button"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleOpenEdit()
                  }}
                >
                  <PencilLine className="prosekit-tooltip-mark-edit-icon" />
                </IconButton>
              ) : null}
            </Stack>
          ) : (
            ''
          )
        }
        open={tooltip ? open : false}
        onOpen={handleOpen}
        onClose={handleClose}
        disableHoverListener={isTouchReadonly}
        disableFocusListener={isTouchReadonly}
        disableTouchListener={isTouchReadonly}
        placement="top"
        slotProps={{
          tooltip: {
            className: 'prosekit-tooltip-mark-popup',
          },
          arrow: {
            className: 'prosekit-tooltip-mark-arrow',
          },
        }}
      >
        <Box
          ref={anchorRef}
          component="span"
          className="prosekit-tooltip-mark"
          onClick={isTouchReadonly ? handleToggle : undefined}
        >
          <Box
            ref={contentRef}
            component="span"
            className="prosekit-tooltip-mark-content"
          />
        </Box>
      </Tooltip>
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
