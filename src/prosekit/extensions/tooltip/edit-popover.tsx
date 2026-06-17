import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react'

import { Button } from '../../../ui'

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
  const popupRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [value, setValue] = useState(initialValue)

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      return
    }

    const rect = anchorEl.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
    })
  }, [anchorEl, open])

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

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (popupRef.current?.contains(target) || anchorEl?.contains(target)) {
        return
      }

      handleClose()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [anchorEl, open])

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

  if (!open || !anchorEl) {
    return null
  }

  return (
    <div
      ref={popupRef}
      className="prosekit-tooltip-edit-popper"
      style={{
        top: position.top,
        left: position.left,
      }}
      data-editor-floating
    >
      <div className="prosekit-tooltip-edit-paper">
        <div className="grid gap-3">
          <textarea
            ref={textareaRef}
            rows={3}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Input tooltip text"
            className="prosekit-tooltip-edit-input"
          />
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="prosekit-tooltip-edit-remove"
              onClick={handleRemove}
            >
              Remove
            </Button>
            <div className="flex items-center gap-2">
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
      </div>
    </div>
  )
}
