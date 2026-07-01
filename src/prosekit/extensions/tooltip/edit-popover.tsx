import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react'

import {
  Button,
  EditorFloatingPopover,
  type EditorFloatingPopoverProps,
} from '../../../ui'

export type TooltipEditPopoverProps = {
  anchor: EditorFloatingPopoverProps['anchor']
  open: boolean
  initialValue: string
  focusRef?: RefObject<HTMLElement | null>
  onClose: () => void
  onSubmit: (value: string) => void
  onRemove: () => void
}

export function TooltipEditPopover({
  anchor,
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
    const nextValue = value.trim()
    onSubmit(nextValue)
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
    focusRef?.current?.focus()
  }

  if (!anchor) {
    return null
  }

  return (
    <EditorFloatingPopover
      anchor={anchor}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose()
        }
      }}
      side="bottom"
      align="start"
      sideOffset={8}
      popupClassName="pk:z-[1500] pk:w-[320px] pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-3 pk:shadow-[0_12px_32px_rgba(15,23,42,0.14)] pk:outline-none"
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
            placeholder="输入鼠标悬停时显示的提示文本"
            className="pk:max-h-48 pk:min-h-20 pk:resize-y pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-2.5 pk:py-2 pk:text-[13px] pk:leading-5 pk:text-[var(--editor-foreground)] pk:outline-none pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
          />
          <div className="pk:flex pk:items-center pk:justify-between pk:gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="pk:min-h-8 pk:rounded-md pk:px-2.5 pk:text-[12px] pk:text-red-600"
              onClick={handleRemove}
            >
              移除
            </Button>
            <div className="pk:flex pk:items-center pk:gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="pk:min-h-8 pk:rounded-md pk:px-2.5 pk:text-[12px] pk:text-neutral-600"
                onClick={handleClose}
              >
                取消
              </Button>
              <Button
                size="sm"
                className="pk:min-h-8 pk:rounded-md pk:px-3 pk:text-[12px] pk:shadow-none"
                onClick={handleSubmit}
              >
                应用
              </Button>
            </div>
          </div>
        </div>
      }
    />
  )
}
