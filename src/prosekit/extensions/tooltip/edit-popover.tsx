import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react'

import { Button, EditorFloatingPopover } from '../../../ui'

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (!open) {
      return
    }

    setValue(initialValue)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    })
  }, [initialValue, open])

  function handleSubmit() {
    onSubmit(value)
    onClose()
  }

  function handleRemove() {
    onRemove()
    onClose()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
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

  if (!anchorEl) {
    return null
  }

  return (
    <EditorFloatingPopover
      anchor={anchorEl}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose()
        }
      }}
      side="bottom"
      align="start"
      sideOffset={8}
      popupClassName="prosekit-tooltip-edit-popper prosekit-tooltip-edit-paper"
      initialFocus={textareaRef}
      finalFocus={false}
      content={
        <div className="pk:grid pk:gap-3">
          <textarea
            ref={textareaRef}
            rows={3}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Input tooltip text"
            className="prosekit-tooltip-edit-input"
          />
          <div className="pk:flex pk:items-center pk:justify-between pk:gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="prosekit-tooltip-edit-remove"
              onClick={handleRemove}
            >
              Remove
            </Button>
            <div className="pk:flex pk:items-center pk:gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="prosekit-tooltip-edit-cancel"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="prosekit-tooltip-edit-submit"
                onClick={handleSubmit}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      }
    />
  )
}
