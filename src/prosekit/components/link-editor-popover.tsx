import { PopoverPopup, PopoverPositioner, PopoverRoot, PopoverTrigger } from 'prosekit/react/popover'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../../ui'

export type LinkEditorType = 'text' | 'icon' | 'block'
export type LinkEditorTarget = '_blank' | '_self'

export type LinkEditorSubmitValue = {
  href: string
  title: string
  type: LinkEditorType
  target: LinkEditorTarget
}

export type LinkEditorPopoverProps = {
  children?: ReactNode
  triggerStyle?: CSSProperties
  open: boolean
  onClose: () => void
  onSubmit: (value: LinkEditorSubmitValue) => void
  onRemove?: () => void
  initialHref?: string
  initialTitle?: string
  initialType?: LinkEditorType
  initialTarget?: LinkEditorTarget
  showAdvancedOptions?: boolean
  submitLabel?: string
}

export type LinkEditorPanelProps = Omit<LinkEditorPopoverProps, 'children' | 'triggerStyle'>

const linkTypeOptions: Array<{ value: LinkEditorType; label: string }> = [
  { value: 'text', label: '文字' },
  { value: 'icon', label: '图标文字' },
  { value: 'block', label: '卡片' },
]

const targetOptions: Array<{ value: LinkEditorTarget; label: string }> = [
  { value: '_blank', label: '新窗口' },
  { value: '_self', label: '当前窗口' },
]

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="pk:w-10 pk:shrink-0 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
      {children}
    </span>
  )
}

function RadioRow<Value extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: Value
  options: Array<{ value: Value; label: string }>
  onChange: (value: Value) => void
}) {
  return (
    <fieldset className="pk:flex pk:items-center pk:gap-3">
      <legend className="pk:w-10 pk:shrink-0 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
        {label}
      </legend>
      <div className="pk:flex pk:flex-wrap pk:items-center pk:gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="pk:inline-flex pk:cursor-pointer pk:items-center pk:gap-1.5 pk:text-sm pk:text-[var(--editor-foreground)]"
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="pk:h-3.5 pk:w-3.5 pk:accent-[var(--editor-primary)]"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function LinkEditorPanel({
  open,
  onClose,
  onSubmit,
  onRemove,
  initialHref = '',
  initialTitle = '',
  initialType = 'icon',
  initialTarget = '_blank',
  showAdvancedOptions = false,
  submitLabel = '保存链接',
}: LinkEditorPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [href, setHref] = useState(initialHref)
  const [title, setTitle] = useState(initialTitle)
  const [type, setType] = useState<LinkEditorType>(initialType)
  const [target, setTarget] = useState<LinkEditorTarget>(initialTarget)

  useEffect(() => {
    if (!open) {
      return
    }

    setHref(initialHref)
    setTitle(initialTitle)
    setType(initialType)
    setTarget(initialTarget)
  }, [initialHref, initialTarget, initialTitle, initialType, open])

  useEffect(() => {
    if (!open) {
      return
    }

    inputRef.current?.focus()
    inputRef.current?.select()
  }, [open])

  function handleSubmit() {
    if (!href.trim()) {
      return
    }

    onSubmit({
      href: href.trim(),
      title: title.trim(),
      type,
      target,
    })
  }

  return (
    <div
      className="pk:grid pk:w-[350px] pk:gap-3 pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-white pk:p-4 pk:shadow-[0_12px_32px_rgba(23,23,23,0.14)]"
      data-editor-floating
    >
      <label className="pk:flex pk:items-start pk:gap-3">
        <FieldLabel>地址</FieldLabel>
        <div className="pk:grid pk:min-w-0 pk:flex-1 pk:gap-1">
          <input
            ref={inputRef}
            value={href}
            placeholder="https://example.com"
            required
            className="pk:h-9 pk:w-full pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-white pk:px-2.5 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
            onChange={(event) => setHref(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
              }

              if (event.key === 'Enter') {
                event.preventDefault()
                handleSubmit()
              }
            }}
          />
          {href.length > 0 && !href.trim() ? (
            <span className="pk:text-xs pk:text-red-600">请输入有效的链接地址</span>
          ) : null}
        </div>
      </label>

      {showAdvancedOptions ? (
        <>
          <label className="pk:flex pk:items-center pk:gap-3">
            <FieldLabel>标题</FieldLabel>
            <input
              value={title}
              placeholder="链接标题（可选）"
              className="pk:h-9 pk:min-w-0 pk:flex-1 pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-white pk:px-2.5 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <RadioRow
            label="风格"
            value={type}
            options={linkTypeOptions}
            onChange={setType}
          />
          <RadioRow
            label="打开"
            value={target}
            options={targetOptions}
            onChange={setTarget}
          />
        </>
      ) : null}

      <div className="pk:flex pk:items-center pk:gap-2">
        {onRemove ? (
          <Button
            size="sm"
            variant="ghost"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onRemove}
          >
            取消链接
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClose}
        >
          取消
        </Button>
        <Button
          size="sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleSubmit}
          disabled={!href.trim()}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export function LinkEditorPopover({
  children,
  triggerStyle,
  open,
  onClose,
  ...panelProps
}: LinkEditorPopoverProps) {
  return (
      <PopoverRoot
      style={{ display: 'contents' }}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <PopoverTrigger style={triggerStyle}>{children}</PopoverTrigger>
      <PopoverPositioner placement="bottom" offset={8} hoist>
        <PopoverPopup className="prosekit-link-editor-popover">
          <LinkEditorPanel open={open} onClose={onClose} {...panelProps} />
        </PopoverPopup>
      </PopoverPositioner>
    </PopoverRoot>
  )
}
