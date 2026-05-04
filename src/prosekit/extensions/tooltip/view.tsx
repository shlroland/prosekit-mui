import { Box, Tooltip } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactMarkViewProps } from 'prosekit/react'

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

  return (
    <Tooltip
      arrow
      title={
        tooltip ? (
          <Box component="span" className="prosekit-tooltip-mark-text">
            {tooltip}
          </Box>
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
  )
}
