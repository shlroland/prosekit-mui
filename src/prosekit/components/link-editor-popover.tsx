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
    <span className="w-10 shrink-0 text-sm text-[var(--editor-muted-foreground)]">
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
    <fieldset className="flex items-center gap-3">
      <legend className="w-10 shrink-0 text-sm text-[var(--editor-muted-foreground)]">
        {label}
      </legend>
      <div className="flex flex-wrap items-center gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-[var(--editor-foreground)]"
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-3.5 w-3.5 accent-[var(--editor-primary)]"
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
      className="grid w-[350px] gap-3 rounded-lg border border-[var(--editor-border)] bg-white p-4 shadow-[0_12px_32px_rgba(23,23,23,0.14)]"
      data-editor-floating
    >
      <label className="flex items-start gap-3">
        <FieldLabel>地址</FieldLabel>
        <div className="grid min-w-0 flex-1 gap-1">
          <input
            ref={inputRef}
            value={href}
            placeholder="https://example.com"
            required
            className="h-9 w-full rounded-md border border-[var(--editor-border)] bg-white px-2.5 text-sm text-[var(--editor-foreground)] outline-none focus:ring-2 focus:ring-[var(--editor-ring)]"
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
            <span className="text-xs text-red-600">请输入有效的链接地址</span>
          ) : null}
        </div>
      </label>

      {showAdvancedOptions ? (
        <>
          <label className="flex items-center gap-3">
            <FieldLabel>标题</FieldLabel>
            <input
              value={title}
              placeholder="链接标题（可选）"
              className="h-9 min-w-0 flex-1 rounded-md border border-[var(--editor-border)] bg-white px-2.5 text-sm text-[var(--editor-foreground)] outline-none focus:ring-2 focus:ring-[var(--editor-ring)]"
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

      <div className="flex items-center gap-2">
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
