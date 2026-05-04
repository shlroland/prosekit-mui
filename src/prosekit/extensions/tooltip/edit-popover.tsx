import { Button, ClickAwayListener, Paper, Popper, Stack, TextField } from '@mui/material'
import { useEffect, useState, type KeyboardEvent, type RefObject } from 'react'

export type TooltipEditPopoverProps = {
  anchorEl: HTMLElement | null
  open: boolean
  initialValue: string
  focusRef: RefObject<HTMLElement | null>
  onClose: () => void
  onSubmit: (value: string) => void
  onRemove: () => void
}

export function TooltipEditPopover({
  anchorEl,
  open,
  initialValue,
  focusRef,
  onClose,
  onSubmit,
  onRemove,
}: TooltipEditPopoverProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (open) {
      setValue(initialValue)
    }
  }, [initialValue, open])

  function handleSubmit() {
    onSubmit(value)
    onClose()
  }

  function handleRemove() {
    onRemove()
    onClose()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  function handleClose() {
    onClose()
    focusRef.current?.focus()
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      className="prosekit-tooltip-edit-popper"
    >
      <ClickAwayListener onClickAway={handleClose}>
        <Paper className="prosekit-tooltip-edit-paper">
          <Stack spacing={1.25}>
            <TextField
              multiline
              minRows={3}
              maxRows={8}
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Input tooltip text"
              slotProps={{
                input: {
                  className: 'prosekit-tooltip-edit-input',
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Button
                size="small"
                className="prosekit-tooltip-edit-remove"
                onClick={handleRemove}
              >
                Remove
              </Button>
              <Stack direction="row" gap={1}>
                <Button
                  size="small"
                  className="prosekit-tooltip-edit-cancel"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  className="prosekit-tooltip-edit-submit"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </ClickAwayListener>
    </Popper>
  )
}
